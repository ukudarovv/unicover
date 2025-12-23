from rest_framework import serializers
from .models import Test, Question


class QuestionSerializer(serializers.ModelSerializer):
    """Question serializer"""
    
    class Meta:
        model = Question
        fields = [
            'id', 'type', 'text', 'options', 'order', 'weight',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestSerializer(serializers.ModelSerializer):
    """Test serializer with nested questions"""
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField(read_only=True)
    course = serializers.PrimaryKeyRelatedField(read_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Test
        fields = [
            'id', 'course', 'course_id', 'title', 'passing_score',
            'time_limit', 'max_attempts', 'is_active', 'questions',
            'questions_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'questions_count', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        course_id = validated_data.pop('course_id', None)
        # Обрабатываем course_id: если None или пустая строка, не устанавливаем курс
        if course_id and course_id != '':
            from apps.courses.models import Course
            try:
                validated_data['course'] = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                pass
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        course_id = validated_data.pop('course_id', None)
        # Обрабатываем course_id: если None или пустая строка, убираем привязку
        if course_id is None or course_id == '':
            instance.course = None
        else:
            from apps.courses.models import Course
            try:
                instance.course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                instance.course = None
        return super().update(instance, validated_data)


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating questions"""
    
    class Meta:
        model = Question
        fields = ['type', 'text', 'options', 'order', 'weight']
    
    def validate_options(self, value):
        """Validate options structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Options must be a list")
        
        for opt in value:
            if not isinstance(opt, dict):
                raise serializers.ValidationError("Each option must be a dictionary")
            if 'text' not in opt:
                raise serializers.ValidationError("Each option must have 'text' field")
        
        return value

