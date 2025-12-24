from django.contrib import admin
from .models import License


@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'number', 'category', 'issued_date', 'valid_until', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'issued_date')
    search_fields = ('title', 'number', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'number', 'category', 'description')
        }),
        ('Файл', {
            'fields': ('file',)
        }),
        ('Даты', {
            'fields': ('issued_date', 'valid_until')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

