from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import ProjectCategory, Project, ProjectImage
from .serializers import (
    ProjectCategorySerializer,
    ProjectSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
    ProjectImageSerializer,
)
from apps.accounts.permissions import IsAdminOrReadOnly


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    """Project category ViewSet"""
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    
    def get_permissions(self):
        """Allow public read access, require admin for write"""
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]
    filter_backends = [OrderingFilter]
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']
    
    def get_queryset(self):
        """Filter active categories for public, all for admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or not getattr(self.request.user, 'is_admin', False):
            queryset = queryset.filter(is_active=True)
        return queryset


class ProjectViewSet(viewsets.ModelViewSet):
    """Project ViewSet"""
    queryset = Project.objects.all().select_related('category').prefetch_related('gallery_images')
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_permissions(self):
        """Allow public read access, require admin for write"""
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'year', 'is_published']
    search_fields = ['title', 'description', 'full_description', 'location']
    ordering_fields = ['year', 'order', 'created_at']
    ordering = ['order', '-year', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        """Filter published projects for public, all for admin"""
        queryset = super().get_queryset()
        
        # For non-admin users, show only published projects
        if not self.request.user.is_authenticated or not getattr(self.request.user, 'is_admin', False):
            queryset = queryset.filter(is_published=True)
        
        # Filter by category ID if provided
        category_id = self.request.query_params.get('category_id', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to ensure proper context is passed"""
        instance = self.get_object()
        
        # Log for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Retrieving project {instance.id}")
        logger.info(f"Gallery images count: {instance.gallery_images.count()}")
        
        # Ensure context with request is passed to serializer
        serializer = self.get_serializer(instance, context={'request': request})
        
        # Log serialized data
        data = serializer.data
        logger.info(f"Serialized gallery_images count: {len(data.get('gallery_images', []))}")
        
        return Response(data)
    
    def create(self, request, *args, **kwargs):
        """Override create to handle file uploads properly"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        
        # Use detail serializer for response to include image_url
        response_serializer = ProjectDetailSerializer(project, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Override update to handle file uploads properly"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Log request data for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Update project {instance.id}:")
        logger.info(f"  request.FILES: {list(request.FILES.keys())}")
        logger.info(f"  request.data keys: {list(request.data.keys())}")
        if 'image' in request.FILES:
            logger.info(f"  Image file: {request.FILES['image'].name}, size: {request.FILES['image'].size}")
        else:
            logger.info(f"  No image file in request.FILES")
        
        # Create serializer with instance and data
        # DRF will automatically merge request.FILES into request.data for file fields
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Save the project - if image is not in request.FILES, it won't be updated
        project = serializer.save()
        
        logger.info(f"  Project saved. Image: {project.image.name if project.image else 'None'}")
        
        # Use detail serializer for response to include image_url
        response_serializer = ProjectDetailSerializer(project, context={'request': request})
        return Response(response_serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to handle file uploads properly"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Add image to project gallery"""
        project = self.get_object()
        
        # Check if image file exists
        if 'image' not in request.FILES:
            return Response(
                {'error': 'Image file is required. No file found in request.FILES'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES.get('image')
        
        if not image_file:
            return Response({'error': 'Image file is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get order from request data (can be from FormData or POST data)
        order = request.data.get('order', 0)
        try:
            order = int(order)
        except (ValueError, TypeError):
            order = 0
        
        try:
            project_image = ProjectImage.objects.create(
                project=project,
                image=image_file,
                order=order
            )
            
            serializer = ProjectImageSerializer(project_image, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            error_detail = str(e)
            traceback.print_exc()
            return Response(
                {'error': f'Failed to save image: {error_detail}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def remove_image(self, request, pk=None, image_id=None):
        """Remove image from project gallery"""
        project = self.get_object()
        
        try:
            image = ProjectImage.objects.get(id=image_id, project=project)
            image.delete()
            return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
        except ProjectImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
