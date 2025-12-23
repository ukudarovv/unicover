from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Notification
from .serializers import NotificationSerializer
from apps.accounts.permissions import IsOwnerOrAdmin


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notification ViewSet"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['read', 'type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications by user"""
        queryset = super().get_queryset()
        if not self.request.user.is_admin:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    @action(detail=True, methods=['put'])
    def read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        
        # Check permission
        if notification.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.read = True
        notification.save()
        
        return Response(NotificationSerializer(notification).data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(read=False)
        count = notifications.update(read=True)
        
        return Response({
            'message': f'Marked {count} notifications as read'
        }, status=status.HTTP_200_OK)

