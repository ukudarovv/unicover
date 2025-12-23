from rest_framework import serializers
from .models import Certificate
from apps.courses.serializers import CourseSerializer
from apps.accounts.serializers import UserSerializer
from apps.protocols.serializers import ProtocolSerializer


class CertificateSerializer(serializers.ModelSerializer):
    """Certificate serializer"""
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    protocol = ProtocolSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'number', 'student', 'course', 'protocol',
            'issued_at', 'valid_until', 'qr_code', 'pdf_url'
        ]
        read_only_fields = ['id', 'number', 'issued_at', 'qr_code']


class CertificateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating certificate"""
    
    class Meta:
        model = Certificate
        fields = ['student', 'course', 'protocol', 'valid_until']

