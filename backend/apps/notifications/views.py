from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from django.db.models import Q

from apps.accounts.models import User
from apps.courses.models import Course
from apps.accounts.permissions import IsAdmin
from .utils import send_bulk_email, send_course_notification, send_course_reminder
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notification ViewSet"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for current user"""
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Apply read filter if provided
        read_filter = self.request.query_params.get('read')
        if read_filter is not None:
            read_value = read_filter.lower() == 'true'
            queryset = queryset.filter(read=read_value)
        
        # Admins can see all notifications
        if self.request.user.is_admin:
            queryset = Notification.objects.all()
            if read_filter is not None:
                read_value = read_filter.lower() == 'true'
                queryset = queryset.filter(read=read_value)
        
        return queryset


class BulkEmailViewSet(viewsets.ViewSet):
    """Bulk email sending ViewSet"""
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        """
        Send bulk email
        
        Request body:
        {
            "subject": "Email subject",
            "message": "Email message",
            "recipient_type": "all" | "students" | "enrolled" | "custom",
            "course_id": int (optional, for enrolled),
            "user_ids": [int] (optional, for custom),
            "html_message": str (optional)
        }
        """
        subject = request.data.get('subject')
        message = request.data.get('message')
        recipient_type = request.data.get('recipient_type', 'all')
        course_id = request.data.get('course_id')
        user_ids = request.data.get('user_ids', [])
        html_message = request.data.get('html_message')
        
        if not subject or not message:
            return Response(
                {'error': 'Subject and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get recipient list based on type
        recipient_list = []
        
        if recipient_type == 'all':
            users = User.objects.filter(email__isnull=False).exclude(email='')
            recipient_list = list(users.values_list('email', flat=True))
        
        elif recipient_type == 'students':
            users = User.objects.filter(
                role='student',
                email__isnull=False
            ).exclude(email='')
            recipient_list = list(users.values_list('email', flat=True))
        
        elif recipient_type == 'enrolled':
            if not course_id:
                return Response(
                    {'error': 'course_id is required for enrolled recipients'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                course = Course.objects.get(id=course_id)
                users = course.enrolled_students.filter(
                    email__isnull=False
                ).exclude(email='')
                recipient_list = list(users.values_list('email', flat=True))
            except Course.DoesNotExist:
                return Response(
                    {'error': 'Course not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        elif recipient_type == 'custom':
            if not user_ids:
                return Response(
                    {'error': 'user_ids is required for custom recipients'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            users = User.objects.filter(
                id__in=user_ids,
                email__isnull=False
            ).exclude(email='')
            recipient_list = list(users.values_list('email', flat=True))
        
        else:
            return Response(
                {'error': 'Invalid recipient_type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not recipient_list:
            return Response(
                {'error': 'No recipients found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send emails
        try:
            sent_count = send_bulk_email(
                subject=subject,
                message=message,
                recipient_list=recipient_list,
                html_message=html_message
            )
            
            return Response({
                'success': True,
                'sent_count': sent_count,
                'total_recipients': len(recipient_list)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def course_notification(self, request):
        """
        Send course notification email
        
        Request body:
        {
            "course_id": int,
            "subject": str (optional),
            "message": str (optional),
            "user_ids": [int] (optional)
        }
        """
        course_id = request.data.get('course_id')
        subject = request.data.get('subject')
        message = request.data.get('message')
        user_ids = request.data.get('user_ids')
        
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            course = Course.objects.get(id=course_id)
            sent_count = send_course_notification(
                course=course,
                subject=subject,
                message=message,
                user_ids=user_ids
            )
            
            return Response({
                'success': True,
                'sent_count': sent_count
            })
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def course_reminder(self, request):
        """
        Send course reminder email
        
        Request body:
        {
            "course_id": int,
            "days_before": int (default: 1),
            "user_ids": [int] (optional)
        }
        """
        course_id = request.data.get('course_id')
        days_before = request.data.get('days_before', 1)
        user_ids = request.data.get('user_ids')
        
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            course = Course.objects.get(id=course_id)
            sent_count = send_course_reminder(
                course=course,
                days_before=days_before,
                user_ids=user_ids
            )
            
            return Response({
                'success': True,
                'sent_count': sent_count
            })
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
