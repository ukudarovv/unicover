from rest_framework import serializers
from .models import ContentPage


class ContentPageSerializer(serializers.ModelSerializer):
    """Serializer for ContentPage model"""
    
    class Meta:
        model = ContentPage
        fields = ['id', 'page_type', 'content_ru', 'content_kz', 'content_en', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContentPageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating ContentPage"""
    
    class Meta:
        model = ContentPage
        fields = ['content_ru', 'content_kz', 'content_en']
