from django.db import models


class ContactMessage(models.Model):
    """Contact form message model"""
    
    DIRECTION_CHOICES = [
        ('construction', 'Строительство и проектирование'),
        ('engineering', 'Инженерные изыскания'),
        ('education', 'Обучение'),
        ('safety', 'Промышленная безопасность'),
        ('other', 'Другое'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'Новое'),
        ('read', 'Прочитано'),
        ('replied', 'Отвечено'),
        ('archived', 'Архивировано'),
    ]
    
    name = models.CharField(max_length=255, verbose_name='Имя')
    company = models.CharField(max_length=255, blank=True, verbose_name='Компания')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    direction = models.CharField(max_length=50, choices=DIRECTION_CHOICES, blank=True, verbose_name='Направление')
    message = models.TextField(verbose_name='Сообщение')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']
        verbose_name = 'Сообщение обратной связи'
        verbose_name_plural = 'Сообщения обратной связи'
    
    def __str__(self):
        return f"{self.name} - {self.email} ({self.get_status_display()})"

