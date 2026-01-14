from rest_framework import serializers
from .models import Partner


class PartnerSerializer(serializers.ModelSerializer):
    """Сериализатор для списка партнеров"""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Partner
        fields = ['id', 'name', 'logo_url', 'website', 'order']
        read_only_fields = ['id', 'logo_url']
    
    def get_logo_url(self, obj):
        """Возвращает абсолютный URL логотипа"""
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class PartnerDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной информации о партнере"""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Partner
        fields = ['id', 'name', 'logo_url', 'website', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'logo_url', 'created_at', 'updated_at']
    
    def get_logo_url(self, obj):
        """Возвращает абсолютный URL логотипа"""
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class PartnerCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления партнеров"""
    
    class Meta:
        model = Partner
        fields = ['name', 'logo', 'website', 'order', 'is_active']
        extra_kwargs = {
            'logo': {'required': False, 'allow_null': True},
            'website': {'required': False, 'allow_blank': True, 'allow_null': True},
            'order': {'required': False},
            'is_active': {'required': False},
        }

