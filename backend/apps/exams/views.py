from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q

from .models import TestAttempt, ExtraAttemptRequest
from .serializers import (
    TestAttemptSerializer,
    TestAttemptCreateSerializer,
    TestAttemptSaveSerializer,
    ExtraAttemptRequestSerializer,
    ExtraAttemptRequestCreateSerializer,
    ExtraAttemptRequestProcessSerializer,
)
from apps.tests.models import Test
from apps.accounts.permissions import IsAdminOrReadOnly


class TestAttemptViewSet(viewsets.ModelViewSet):
    """Test attempt ViewSet"""
    queryset = TestAttempt.objects.select_related('test', 'user').all()
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = []
    
    def get_queryset(self):
        """Filter attempts by user unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_admin:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """Start a new test attempt"""
        serializer = TestAttemptCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        test_id = serializer.validated_data['test_id']
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check max attempts (including approved extra attempts)
        user_attempts = TestAttempt.objects.filter(
            user=request.user,
            test=test
        ).count()
        
        # Count approved extra attempt requests
        approved_extra_attempts = ExtraAttemptRequest.objects.filter(
            user=request.user,
            test=test,
            status='approved'
        ).count()
        
        max_allowed = test.max_attempts + approved_extra_attempts
        
        if user_attempts >= max_allowed:
            return Response(
                {'error': f'Maximum attempts ({max_allowed}) reached'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new attempt
        attempt = TestAttempt.objects.create(
            test=test,
            user=request.user,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response(
            TestAttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Save answers during test"""
        attempt = self.get_object()
        
        # Check if user owns this attempt
        if attempt.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already completed
        if attempt.completed_at:
            return Response(
                {'error': 'Test already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TestAttemptSaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update answers - объединяем с существующими ответами
        if not attempt.answers:
            attempt.answers = {}
        attempt.answers.update(serializer.validated_data['answers'])
        attempt.save()
        
        return Response(
            TestAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit test attempt and calculate score"""
        attempt = self.get_object()
        
        # Check if user owns this attempt
        if attempt.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already completed
        if attempt.completed_at:
            return Response(
                TestAttemptSerializer(attempt).data,
                status=status.HTTP_200_OK
            )
        
        # Calculate score
        score, passed = attempt.calculate_score()
        attempt.score = score
        attempt.passed = passed
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # Create notification if passed
        if passed:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=attempt.user,
                type='exam_passed',
                title='Тест пройден',
                message=f'Вы успешно прошли тест "{attempt.test.title}" с результатом {score:.1f}%'
            )
        else:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=attempt.user,
                type='exam_failed',
                title='Тест не пройден',
                message=f'Тест "{attempt.test.title}" не пройден. Ваш результат: {score:.1f}%'
            )
        
        return Response(
            TestAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def my_attempts(self, request):
        """Get current user's attempts"""
        attempts = TestAttempt.objects.filter(
            user=request.user
        ).select_related('test').order_by('-started_at')
        
        serializer = TestAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def test_attempts(self, request):
        """Get user's attempts for a specific test"""
        test_id = request.query_params.get('test_id')
        if not test_id:
            return Response(
                {'error': 'test_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        attempts = TestAttempt.objects.filter(
            user=request.user,
            test=test
        ).select_related('test').order_by('-started_at')
        
        serializer = TestAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ExtraAttemptRequestViewSet(viewsets.ModelViewSet):
    """Extra attempt request ViewSet"""
    queryset = ExtraAttemptRequest.objects.select_related('user', 'test', 'processed_by').all()
    serializer_class = ExtraAttemptRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter requests by user unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_admin:
            queryset = queryset.filter(user=self.request.user)
        else:
            # Admin can filter by status
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'create':
            return ExtraAttemptRequestCreateSerializer
        elif self.action in ['approve', 'reject']:
            return ExtraAttemptRequestProcessSerializer
        return ExtraAttemptRequestSerializer
    
    def create(self, request):
        """Create a new extra attempt request"""
        serializer = ExtraAttemptRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Неверные данные запроса', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        test_id = serializer.validated_data['test_id']
        reason = serializer.validated_data['reason']
        
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Тест не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if max attempts actually reached
        user_attempts = TestAttempt.objects.filter(
            user=request.user,
            test=test
        ).count()
        
        approved_extra_attempts = ExtraAttemptRequest.objects.filter(
            user=request.user,
            test=test,
            status='approved'
        ).count()
        
        max_allowed = test.max_attempts + approved_extra_attempts
        
        if user_attempts < max_allowed:
            return Response(
                {'error': f'У вас еще есть доступные попытки ({user_attempts} из {max_allowed} использовано)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create request
        extra_request = ExtraAttemptRequest.objects.create(
            user=request.user,
            test=test,
            reason=reason,
            status='pending'
        )
        
        # Create notification for admin
        from apps.notifications.models import Notification
        from apps.accounts.models import User
        admins = User.objects.filter(role='admin', is_active=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                type='extra_attempt_request',
                title='Новый запрос на дополнительные попытки',
                message=f'Студент {request.user.full_name or request.user.phone} запросил дополнительные попытки для теста "{test.title}"'
            )
        
        return Response(
            ExtraAttemptRequestSerializer(extra_request).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve extra attempt request (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        extra_request = self.get_object()
        
        if extra_request.status != 'pending':
            return Response(
                {'error': f'Request is already {extra_request.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Approve request
        extra_request.status = 'approved'
        extra_request.processed_by = request.user
        extra_request.processed_at = timezone.now()
        if request.data.get('admin_response'):
            extra_request.admin_response = request.data['admin_response']
        extra_request.save()
        
        # Create notification for student
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=extra_request.user,
            type='extra_attempt_approved',
            title='Запрос на дополнительные попытки одобрен',
            message=f'Ваш запрос на дополнительные попытки для теста "{extra_request.test.title}" был одобрен.'
        )
        
        return Response(
            ExtraAttemptRequestSerializer(extra_request).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """Reject extra attempt request (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        extra_request = self.get_object()
        
        if extra_request.status != 'pending':
            return Response(
                {'error': f'Request is already {extra_request.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ExtraAttemptRequestProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Reject request
        extra_request.status = 'rejected'
        extra_request.processed_by = request.user
        extra_request.processed_at = timezone.now()
        extra_request.admin_response = serializer.validated_data.get('admin_response', '')
        extra_request.save()
        
        # Create notification for student
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=extra_request.user,
            type='extra_attempt_rejected',
            title='Запрос на дополнительные попытки отклонен',
            message=f'Ваш запрос на дополнительные попытки для теста "{extra_request.test.title}" был отклонен.' + (
                f' Причина: {extra_request.admin_response}' if extra_request.admin_response else ''
            )
        )
        
        return Response(
            ExtraAttemptRequestSerializer(extra_request).data,
            status=status.HTTP_200_OK
        )

