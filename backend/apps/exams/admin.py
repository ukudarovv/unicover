from django.contrib import admin
from .models import TestAttempt


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'passed', 'started_at', 'completed_at')
    list_filter = ('passed', 'started_at', 'completed_at')
    search_fields = ('user__phone', 'user__full_name', 'test__title')
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'completed_at', 'score', 'passed')

