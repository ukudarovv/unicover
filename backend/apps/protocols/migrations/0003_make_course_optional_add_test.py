# Generated migration for making course optional and adding test field

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0007_add_category_field'),
        ('protocols', '0002_protocol_enrollment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='protocol',
            name='course',
            field=models.ForeignKey(blank=True, help_text='Course for course completion protocols', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='protocols', to='courses.course'),
        ),
        migrations.AddField(
            model_name='protocol',
            name='test',
            field=models.ForeignKey(blank=True, help_text='Test for standalone test completion protocols', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='protocols', to='tests.test'),
        ),
    ]
