from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('number', 'student', 'course', 'issued_at', 'valid_until')
    list_filter = ('issued_at', 'valid_until')
    search_fields = ('number', 'student__phone', 'student__full_name', 'course__title')
    ordering = ('-issued_at',)
    readonly_fields = ('issued_at', 'number')

