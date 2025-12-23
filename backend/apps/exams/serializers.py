from rest_framework import serializers
from .models import TestAttempt
from apps.tests.serializers import TestSerializer
from apps.accounts.serializers import UserSerializer


class TestAttemptSerializer(serializers.ModelSerializer):
    """Test attempt serializer"""
    test = TestSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test', 'user', 'started_at', 'completed_at',
            'score', 'passed', 'answers', 'ip_address', 'user_agent'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'score', 'passed']


class TestAttemptCreateSerializer(serializers.Serializer):
    """Serializer for creating test attempt"""
    test_id = serializers.IntegerField()


class TestAttemptSaveSerializer(serializers.Serializer):
    """Serializer for saving answers"""
    answers = serializers.DictField()

