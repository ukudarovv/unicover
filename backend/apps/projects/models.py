from django.db import models
from django.conf import settings


class ProjectCategory(models.Model):
    """Project category model"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name='Название')
    name_kz = models.CharField(max_length=100, blank=True, verbose_name='Название (каз)')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Название (англ)')
    description = models.TextField(blank=True, verbose_name='Описание')
    order = models.IntegerField(default=0, verbose_name='Порядок отображения')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        db_table = 'project_categories'
        verbose_name = 'Категория проекта'
        verbose_name_plural = 'Категории проектов'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """Project model"""
    
    title = models.CharField(max_length=255, verbose_name='Название')
    category = models.ForeignKey(
        ProjectCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects',
        verbose_name='Категория'
    )
    location = models.CharField(max_length=255, verbose_name='Местоположение')
    year = models.IntegerField(verbose_name='Год')
    image = models.ImageField(upload_to='projects/', blank=True, null=True, verbose_name='Главное изображение')
    description = models.TextField(verbose_name='Краткое описание')
    full_description = models.TextField(blank=True, verbose_name='Полное описание')
    characteristics = models.JSONField(default=dict, blank=True, verbose_name='Характеристики')
    timeline = models.CharField(max_length=255, blank=True, verbose_name='Сроки выполнения')
    team = models.TextField(blank=True, verbose_name='Команда проекта')
    is_published = models.BooleanField(default=True, verbose_name='Опубликован')
    order = models.IntegerField(default=0, verbose_name='Порядок отображения')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ['order', '-year', '-created_at']
    
    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    """Project gallery image model"""
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='gallery_images',
        verbose_name='Проект'
    )
    image = models.ImageField(upload_to='projects/gallery/', verbose_name='Изображение')
    order = models.IntegerField(default=0, verbose_name='Порядок отображения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    
    class Meta:
        db_table = 'project_images'
        verbose_name = 'Изображение проекта'
        verbose_name_plural = 'Изображения проектов'
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.project.title} - Image {self.id}"
