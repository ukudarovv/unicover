from rest_framework import serializers
from .models import ProjectCategory, Project, ProjectImage


class ProjectCategorySerializer(serializers.ModelSerializer):
    """Project category serializer"""
    
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'name_kz', 'name_en', 'description', 'order', 'is_active']
        read_only_fields = ['id']


class ProjectImageSerializer(serializers.ModelSerializer):
    """Project image serializer"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'image_url', 'order']
        read_only_fields = ['id']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            try:
                return obj.image.url
            except ValueError:
                # ImageField может быть пустым
                return None
        return None


class ProjectSerializer(serializers.ModelSerializer):
    """Project serializer for list view"""
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    image_url = serializers.SerializerMethodField()
    gallery_images = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'category', 'category_id', 'location', 'year',
            'image', 'image_url', 'description', 'gallery_images',
            'is_published', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            try:
                return obj.image.url
            except ValueError:
                # ImageField может быть пустым
                return None
        return None
    
    def get_gallery_images(self, obj):
        images = obj.gallery_images.all().order_by('order', 'id')
        serializer = ProjectImageSerializer(images, many=True, context=self.context)
        return serializer.data


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Project create/update serializer"""
    category_id = serializers.IntegerField(required=False, allow_null=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Project
        fields = [
            'title', 'category_id', 'location', 'year', 'image',
            'description', 'full_description', 'characteristics',
            'timeline', 'team', 'is_published', 'order'
        ]
    
    def to_internal_value(self, data):
        """Handle characteristics as JSON string from FormData"""
        import json
        from django.http import QueryDict
        
        # For FormData, DRF automatically handles files separately in request.FILES
        # We need to handle non-file fields here, especially characteristics JSON field
        if isinstance(data, QueryDict):
            # Convert QueryDict to regular dict, taking first value for each key
            # Files are handled separately by DRF from request.FILES, so we skip them here
            mutable_data = {}
            for key, value in data.lists():
                # Skip file fields - they are handled separately by DRF in request.FILES
                if key != 'image':
                    mutable_data[key] = value[0] if isinstance(value, list) and len(value) > 0 else value
        elif isinstance(data, dict):
            mutable_data = data.copy()
        else:
            mutable_data = data
        
        # Handle characteristics JSON field from FormData
        if 'characteristics' in mutable_data:
            characteristics = mutable_data.get('characteristics')
            if isinstance(characteristics, str):
                try:
                    if characteristics.strip():  # Only parse if not empty
                        mutable_data['characteristics'] = json.loads(characteristics)
                    else:
                        mutable_data['characteristics'] = {}
                except (json.JSONDecodeError, ValueError, TypeError):
                    # If parsing fails, use empty dict
                    mutable_data['characteristics'] = {}
        
        # Call parent to_internal_value - DRF will automatically merge files from request.FILES
        return super().to_internal_value(mutable_data)


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Project detail serializer with full information"""
    category = ProjectCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    image_url = serializers.SerializerMethodField()
    gallery_images = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'category', 'category_id', 'location', 'year',
            'image', 'image_url', 'description', 'full_description',
            'characteristics', 'timeline', 'team', 'gallery_images',
            'is_published', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            try:
                return obj.image.url
            except ValueError:
                # ImageField может быть пустым
                return None
        return None
    
    def get_gallery_images(self, obj):
        images = obj.gallery_images.all().order_by('order', 'id')
        serializer = ProjectImageSerializer(images, many=True, context=self.context)
        return serializer.data

