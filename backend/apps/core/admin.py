from django.contrib import admin
from .models import ContentPage


@admin.register(ContentPage)
class ContentPageAdmin(admin.ModelAdmin):
    list_display = ['page_type', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Основная информация', {
            'fields': ('page_type',)
        }),
        ('Содержание', {
            'fields': ('content_ru', 'content_kz', 'content_en')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
