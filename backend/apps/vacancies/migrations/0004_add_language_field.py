# Generated migration for language field

from django.db import migrations, models


def set_default_language(apps, schema_editor):
    """Set default language 'ru' for all existing records"""
    Vacancy = apps.get_model('vacancies', 'Vacancy')
    Vacancy.objects.all().update(language='ru')


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0003_add_multilingual_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacancy',
            name='language',
            field=models.CharField(choices=[('ru', 'Russian'), ('kz', 'Kazakh'), ('en', 'English')], default='ru', help_text='Language of the vacancy content', max_length=2, verbose_name='Язык вакансии'),
        ),
        migrations.RunPython(set_default_language, migrations.RunPython.noop),
    ]
