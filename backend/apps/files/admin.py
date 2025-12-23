from django.contrib import admin
from .models import File


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'size', 'uploaded_by', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('name', 'uploaded_by__phone', 'uploaded_by__full_name')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at', 'size', 'file_type')

