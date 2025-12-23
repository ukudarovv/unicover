from django.contrib import admin
from .models import Protocol, ProtocolSignature


@admin.register(Protocol)
class ProtocolAdmin(admin.ModelAdmin):
    list_display = ('number', 'student', 'course', 'exam_date', 'score', 'passing_score', 'result', 'status', 'created_at')
    list_filter = ('status', 'result', 'exam_date', 'created_at')
    search_fields = ('number', 'student__phone', 'student__full_name', 'course__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'number')


@admin.register(ProtocolSignature)
class ProtocolSignatureAdmin(admin.ModelAdmin):
    list_display = ('protocol', 'signer', 'role', 'signed_at', 'otp_verified')
    list_filter = ('role', 'otp_verified', 'signed_at')
    search_fields = ('protocol__number', 'signer__phone', 'signer__full_name')
    readonly_fields = ('signed_at',)

