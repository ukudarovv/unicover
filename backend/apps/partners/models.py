from django.db import models
from django.utils import timezone


class Partner(models.Model):
    """Модель партнера"""
    name = models.CharField(max_length=255, verbose_name='Название компании')
    logo = models.ImageField(upload_to='partners/logos/', blank=True, null=True, verbose_name='Логотип')
    website = models.URLField(max_length=255, blank=True, null=True, verbose_name='Веб-сайт')
    order = models.IntegerField(default=0, verbose_name='Порядок отображения')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

