from django.contrib import admin
from .models import ProjectCategory, Project, ProjectImage


class ProjectImageInline(admin.TabularInline):
    """Inline admin for project images"""
    model = ProjectImage
    extra = 1
    fields = ('image', 'order')
    ordering = ('order', 'id')


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'name_kz', 'name_en', 'description')
    ordering = ('order', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'name_kz', 'name_en', 'description')
        }),
        ('Настройки', {
            'fields': ('order', 'is_active')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'year', 'is_published', 'order', 'created_at')
    list_filter = ('category', 'year', 'is_published', 'created_at')
    search_fields = ('title', 'description', 'full_description', 'location')
    ordering = ('order', '-year', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ProjectImageInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'category', 'location', 'year', 'image')
        }),
        ('Описание', {
            'fields': ('description', 'full_description')
        }),
        ('Дополнительная информация', {
            'fields': ('characteristics', 'timeline', 'team'),
            'classes': ('collapse',)
        }),
        ('Настройки', {
            'fields': ('is_published', 'order')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('project__title',)
    ordering = ('project', 'order', 'id')
    readonly_fields = ('created_at',)
