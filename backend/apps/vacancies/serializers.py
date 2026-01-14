from rest_framework import serializers
from .models import Vacancy, VacancyApplication


class VacancySerializer(serializers.ModelSerializer):
    """Vacancy serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'title', 'title_kz', 'title_en', 'description', 'description_kz', 'description_en',
            'requirements', 'requirements_kz', 'requirements_en', 'responsibilities', 'responsibilities_kz', 'responsibilities_en',
            'salary_min', 'salary_max', 'location', 'location_kz', 'location_en',
            'employment_type', 'employment_type_display',
            'status', 'status_display', 'is_active', 'language', 'created_by', 'created_at',
            'updated_at', 'published_at', 'applications_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display', 'employment_type_display', 'applications_count']
    
    def get_applications_count(self, obj):
        """Return applications count only for admin users"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_admin:
            return obj.applications.count()
        return None


class VacancyCreateUpdateSerializer(serializers.ModelSerializer):
    """Vacancy create/update serializer"""
    
    class Meta:
        model = Vacancy
        fields = [
            'title', 'title_kz', 'title_en', 'description', 'description_kz', 'description_en',
            'requirements', 'requirements_kz', 'requirements_en', 'responsibilities', 'responsibilities_kz', 'responsibilities_en',
            'salary_min', 'salary_max', 'location', 'location_kz', 'location_en',
            'employment_type', 'status', 'is_active', 'language'
        ]
    
    def validate_salary_min(self, value):
        """Validate salary_min doesn't exceed max_digits"""
        if value is not None:
            # max_digits=10, decimal_places=2 means max 8 digits before decimal
            if value > 99999999.99:
                raise serializers.ValidationError("Максимальное значение: 99,999,999.99")
        return value
    
    def validate_salary_max(self, value):
        """Validate salary_max doesn't exceed max_digits"""
        if value is not None:
            # max_digits=10, decimal_places=2 means max 8 digits before decimal
            if value > 99999999.99:
                raise serializers.ValidationError("Максимальное значение: 99,999,999.99")
        return value
    
    def validate(self, data):
        """Validate salary_min <= salary_max"""
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        
        if salary_min is not None and salary_max is not None:
            if salary_min > salary_max:
                raise serializers.ValidationError({
                    'salary_max': 'Максимальная зарплата должна быть больше или равна минимальной'
                })
        
        return data


class VacancyApplicationSerializer(serializers.ModelSerializer):
    """Vacancy application serializer for reading"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()
    resume_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VacancyApplication
        fields = [
            'id', 'vacancy', 'vacancy_title', 'full_name', 'phone', 'email',
            'message', 'resume_file', 'resume_file_url', 'status', 'status_display',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display', 'vacancy_title', 'reviewed_by_name', 'resume_file_url']
    
    def get_reviewed_by_name(self, obj):
        """Return reviewed by user's full name"""
        if obj.reviewed_by:
            return obj.reviewed_by.full_name or obj.reviewed_by.phone
        return None
    
    def get_resume_file_url(self, obj):
        """Return resume file URL"""
        if obj.resume_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume_file.url)
        return None


class VacancyApplicationCreateSerializer(serializers.ModelSerializer):
    """Vacancy application create serializer (public access, no auth required)"""
    
    class Meta:
        model = VacancyApplication
        fields = [
            'vacancy', 'full_name', 'phone', 'email', 'message', 'resume_file'
        ]
    
    def validate_resume_file(self, value):
        """Validate resume file"""
        if value:
            # Check file size (max 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Размер файла не должен превышать 10 МБ")
            # Check file type
            allowed_types = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'image/jpeg', 'image/png']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Разрешены только файлы: PDF, DOC, DOCX, JPG, PNG")
        return value

