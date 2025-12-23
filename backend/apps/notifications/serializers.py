from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

