from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Category, Course, Module, Lesson, CourseEnrollment, LessonProgress
from .serializers import (
    CategorySerializer,
    CourseSerializer,
    CourseCreateUpdateSerializer,
    CourseEnrollmentSerializer,
    LessonProgressSerializer,
    LessonSerializer,
)
from apps.accounts.permissions import IsAdmin, IsAdminOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    """Category ViewSet"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'name_kz', 'name_en', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']


class CourseViewSet(viewsets.ModelViewSet):
    """Course ViewSet"""
    queryset = Course.objects.prefetch_related('modules__lessons').all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category__id']
    search_fields = ['title', 'title_kz', 'title_en', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseSerializer
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students enrolled in course"""
        course = self.get_object()
        enrollments = CourseEnrollment.objects.filter(course=course).select_related('user')
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll students in course"""
        course = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not isinstance(user_ids, list):
            return Response({'error': 'user_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        enrolled = []
        for user_id in user_ids:
            try:
                from apps.accounts.models import User
                user = User.objects.get(id=user_id)
                enrollment, created = CourseEnrollment.objects.get_or_create(
                    user=user,
                    course=course,
                    defaults={'status': 'assigned'}
                )
                if created:
                    enrolled.append(user_id)
            except User.DoesNotExist:
                continue
        
        return Response({
            'message': f'Enrolled {len(enrolled)} students',
            'enrolled': enrolled
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get current user's enrollments"""
        enrollments = CourseEnrollment.objects.filter(
            user=request.user
        ).select_related('course').prefetch_related('course__modules__lessons')
        
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """Lesson ViewSet (read-only)"""
    queryset = Lesson.objects.select_related('module__course').all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LessonSerializer
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark lesson as completed"""
        lesson = self.get_object()
        
        # Find user's enrollment for this course
        enrollment = CourseEnrollment.objects.filter(
            user=request.user,
            course=lesson.module.course
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update lesson progress
        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'completed': True, 'completed_at': timezone.now()}
        )
        
        if not created and not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()
        
        # Update course progress
        total_lessons = Lesson.objects.filter(module__course=enrollment.course).count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            completed=True
        ).count()
        
        enrollment.progress = int((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0)
        enrollment.save()
        
        return Response({
            'message': 'Lesson completed',
            'progress': enrollment.progress
        }, status=status.HTTP_200_OK)

