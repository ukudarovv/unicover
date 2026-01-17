# Generated migration for is_standalone_test field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_add_language_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='is_standalone_test',
            field=models.BooleanField(default=False, help_text='If True, this course is displayed as a standalone test on Training Programs page'),
        ),
    ]
