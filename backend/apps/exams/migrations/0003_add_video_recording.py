# Generated manually for video recording feature

from django.db import migrations, models
import apps.exams.models


class Migration(migrations.Migration):

    dependencies = [
        ('exams', '0002_extraattemptrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='testattempt',
            name='video_recording',
            field=models.FileField(blank=True, help_text='Video recording of test attempt', null=True, upload_to=apps.exams.models.test_attempt_video_upload_to),
        ),
    ]
