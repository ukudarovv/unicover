from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import ContactMessage
from .serializers import (
    ContactMessageSerializer,
    ContactMessageCreateSerializer,
    ContactMessageUpdateSerializer
)
from apps.accounts.permissions import IsAdmin


class ContactMessageViewSet(viewsets.ModelViewSet):
    """Contact message ViewSet"""
    queryset = ContactMessage.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'direction']
    search_fields = ['name', 'email', 'phone', 'company', 'message']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContactMessageCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ContactMessageUpdateSerializer
        return ContactMessageSerializer
    
    def get_permissions(self):
        """Allow anonymous users to create messages, only admins can read/update"""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdmin()]
    
    def perform_create(self, serializer):
        """Create new message with default status"""
        serializer.save(status='new')

