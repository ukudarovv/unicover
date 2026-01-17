# Generated migration for category field

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_category_alter_course_status_alter_course_category'),
        ('tests', '0006_add_requires_video_recording'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='category',
            field=models.ForeignKey(blank=True, help_text='Category for standalone tests displayed on Training Programs page', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='tests', to='courses.category'),
        ),
    ]
