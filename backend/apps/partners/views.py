from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Partner
from .serializers import PartnerSerializer, PartnerDetailSerializer, PartnerCreateUpdateSerializer
from apps.accounts.permissions import IsAdminOrPublicReadOnly


class PartnerViewSet(viewsets.ModelViewSet):
    """ViewSet для партнеров"""
    queryset = Partner.objects.filter(is_active=True)
    permission_classes = [IsAdminOrPublicReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PartnerCreateUpdateSerializer
        if self.action == 'retrieve':
            return PartnerDetailSerializer
        return PartnerSerializer
    
    def get_serializer_context(self):
        """Передает request в контекст сериализатора для генерации абсолютных URL"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Возвращает только активных партнеров для публичного доступа"""
        queryset = Partner.objects.all()
        if self.request.user.is_authenticated and self.request.user.is_admin:
            # Админы видят всех партнеров
            return queryset
        # Публичный доступ - только активные
        return queryset.filter(is_active=True)

