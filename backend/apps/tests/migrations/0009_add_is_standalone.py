# Generated migration for is_standalone field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0008_add_test_completion_verification'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='is_standalone',
            field=models.BooleanField(default=False, help_text='If True, test can be taken without a course and will be displayed on Training Programs page'),
        ),
    ]
