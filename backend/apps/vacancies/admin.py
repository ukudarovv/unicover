from django.contrib import admin
from django.utils.html import format_html
from .models import Vacancy, VacancyApplication


class VacancyApplicationInline(admin.TabularInline):
    """Inline for displaying applications in vacancy admin"""
    model = VacancyApplication
    extra = 0
    readonly_fields = ('full_name', 'phone', 'email', 'status', 'created_at')
    fields = ('full_name', 'phone', 'email', 'status', 'created_at')
    can_delete = False
    show_change_link = True


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'location', 'employment_type', 'is_active', 'applications_count', 'created_at', 'published_at')
    list_filter = ('status', 'is_active', 'employment_type', 'location', 'created_at')
    search_fields = ('title', 'description', 'requirements')
    readonly_fields = ('created_at', 'updated_at', 'published_at', 'applications_count_display')
    inlines = [VacancyApplicationInline]
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
            'fields': ('created_by', 'created_at', 'updated_at', 'applications_count_display'),
            'classes': ('collapse',)
        }),
    )
    
    def applications_count(self, obj):
        """Display applications count"""
        count = obj.applications.count()
        return count
    applications_count.short_description = 'Откликов'
    
    def applications_count_display(self, obj):
        """Display applications count in detail view"""
        count = obj.applications.count()
        return f"{count} откликов"
    applications_count_display.short_description = 'Количество откликов'


@admin.register(VacancyApplication)
class VacancyApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'vacancy', 'phone', 'email', 'status', 'created_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'vacancy', 'created_at', 'reviewed_at')
    search_fields = ('full_name', 'phone', 'email', 'vacancy__title')
    readonly_fields = ('created_at', 'updated_at', 'resume_file_link')
    fieldsets = (
        ('Информация о кандидате', {
            'fields': ('vacancy', 'full_name', 'phone', 'email', 'message')
        }),
        ('Резюме', {
            'fields': ('resume_file', 'resume_file_link')
        }),
        ('Статус рассмотрения', {
            'fields': ('status', 'reviewed_by', 'reviewed_at')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def resume_file_link(self, obj):
        """Display link to resume file"""
        if obj.resume_file:
            return format_html(
                '<a href="{}" target="_blank">Скачать резюме</a>',
                obj.resume_file.url
            )
        return 'Резюме не загружено'
    resume_file_link.short_description = 'Ссылка на резюме'
    
    def save_model(self, request, obj, form, change):
        """Set reviewed_by when status changes"""
        if change and 'status' in form.changed_data and obj.status != 'pending':
            if not obj.reviewed_by:
                obj.reviewed_by = request.user
            from django.utils import timezone
            obj.reviewed_at = timezone.now()
        super().save_model(request, obj, form, change)

