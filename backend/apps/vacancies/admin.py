from django.contrib import admin
from .models import Vacancy


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'location', 'employment_type', 'is_active', 'created_at', 'published_at')
    list_filter = ('status', 'is_active', 'employment_type', 'location', 'created_at')
    search_fields = ('title', 'description', 'requirements')
    readonly_fields = ('created_at', 'updated_at', 'published_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'requirements', 'responsibilities')
        }),
        ('Условия работы', {
            'fields': ('salary_min', 'salary_max', 'location', 'employment_type')
        }),
        ('Статус', {
            'fields': ('status', 'is_active', 'published_at')
        }),
        ('Системная информация', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

