# Generated migration for multilingual support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vacancies', '0002_vacancyapplication'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacancy',
            name='title_kz',
            field=models.CharField(blank=True, max_length=255, verbose_name='Название вакансии (казахский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='title_en',
            field=models.CharField(blank=True, max_length=255, verbose_name='Название вакансии (английский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='description_kz',
            field=models.TextField(blank=True, verbose_name='Описание (казахский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='description_en',
            field=models.TextField(blank=True, verbose_name='Описание (английский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='requirements_kz',
            field=models.TextField(blank=True, verbose_name='Требования (казахский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='requirements_en',
            field=models.TextField(blank=True, verbose_name='Требования (английский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='responsibilities_kz',
            field=models.TextField(blank=True, verbose_name='Обязанности (казахский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='responsibilities_en',
            field=models.TextField(blank=True, verbose_name='Обязанности (английский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='location_kz',
            field=models.CharField(blank=True, max_length=255, verbose_name='Местоположение (казахский)'),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='location_en',
            field=models.CharField(blank=True, max_length=255, verbose_name='Местоположение (английский)'),
        ),
    ]
