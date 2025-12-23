from django.db import models
from django.conf import settings
from apps.tests.models import Test


class TestAttempt(models.Model):
    """Test attempt model"""
    
    test = models.ForeignKey(Test, related_name='attempts', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='test_attempts', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True, help_text='Score percentage')
    passed = models.BooleanField(null=True, blank=True)
    answers = models.JSONField(default=dict, help_text='User answers: {question_id: answer}')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'test_attempts'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.full_name or self.user.phone} - {self.test.title} ({self.score}%)"
    
    def calculate_score(self):
        """Calculate score based on answers"""
        if not self.answers:
            return 0, False
        
        total_weight = 0
        correct_weight = 0
        
        for question in self.test.questions.all():
            total_weight += question.weight
            question_id = str(question.id)
            
            if question_id not in self.answers:
                continue
            
            user_answer = self.answers[question_id]
            correct_answers = question.get_correct_answers()
            
            # Check if answer is correct based on question type
            is_correct = False
            if question.type in ['single_choice', 'yes_no']:
                is_correct = str(user_answer) in [str(ca) for ca in correct_answers]
            elif question.type == 'multiple_choice':
                user_answers = user_answer if isinstance(user_answer, list) else [user_answer]
                is_correct = set(str(a) for a in user_answers) == set(str(ca) for ca in correct_answers)
            elif question.type in ['matching', 'ordering', 'short_answer']:
                # For these types, compare directly
                is_correct = str(user_answer) == str(correct_answers[0]) if correct_answers else False
            
            if is_correct:
                correct_weight += question.weight
        
        if total_weight == 0:
            return 0, False
        
        score_percentage = (correct_weight / total_weight) * 100
        passed = score_percentage >= self.test.passing_score
        
        return score_percentage, passed

