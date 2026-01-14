from django.db import models
from django.conf import settings
import uuid


class Test(models.Model):
    """Test model"""
    
    LANGUAGE_CHOICES = [
        ('ru', 'Russian'),
        ('kz', 'Kazakh'),
        ('en', 'English'),
    ]
    
    title = models.CharField(max_length=255)
    title_kz = models.CharField(max_length=255, blank=True, help_text='Title in Kazakh')
    title_en = models.CharField(max_length=255, blank=True, help_text='Title in English')
    passing_score = models.IntegerField(default=80, help_text='Minimum score to pass (percentage)')
    time_limit = models.IntegerField(null=True, blank=True, help_text='Time limit in minutes')
    max_attempts = models.IntegerField(default=3, help_text='Maximum attempts allowed')
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='ru', help_text='Language of the test content')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tests'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def questions_count(self):
        return self.questions.count()


class Question(models.Model):
    """Question model"""
    
    TYPE_CHOICES = [
        ('single_choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice'),
        ('yes_no', 'Yes/No'),
        ('matching', 'Matching'),
        ('ordering', 'Ordering'),
        ('short_answer', 'Short Answer'),
    ]
    
    LANGUAGE_CHOICES = [
        ('ru', 'Russian'),
        ('kz', 'Kazakh'),
        ('en', 'English'),
    ]
    
    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    text = models.TextField()
    text_kz = models.TextField(blank=True, help_text='Question text in Kazakh')
    text_en = models.TextField(blank=True, help_text='Question text in English')
    options = models.JSONField(default=list, help_text='List of answer options with is_correct flag. Options can have text, text_kz, text_en fields for multilingual support.')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='ru', help_text='Language of the question (inherits from test)')
    order = models.IntegerField(default=0)
    weight = models.IntegerField(default=1, help_text='Question weight for scoring')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['order', 'id']
        unique_together = ['test', 'order']
    
    def __str__(self):
        return f"{self.test.title} - {self.text[:50]}"
    
    def get_correct_answers(self):
        """Get list of correct answer IDs (or text for yes_no questions)"""
        if not self.options:
            return []
        
        # Для yes_no вопросов возвращаем текст правильного ответа ("Да" или "Нет")
        if self.type == 'yes_no':
            # Для yes_no вопросов опции могут быть объектами с is_correct или строками
            result = []
            for opt in self.options:
                if isinstance(opt, dict):
                    if opt.get('is_correct', False):
                        result.append(opt.get('text', opt.get('id', '')))
                elif isinstance(opt, str):
                    # Если опция - строка, просто добавляем её (для обратной совместимости)
                    result.append(opt)
            return result
        
        # Для остальных типов вопросов возвращаем ID правильных ответов
        # Примечание: ID должны быть сгенерированы при сохранении через сериализатор или метод save()
        return [opt.get('id') for opt in self.options if isinstance(opt, dict) and opt.get('is_correct', False) and opt.get('id')]
    
    def save(self, *args, **kwargs):
        """Override save to ensure all options have IDs"""
        # Убеждаемся, что все опции имеют ID перед сохранением
        # Для yes_no вопросов опции могут быть пустыми
        if self.options and self.type != 'yes_no':
            for opt in self.options:
                if isinstance(opt, dict) and ('id' not in opt or not opt.get('id')):
                    opt['id'] = str(uuid.uuid4())
        super().save(*args, **kwargs)

