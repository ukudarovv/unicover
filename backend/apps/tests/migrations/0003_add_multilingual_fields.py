# Generated migration for multilingual support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0002_remove_test_course_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='title_kz',
            field=models.CharField(blank=True, help_text='Title in Kazakh', max_length=255),
        ),
        migrations.AddField(
            model_name='test',
            name='title_en',
            field=models.CharField(blank=True, help_text='Title in English', max_length=255),
        ),
        migrations.AddField(
            model_name='question',
            name='text_kz',
            field=models.TextField(blank=True, help_text='Question text in Kazakh'),
        ),
        migrations.AddField(
            model_name='question',
            name='text_en',
            field=models.TextField(blank=True, help_text='Question text in English'),
        ),
    ]
