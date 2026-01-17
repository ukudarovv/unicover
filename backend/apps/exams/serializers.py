from rest_framework import serializers
from .models import TestAttempt, ExtraAttemptRequest
from apps.tests.serializers import TestSerializer
from apps.accounts.serializers import UserSerializer


class TestAttemptSerializer(serializers.ModelSerializer):
    """Test attempt serializer"""
    test = TestSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    answer_details = serializers.SerializerMethodField()
    
    video_recording = serializers.SerializerMethodField()
    
    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test', 'user', 'started_at', 'completed_at',
            'score', 'passed', 'answers', 'answer_details', 'video_recording', 'ip_address', 'user_agent'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'score', 'passed', 'answer_details', 'video_recording']
    
    def get_video_recording(self, obj):
        """Return video recording URL if available"""
        if obj.video_recording:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_recording.url)
            return obj.video_recording.url
        return None
    
    def get_answer_details(self, obj):
        """Get detailed information about each answer"""
        if not obj.completed_at:
            return []
        return obj.get_answer_details()


class TestAttemptCreateSerializer(serializers.Serializer):
    """Serializer for creating test attempt"""
    test_id = serializers.IntegerField()


class TestAttemptSaveSerializer(serializers.Serializer):
    """Serializer for saving answers"""
    answers = serializers.DictField()


class ExtraAttemptRequestSerializer(serializers.ModelSerializer):
    """Extra attempt request serializer"""
    user = UserSerializer(read_only=True)
    test = TestSerializer(read_only=True)
    processed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ExtraAttemptRequest
        fields = [
            'id', 'user', 'test', 'reason', 'status', 'admin_response',
            'processed_by', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'processed_by', 'processed_at']


class ExtraAttemptRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating extra attempt request"""
    test_id = serializers.IntegerField()
    reason = serializers.CharField()


class ExtraAttemptRequestProcessSerializer(serializers.Serializer):
    """Serializer for processing extra attempt request (approve/reject)"""
    admin_response = serializers.CharField(required=False, allow_blank=True)

