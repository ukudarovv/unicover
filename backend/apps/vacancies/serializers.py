from rest_framework import serializers
from .models import Vacancy


class VacancySerializer(serializers.ModelSerializer):
    """Vacancy serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'title', 'description', 'requirements', 'responsibilities',
            'salary_min', 'salary_max', 'location', 'employment_type', 'employment_type_display',
            'status', 'status_display', 'is_active', 'created_by', 'created_at',
            'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display', 'employment_type_display']


class VacancyCreateUpdateSerializer(serializers.ModelSerializer):
    """Vacancy create/update serializer"""
    
    class Meta:
        model = Vacancy
        fields = [
            'title', 'description', 'requirements', 'responsibilities',
            'salary_min', 'salary_max', 'location', 'employment_type',
            'status', 'is_active'
        ]

