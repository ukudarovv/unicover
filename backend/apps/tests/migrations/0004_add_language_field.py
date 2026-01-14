# Generated migration for language field

from django.db import migrations, models


def set_default_language(apps, schema_editor):
    """Set default language 'ru' for all existing records"""
    Test = apps.get_model('tests', 'Test')
    Question = apps.get_model('tests', 'Question')
    
    Test.objects.all().update(language='ru')
    Question.objects.all().update(language='ru')


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0003_add_multilingual_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the test content', max_length=2),
        ),
        migrations.AddField(
            model_name='question',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the question (inherits from test)', max_length=2),
        ),
        migrations.RunPython(set_default_language, migrations.RunPython.noop),
    ]
