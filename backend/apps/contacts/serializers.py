from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """Contact message serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    direction_display = serializers.CharField(source='get_direction_display', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'company', 'email', 'phone', 'direction', 'direction_display',
            'message', 'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display', 'direction_display']


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact message"""
    
    class Meta:
        model = ContactMessage
        fields = ['name', 'company', 'email', 'phone', 'direction', 'message']


class ContactMessageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating contact message status"""
    
    class Meta:
        model = ContactMessage
        fields = ['status']

