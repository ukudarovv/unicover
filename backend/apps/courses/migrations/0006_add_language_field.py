# Generated migration for language field

from django.db import migrations, models


def set_default_language(apps, schema_editor):
    """Set default language 'ru' for all existing records"""
    Course = apps.get_model('courses', 'Course')
    Module = apps.get_model('courses', 'Module')
    Lesson = apps.get_model('courses', 'Lesson')
    
    Course.objects.all().update(language='ru')
    Module.objects.all().update(language='ru')
    Lesson.objects.all().update(language='ru')


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_add_multilingual_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the course content', max_length=2),
        ),
        migrations.AddField(
            model_name='module',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the module (inherits from course)', max_length=2),
        ),
        migrations.AddField(
            model_name='lesson',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the lesson (inherits from course)', max_length=2),
        ),
        migrations.RunPython(set_default_language, migrations.RunPython.noop),
    ]
