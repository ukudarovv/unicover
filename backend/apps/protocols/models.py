from django.db import models
from django.conf import settings
from apps.courses.models import Course
from apps.exams.models import TestAttempt
import random
import string


class Protocol(models.Model):
    """Protocol model for PDEK"""
    
    STATUS_CHOICES = [
        ('generated', 'Generated'),
        ('pending_pdek', 'Pending PDEK'),
        ('signed_members', 'Signed by Members'),
        ('signed_chairman', 'Signed by Chairman'),
        ('rejected', 'Rejected'),
        ('annulled', 'Annulled'),
    ]
    
    number = models.CharField(max_length=50, unique=True, db_index=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='protocols', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='protocols', on_delete=models.CASCADE)
    attempt = models.ForeignKey(TestAttempt, related_name='protocols', on_delete=models.CASCADE, null=True, blank=True)
    exam_date = models.DateTimeField()
    score = models.FloatField()
    passing_score = models.FloatField()
    result = models.CharField(max_length=10, choices=[('passed', 'Passed'), ('failed', 'Failed')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='generated')
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'protocols'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Protocol {self.number} - {self.student.full_name or self.student.phone}"
    
    def generate_number(self):
        """Generate unique protocol number"""
        if self.number:
            return self.number
        
        from django.utils import timezone
        year = self.exam_date.year if self.exam_date else timezone.now().year
        prefix = f"PROT-{year}-"
        
        while True:
            suffix = ''.join(random.choices(string.digits, k=6))
            number = f"{prefix}{suffix}"
            if not Protocol.objects.filter(number=number).exists():
                self.number = number
                return number
    
    def save(self, *args, **kwargs):
        if not self.number:
            self.generate_number()
        super().save(*args, **kwargs)


class ProtocolSignature(models.Model):
    """Protocol signature model"""
    
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('chairman', 'Chairman'),
    ]
    
    protocol = models.ForeignKey(Protocol, related_name='signatures', on_delete=models.CASCADE)
    signer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='protocol_signatures', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    signed_at = models.DateTimeField(null=True, blank=True)
    otp_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'protocol_signatures'
        unique_together = ['protocol', 'signer']
    
    def __str__(self):
        return f"{self.protocol.number} - {self.signer.full_name or self.signer.phone} ({self.role})"
    
    def generate_otp(self):
        """Generate OTP code"""
        self.otp_code = ''.join(random.choices(string.digits, k=6))
        from django.utils import timezone
        from datetime import timedelta
        self.otp_expires_at = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.otp_code
    
    def verify_otp(self, code):
        """Verify OTP code"""
        from django.utils import timezone
        if not self.otp_code or not self.otp_expires_at:
            return False
        if timezone.now() > self.otp_expires_at:
            return False
        if self.otp_code != code:
            return False
        self.otp_verified = True
        self.signed_at = timezone.now()
        self.save()
        return True

