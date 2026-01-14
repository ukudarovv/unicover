from django.contrib import admin
from .models import Certificate, CertificateTemplate


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('number', 'student', 'course', 'issued_at', 'uploaded_at', 'has_file')
    list_filter = ('issued_at', 'uploaded_at', 'valid_until')
    search_fields = ('number', 'student__phone', 'student__full_name', 'course__title')
    ordering = ('-issued_at',)
    readonly_fields = ('issued_at', 'number')
    
    def has_file(self, obj):
        return bool(obj.file)
    has_file.boolean = True
    has_file.short_description = 'Has File'

