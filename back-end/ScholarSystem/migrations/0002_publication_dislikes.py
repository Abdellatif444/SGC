# Generated by Django 4.2 on 2025-06-18 23:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ScholarSystem', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='publication',
            name='dislikes',
            field=models.IntegerField(default=0),
        ),
    ]
