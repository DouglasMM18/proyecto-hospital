from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('clinical', '0001_initial'),  # Ajusta esto al nombre de tu última migración
    ]

    operations = [
        migrations.AddField(
            model_name='madre',
            name='rut_hash',
            field=models.CharField(max_length=64, unique=True, db_index=True, editable=False, null=True),
        ),
    ]