from django.db import models
from django.conf import settings
import os


def upload_to(instance, filename):
    """Generate upload path"""
    return f"files/{instance.uploaded_by.id}/{filename}"


class File(models.Model):
    """File model"""
    
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to)
    file_type = models.CharField(max_length=50, blank=True)
    size = models.IntegerField(help_text='File size in bytes')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='uploaded_files', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'files'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.file:
            # Set file type from extension
            ext = os.path.splitext(self.file.name)[1].lower()
            if not self.file_type:
                self.file_type = ext[1:] if ext else 'unknown'
            
            # Set file size
            if not self.size:
                self.size = self.file.size
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Delete file from storage
        if self.file:
            self.file.delete()
        super().delete(*args, **kwargs)

