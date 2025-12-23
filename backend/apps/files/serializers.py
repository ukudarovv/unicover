from rest_framework import serializers
from .models import File
from apps.accounts.serializers import UserSerializer


class FileSerializer(serializers.ModelSerializer):
    """File serializer"""
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = [
            'id', 'name', 'file', 'file_url', 'file_type', 'size',
            'uploaded_by', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_type', 'size']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

