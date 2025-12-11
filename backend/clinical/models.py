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
    
    # DATOS CLÍNICOS
    vih_positivo = EncryptedTextField(default='NO')
    vdrl_reactivo = EncryptedTextField(default='NO')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.rut:
            # Blind Indexing: Limpiamos y hasheamos el RUT
            clean_rut = self.rut.replace(".", "").replace("-", "").upper().strip()
            self.rut_hash = hashlib.sha256(clean_rut.encode('utf-8')).hexdigest()
            # Guardamos el RUT limpio pero encriptado
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
    edad_gestacional = models.IntegerField(help_text="Semanas de gestación")
    profesional_acargo = models.CharField(max_length=150)
    observaciones = EncryptedTextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.fecha} - ID {self.id}"

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

# --- ROLES Y PERFILES ---

class PerfilUsuario(models.Model):
    ROLES = [
        ('ADMINISTRADOR', 'Administrador (Admisión)'),
        ('ENFERMERA', 'Enfermera/o'),
        ('SUPERVISOR', 'Supervisor'),
        ('TI', 'TI'),
        ('MATRONA', 'Matrona'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES, default='ENFERMERA')

    def __str__(self):
        return f"{self.user.username} - {self.get_rol_display()}"

@receiver(post_save, sender=User)
def gestor_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        PerfilUsuario.objects.create(user=instance)
    if hasattr(instance, 'perfil'):
        instance.perfil.save()

# --- NUEVOS MODELOS (LOGICA DE ANDRES) ---

class LogActividad(models.Model):
    TIPOS = [
        ('LOGIN','Login'), ('CREAR','Crear'), ('EDITAR','Editar'), 
        ('VER','Ver'), ('EXPORTAR','Exportar'), ('ALTA','Alta')
    ]
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    username = models.CharField(max_length=150)
    rol = models.CharField(max_length=50)
    tipo_accion = models.CharField(max_length=20, choices=TIPOS)
    modulo = models.CharField(max_length=20)
    descripcion = models.TextField()
    fecha_hora = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta: ordering = ['-fecha_hora']

class AltaMedica(models.Model):
    ESTADOS = [('PENDIENTE', 'Pendiente'), ('AUTORIZADA', 'Autorizada'), ('RECHAZADA', 'Rechazada')]
    TIPO_ALTA = [('MEDICA', 'Médica'), ('VOLUNTARIA', 'Voluntaria')]

    tipo = models.CharField(max_length=20, choices=TIPO_ALTA)
    parto = models.ForeignKey(Parto, on_delete=models.PROTECT, related_name='altas')
    
    solicitado_por = models.ForeignKey(User, on_delete=models.PROTECT, related_name='solicitudes')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    autorizado_por = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='autorizaciones')
    fecha_autorizacion = models.DateTimeField(null=True, blank=True)
    
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Alta {self.estado} - Parto {self.parto.id}"