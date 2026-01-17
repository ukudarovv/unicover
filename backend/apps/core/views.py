from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ContentPage
from .serializers import ContentPageSerializer, ContentPageUpdateSerializer
from .utils import get_request_language


class ContentPageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing content pages"""
    queryset = ContentPage.objects.all()
    serializer_class = ContentPageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ContentPageUpdateSerializer
        return ContentPageSerializer
    
    def get_permissions(self):
        """Only admins can modify content pages, anyone can read"""
        if self.action in ['list', 'retrieve', 'get_by_type']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<page_type>[^/.]+)')
    def get_by_type(self, request, page_type=None):
        """Get content page by type with language support"""
        try:
            page = ContentPage.objects.get(page_type=page_type)
            
            # Get language from request
            lang = get_request_language(request)
            
            # Get content for the requested language
            content = page.get_content(lang)
            
            return Response({
                'page_type': page.page_type,
                'content': content,
                'language': lang,
                'updated_at': page.updated_at,
            }, status=status.HTTP_200_OK)
        except ContentPage.DoesNotExist:
            # Return default empty content if page doesn't exist
            pass
        except Exception:
            # If table doesn't exist yet or other DB error, return default content
            pass
        
        # Default content for both DoesNotExist and other exceptions
        default_content = {
            'terms': {
                'ru': 'Условия использования будут добавлены позже.',
                'kz': 'Пайдалану шарттары кейінірек қосылады.',
                'en': 'Terms of use will be added later.',
            },
            'privacy': {
                'ru': 'Политика конфиденциальности будет добавлена позже.',
                'kz': 'Құпиялылық саясаты кейінірек қосылады.',
                'en': 'Privacy policy will be added later.',
            }
        }
        lang = get_request_language(request)
        content_type = default_content.get(page_type, {}).get(lang, '')
        
        return Response({
            'page_type': page_type,
            'content': content_type,
            'language': lang,
            'updated_at': None,
        }, status=status.HTTP_200_OK)
