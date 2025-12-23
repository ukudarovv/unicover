from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'read', 'created_at')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('title', 'message', 'user__phone', 'user__full_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

