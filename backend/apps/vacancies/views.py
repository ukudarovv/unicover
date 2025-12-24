from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Vacancy
from .serializers import VacancySerializer, VacancyCreateUpdateSerializer
from apps.accounts.permissions import IsAdminOrReadOnly


class VacancyViewSet(viewsets.ModelViewSet):
    """Vacancy ViewSet"""
    queryset = Vacancy.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_active', 'employment_type', 'location']
    search_fields = ['title', 'description', 'requirements']
    ordering_fields = ['created_at', 'published_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return VacancyCreateUpdateSerializer
        return VacancySerializer
    
    def get_queryset(self):
        """Filter active published vacancies for public, all for admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or not self.request.user.is_admin:
            queryset = queryset.filter(is_active=True, status='published')
        return queryset
    
    def perform_create(self, serializer):
        """Set created_by to current user if authenticated"""
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

