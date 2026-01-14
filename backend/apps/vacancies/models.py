from django.db import models
from django.conf import settings


class Vacancy(models.Model):
    """Vacancy model for job openings"""
    
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('published', 'Опубликована'),
        ('closed', 'Закрыта'),
    ]
    
    LANGUAGE_CHOICES = [
        ('ru', 'Russian'),
        ('kz', 'Kazakh'),
        ('en', 'English'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Название вакансии')
    title_kz = models.CharField(max_length=255, blank=True, verbose_name='Название вакансии (казахский)')
    title_en = models.CharField(max_length=255, blank=True, verbose_name='Название вакансии (английский)')
    description = models.TextField(verbose_name='Описание')
    description_kz = models.TextField(blank=True, verbose_name='Описание (казахский)')
    description_en = models.TextField(blank=True, verbose_name='Описание (английский)')
    requirements = models.TextField(verbose_name='Требования')
    requirements_kz = models.TextField(blank=True, verbose_name='Требования (казахский)')
    requirements_en = models.TextField(blank=True, verbose_name='Требования (английский)')
    responsibilities = models.TextField(verbose_name='Обязанности')
    responsibilities_kz = models.TextField(blank=True, verbose_name='Обязанности (казахский)')
    responsibilities_en = models.TextField(blank=True, verbose_name='Обязанности (английский)')
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Минимальная зарплата')
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Максимальная зарплата')
    location = models.CharField(max_length=255, default='г. Атырау', verbose_name='Местоположение')
    location_kz = models.CharField(max_length=255, blank=True, verbose_name='Местоположение (казахский)')
    location_en = models.CharField(max_length=255, blank=True, verbose_name='Местоположение (английский)')
    employment_type = models.CharField(max_length=50, default='full_time', verbose_name='Тип занятости')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Статус')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='ru', verbose_name='Язык вакансии', help_text='Language of the vacancy content')
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


class VacancyApplication(models.Model):
    """Vacancy application model for job applications"""
    
    STATUS_CHOICES = [
        ('pending', 'Ожидает рассмотрения'),
        ('reviewed', 'Рассмотрено'),
        ('contacted', 'Связались'),
        ('rejected', 'Отклонено'),
    ]
    
    vacancy = models.ForeignKey(Vacancy, related_name='applications', on_delete=models.CASCADE, verbose_name='Вакансия')
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    phone = models.CharField(max_length=50, verbose_name='Телефон')
    email = models.EmailField(null=True, blank=True, verbose_name='Email')
    message = models.TextField(null=True, blank=True, verbose_name='Сообщение')
    resume_file = models.FileField(upload_to='vacancy_applications/', null=True, blank=True, verbose_name='Резюме')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviewed_applications', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Рассмотрел')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата рассмотрения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        db_table = 'vacancy_applications'
        ordering = ['-created_at']
        verbose_name = 'Отклик на вакансию'
        verbose_name_plural = 'Отклики на вакансии'
    
    def __str__(self):
        return f"{self.full_name} - {self.vacancy.title}"
