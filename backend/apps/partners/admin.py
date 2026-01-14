from django.contrib import admin
from .models import Partner


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active', 'website', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'website']
    list_editable = ['order', 'is_active']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'logo', 'website')
        }),
        ('Настройки отображения', {
            'fields': ('order', 'is_active')
        }),
    )

