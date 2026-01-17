# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ContentPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('page_type', models.CharField(choices=[('terms', 'Terms of Use'), ('privacy', 'Privacy Policy')], max_length=20, unique=True, verbose_name='Тип страницы')),
                ('content_ru', models.TextField(verbose_name='Содержание (русский)')),
                ('content_kz', models.TextField(blank=True, verbose_name='Содержание (казахский)')),
                ('content_en', models.TextField(blank=True, verbose_name='Содержание (английский)')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
            ],
            options={
                'verbose_name': 'Контентная страница',
                'verbose_name_plural': 'Контентные страницы',
                'db_table': 'content_pages',
                'ordering': ['page_type'],
            },
        ),
    ]
