# Generated migration for TestCompletionVerification model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('exams', '0001_initial'),
        ('tests', '0007_add_category_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='TestCompletionVerification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('otp_code', models.CharField(blank=True, max_length=6)),
                ('otp_expires_at', models.DateTimeField(blank=True, null=True)),
                ('verified', models.BooleanField(default=False)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('test_attempt', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='completion_verification', to='exams.testattempt')),
            ],
            options={
                'db_table': 'test_completion_verifications',
            },
        ),
    ]
