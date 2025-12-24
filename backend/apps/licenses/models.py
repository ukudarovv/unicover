from django.db import models
from django.conf import settings
import os


def license_upload_to(instance, filename):
    """Generate upload path for license files"""
    return f"licenses/{instance.category}/{filename}"


class License(models.Model):
    """License model for construction company licenses"""
    
    CATEGORY_CHOICES = [
        ('surveying', 'Изыскания и проектирование'),
        ('construction', 'Строительство'),
        ('other', 'Прочее'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Название лицензии')
    number = models.CharField(max_length=100, unique=True, verbose_name='Номер лицензии')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other', verbose_name='Категория')
    description = models.TextField(blank=True, verbose_name='Описание')
    file = models.FileField(upload_to=license_upload_to, blank=True, null=True, verbose_name='Файл')
    issued_date = models.DateField(verbose_name='Дата выдачи')
    valid_until = models.DateField(verbose_name='Действует до', null=True, blank=True)
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_licenses', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'licenses'
        ordering = ['-issued_date']
        verbose_name = 'Лицензия'
        verbose_name_plural = 'Лицензии'
    
    def __str__(self):
        return f"{self.title} ({self.number})"
    
    def delete(self, *args, **kwargs):
        """Delete file when license is deleted"""
        if self.file:
            self.file.delete()
        super().delete(*args, **kwargs)

