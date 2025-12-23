from django.db import models
from django.conf import settings


class Category(models.Model):
    """Course category model"""
    
    name = models.CharField(max_length=100, unique=True)
    name_kz = models.CharField(max_length=100, blank=True)
    name_en = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon name or class')
    order = models.IntegerField(default=0, help_text='Display order')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Course(models.Model):
    """Course model"""
    
    STATUS_CHOICES = [
        ('in_development', 'In Development'),
        ('draft', 'Draft'),
        ('published', 'Published'),
        # Старые статусы для обратной совместимости
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('exam_available', 'Exam Available'),
        ('exam_passed', 'Exam Passed'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('annulled', 'Annulled'),
    ]
    
    FORMAT_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('blended', 'Blended'),
    ]
    
    title = models.CharField(max_length=255)
    title_kz = models.CharField(max_length=255, blank=True)
    title_en = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey('Category', related_name='courses', on_delete=models.PROTECT, null=True, blank=True)
    duration = models.IntegerField(default=0, help_text='Duration in hours')
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='online')
    passing_score = models.IntegerField(default=80, help_text='Minimum score to pass')
    max_attempts = models.IntegerField(default=3, help_text='Maximum test attempts')
    has_timer = models.BooleanField(default=False)
    timer_minutes = models.IntegerField(null=True, blank=True, help_text='Timer in minutes')
    pdek_commission = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_development')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Module(models.Model):
    """Course module"""
    
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'modules'
        ordering = ['order', 'id']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """Lesson model"""
    
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('quiz', 'Quiz'),
    ]
    
    module = models.ForeignKey(Module, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='text')
    content = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    pdf_url = models.URLField(blank=True, null=True)
    test_id = models.CharField(max_length=100, blank=True, null=True, help_text='Test ID for quiz type')
    duration = models.IntegerField(default=0, help_text='Duration in minutes')
    order = models.IntegerField(default=0)
    required = models.BooleanField(default=True)
    allow_download = models.BooleanField(default=False)
    track_progress = models.BooleanField(default=False)
    passing_score = models.IntegerField(null=True, blank=True, help_text='For quiz type')
    max_attempts = models.IntegerField(null=True, blank=True, help_text='For quiz type')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lessons'
        ordering = ['order', 'id']
        unique_together = ['module', 'order']
    
    def __str__(self):
        return f"{self.module.title} - {self.title}"


class CourseEnrollment(models.Model):
    """Course enrollment"""
    
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('exam_available', 'Exam Available'),
        ('exam_passed', 'Exam Passed'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('annulled', 'Annulled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    progress = models.IntegerField(default=0, help_text='Progress percentage')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'course_enrollments'
        unique_together = ['user', 'course']
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.user.full_name or self.user.phone} - {self.course.title}"


class LessonProgress(models.Model):
    """Lesson progress tracking"""
    
    enrollment = models.ForeignKey(CourseEnrollment, related_name='lesson_progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='progress', on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'lesson_progress'
        unique_together = ['enrollment', 'lesson']
    
    def __str__(self):
        return f"{self.enrollment.user.full_name or self.enrollment.user.phone} - {self.lesson.title}"

