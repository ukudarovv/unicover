from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict

from apps.accounts.models import User
from apps.courses.models import Course, CourseEnrollment
from apps.exams.models import TestAttempt
from apps.certificates.models import Certificate
from apps.accounts.permissions import IsAdmin


class AnalyticsViewSet(viewsets.ViewSet):
    """Analytics ViewSet"""
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get general statistics"""
        total_students = User.objects.filter(role='student').count()
        active_students = User.objects.filter(
            role='student',
            enrollments__status__in=['in_progress', 'exam_available']
        ).distinct().count()
        
        active_courses = Course.objects.filter(status__in=['assigned', 'in_progress']).count()
        completed_courses = CourseEnrollment.objects.filter(status='completed').count()
        
        today = timezone.now().date()
        tests_today = TestAttempt.objects.filter(started_at__date=today).count()
        
        # Success rate
        total_attempts = TestAttempt.objects.filter(completed_at__isnull=False).count()
        passed_attempts = TestAttempt.objects.filter(completed_at__isnull=False, passed=True).count()
        success_rate = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        # Average score
        avg_score = TestAttempt.objects.filter(
            completed_at__isnull=False,
            score__isnull=False
        ).aggregate(avg=Avg('score'))['avg'] or 0
        
        total_certificates = Certificate.objects.count()
        this_month = timezone.now().replace(day=1)
        certificates_this_month = Certificate.objects.filter(issued_at__gte=this_month).count()
        
        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'active_courses': active_courses,
            'completed_courses': completed_courses,
            'tests_today': tests_today,
            'success_rate': round(success_rate, 2),
            'avg_score': round(avg_score, 2),
            'total_certificates': total_certificates,
            'certificates_this_month': certificates_this_month,
        })
    
    @action(detail=False, methods=['get'])
    def enrollment_trend(self, request):
        """Get enrollment trend over months"""
        six_months_ago = timezone.now() - timedelta(days=180)
        enrollments = CourseEnrollment.objects.filter(
            enrolled_at__gte=six_months_ago
        ).extra(
            select={'month': "strftime('%%Y-%%m', enrolled_at)"}
        ).values('month').annotate(
            students=Count('user', distinct=True)
        ).order_by('month')
        
        result = []
        for item in enrollments:
            result.append({
                'month': item['month'],
                'students': item['students']
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def test_results_distribution(self, request):
        """Get test results distribution"""
        attempts = TestAttempt.objects.filter(
            completed_at__isnull=False,
            score__isnull=False
        )
        
        distribution = {
            '0-50': attempts.filter(score__lt=50).count(),
            '50-70': attempts.filter(score__gte=50, score__lt=70).count(),
            '70-85': attempts.filter(score__gte=70, score__lt=85).count(),
            '85-100': attempts.filter(score__gte=85).count(),
        }
        
        colors = {
            '0-50': '#ef4444',
            '50-70': '#f59e0b',
            '70-85': '#3b82f6',
            '85-100': '#10b981',
        }
        
        result = []
        for key, value in distribution.items():
            result.append({
                'name': key,
                'value': value,
                'color': colors[key]
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def courses_popularity(self, request):
        """Get courses popularity"""
        courses = Course.objects.annotate(
            students=Count('enrollments', distinct=True)
        ).order_by('-students')[:10]
        
        result = []
        for course in courses:
            result.append({
                'name': course.title,
                'students': course.students
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def top_students(self, request):
        """Get top students"""
        students = User.objects.filter(role='student').annotate(
            courses_count=Count('enrollments', distinct=True),
            certificates_count=Count('certificates', distinct=True)
        )
        
        # Calculate average score
        top_students = []
        for student in students:
            attempts = TestAttempt.objects.filter(
                user=student,
                completed_at__isnull=False,
                score__isnull=False
            )
            avg_score = attempts.aggregate(avg=Avg('score'))['avg'] or 0
            
            top_students.append({
                'id': str(student.id),
                'name': student.full_name or student.phone,
                'rank': 0,  # Will be set after sorting
                'courses': student.courses_count,
                'avg_score': round(avg_score, 2),
                'certificates': student.certificates_count,
            })
        
        # Sort by avg_score and courses
        top_students.sort(key=lambda x: (x['avg_score'], x['courses']), reverse=True)
        
        # Set ranks
        for i, student in enumerate(top_students[:10], 1):
            student['rank'] = i
        
        return Response(top_students[:10])

