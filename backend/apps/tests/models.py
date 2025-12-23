from django.db import models
from django.conf import settings
from apps.courses.models import Course


class Test(models.Model):
    """Test model"""
    
    course = models.ForeignKey(Course, related_name='tests', on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    passing_score = models.IntegerField(default=80, help_text='Minimum score to pass (percentage)')
    time_limit = models.IntegerField(null=True, blank=True, help_text='Time limit in minutes')
    max_attempts = models.IntegerField(default=3, help_text='Maximum attempts allowed')
    is_active = models.BooleanField(default=True)
    
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
    
    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    text = models.TextField()
    options = models.JSONField(default=list, help_text='List of answer options with is_correct flag')
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
        """Get list of correct answer IDs"""
        if not self.options:
            return []
        return [opt.get('id') for opt in self.options if opt.get('is_correct', False)]

