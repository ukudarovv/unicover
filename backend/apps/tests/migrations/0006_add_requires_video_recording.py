# Generated manually for video recording feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0005_alter_question_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='requires_video_recording',
            field=models.BooleanField(default=False, help_text='Require video recording during test'),
        ),
    ]
