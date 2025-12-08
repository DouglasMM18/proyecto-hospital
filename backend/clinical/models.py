import hashlib
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.fields import EncryptedTextField

# --- MODELOS CLÍNICOS ---

class Madre(models.Model):
    # DATOS SENSIBLES
    rut = EncryptedTextField(help_text="RUT cifrado (lectura)")
    rut_hash = models.CharField(max_length=64, unique=True, db_index=True, editable=False)
    nombre_completo = EncryptedTextField(help_text="Nombre completo cifrado")
    direccion = EncryptedTextField(null=True, blank=True)
    telefono = EncryptedTextField(null=True, blank=True)
    
    # DATOS DEMOGRÁFICOS
    fecha_nacimiento = models.DateField()
    comuna = models.CharField(max_length=100)
    cesfam = models.CharField(max_length=100, blank=True, null=True)
    nacionalidad = models.CharField(max_length=50, default="Chilena")
    es_migrante = models.BooleanField(default=False)
    pueblo_originario = models.BooleanField(default=False)
    
    # DATOS CLÍNICOS SENSIBLES
    vih_positivo = EncryptedTextField(default='NO')
    vdrl_reactivo = EncryptedTextField(default='NO')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.rut:
            clean_rut = self.rut.replace(".", "").upper().strip()
            self.rut_hash = hashlib.sha256(clean_rut.encode('utf-8')).hexdigest()
            self.rut = clean_rut
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Madre ID {self.id}"

class Parto(models.Model):
    madre = models.ForeignKey(Madre, on_delete=models.PROTECT, related_name='partos')
    fecha = models.DateField()
    hora = models.TimeField()
    tipo_parto = models.CharField(max_length=50, choices=[
        ('EUTOCICO', 'Eutócico'),
        ('CESAREA URGENCIA', 'Cesárea Urgencia'),
        ('CESAREA ELECTIVA', 'Cesárea Electiva'),
        ('FORCEPS', 'Fórceps'),
        ('VACUUM', 'Vacuum')
    ])
    edad_gestacional = models.IntegerField(help_text="Semanas de gestación (Columna E)")
    profesional_acargo = models.CharField(max_length=150)
    observaciones = EncryptedTextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.fecha} - ID Madre {self.madre.id}"

class RecienNacido(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    apellido_paterno = EncryptedTextField(blank=True, null=True)
    sexo = models.CharField(max_length=20, choices=[
        ('FEMENINO', 'Femenino'), 
        ('MASCULINO', 'Masculino'), 
        ('INDETERMINADO', 'Indeterminado')
    ])
    peso_gramos = models.IntegerField()
    talla_cm = models.FloatField()
    circunferencia_craneal = models.FloatField(verbose_name="CC", null=True, blank=True)
    apgar_1 = models.IntegerField(verbose_name="Apgar 1'")
    apgar_5 = models.IntegerField(verbose_name="Apgar 5'")
    vacuna_bcg = models.BooleanField(default=False)
    vacuna_hepatitis_b = models.BooleanField(default=False)
    screening_auditivo = models.BooleanField(default=False)
    profilaxis_ocular = models.BooleanField(default=False)
    malformacion_congenita = EncryptedTextField(default='NO')
    observaciones = EncryptedTextField(blank=True, null=True)

    def __str__(self):
        return f"RN {self.sexo} - {self.peso_gramos}g"

# --- NUEVO: SISTEMA DE ROLES ---

class PerfilUsuario(models.Model):
    """
    Extensión del usuario para manejar los 5 roles definidos por el equipo.
    """
    ROLES = [
        ('ADMINISTRADOR', 'Administrador (Admisión)'),  # Ingresa pacientes
        ('ENFERMERA', 'Enfermera/o'),                   # Ingresa datos clínicos
        ('SUPERVISOR', 'Especialista/Supervisor'),      # Solo informes
        ('TI', 'Encargado de TI'),                      # Gestión de cuentas
        ('MATRONA', 'Matrona'),                         # Visualiza y modifica todo
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES, default='ENFERMERA')

    def __str__(self):
        return f"{self.user.username} - {self.get_rol_display()}"

# --- SEÑALES PARA CREAR PERFIL AUTOMÁTICAMENTE ---
@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        PerfilUsuario.objects.create(user=instance)

@receiver(post_save, sender=User)
def guardar_perfil_usuario(sender, instance, **kwargs):
    # Verifica si existe el perfil antes de guardarlo (por si acaso)
    if hasattr(instance, 'perfil'):
        instance.perfil.save()