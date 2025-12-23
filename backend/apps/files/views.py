from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import File
from .serializers import FileSerializer
from apps.accounts.permissions import IsAdminOrReadOnly


class FileViewSet(viewsets.ModelViewSet):
    """File ViewSet"""
    queryset = File.objects.select_related('uploaded_by').all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['file_type', 'uploaded_by']
    search_fields = ['name']
    ordering_fields = ['uploaded_at', 'name', 'size']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        """Filter files by user unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_admin:
            queryset = queryset.filter(uploaded_by=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Set uploaded_by to current user"""
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['get', 'post'], url_path='upload')
    def upload(self, request):
        """Upload file endpoint"""
        if request.method == 'GET':
            # List files
            files = self.get_queryset()
            serializer = self.get_serializer(files, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Upload file
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file_obj = request.FILES['file']
            name = request.data.get('name', file_obj.name)
            
            file_instance = File.objects.create(
                name=name,
                file=file_obj,
                uploaded_by=request.user
            )
            
            serializer = self.get_serializer(file_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

