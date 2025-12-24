from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q

from .models import TestAttempt
from .serializers import (
    TestAttemptSerializer,
    TestAttemptCreateSerializer,
    TestAttemptSaveSerializer,
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
        
        # Check max attempts
        user_attempts = TestAttempt.objects.filter(
            user=request.user,
            test=test
        ).count()
        
        if user_attempts >= test.max_attempts:
            return Response(
                {'error': f'Maximum attempts ({test.max_attempts}) reached'},
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
        
        # Update answers
        attempt.answers = serializer.validated_data['answers']
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

