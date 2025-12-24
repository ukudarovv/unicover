from django.db import models
from django.conf import settings


class Vacancy(models.Model):
    """Vacancy model for job openings"""
    
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('published', 'Опубликована'),
        ('closed', 'Закрыта'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Название вакансии')
    description = models.TextField(verbose_name='Описание')
    requirements = models.TextField(verbose_name='Требования')
    responsibilities = models.TextField(verbose_name='Обязанности')
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Минимальная зарплата')
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Максимальная зарплата')
    location = models.CharField(max_length=255, default='г. Атырау', verbose_name='Местоположение')
    employment_type = models.CharField(max_length=50, default='full_time', verbose_name='Тип занятости')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Статус')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_vacancies', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата публикации')
    
    class Meta:
        db_table = 'vacancies'
        ordering = ['-created_at']
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

