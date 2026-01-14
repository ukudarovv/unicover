# Generated migration for multilingual support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_alter_courseenrollment_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='description_kz',
            field=models.TextField(blank=True, help_text='Description in Kazakh'),
        ),
        migrations.AddField(
            model_name='course',
            name='description_en',
            field=models.TextField(blank=True, help_text='Description in English'),
        ),
        migrations.AddField(
            model_name='module',
            name='title_kz',
            field=models.CharField(blank=True, help_text='Title in Kazakh', max_length=255),
        ),
        migrations.AddField(
            model_name='module',
            name='title_en',
            field=models.CharField(blank=True, help_text='Title in English', max_length=255),
        ),
        migrations.AddField(
            model_name='module',
            name='description_kz',
            field=models.TextField(blank=True, help_text='Description in Kazakh'),
        ),
        migrations.AddField(
            model_name='module',
            name='description_en',
            field=models.TextField(blank=True, help_text='Description in English'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='title_kz',
            field=models.CharField(blank=True, help_text='Title in Kazakh', max_length=255),
        ),
        migrations.AddField(
            model_name='lesson',
            name='title_en',
            field=models.CharField(blank=True, help_text='Title in English', max_length=255),
        ),
        migrations.AddField(
            model_name='lesson',
            name='description_kz',
            field=models.TextField(blank=True, help_text='Description in Kazakh'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='description_en',
            field=models.TextField(blank=True, help_text='Description in English'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='content_kz',
            field=models.TextField(blank=True, help_text='Content in Kazakh'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='content_en',
            field=models.TextField(blank=True, help_text='Content in English'),
        ),
    ]
