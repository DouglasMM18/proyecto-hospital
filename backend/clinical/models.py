import hashlib
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.fields import EncryptedTextField
from django.conf import settings
from cryptography.fernet import Fernet

# --- HELPERS ENCRIPTACIÓN (Por si se usan manual) ---
def encrypt_data(data):
    if not data: return None
    f = Fernet(settings.ENCRYPTION_KEY)
    return f.encrypt(data.encode()).decode()

def decrypt_data(data):
    if not data: return None
    f = Fernet(settings.ENCRYPTION_KEY)
    return f.decrypt(data.encode()).decode()

# --- MODELOS CLÍNICOS ---

class Madre(models.Model):
    # Datos Sensibles
    rut = EncryptedTextField(help_text="RUT cifrado")
    rut_hash = models.CharField(max_length=64, db_index=True, editable=False)
    nombre_completo = EncryptedTextField()
    direccion = EncryptedTextField(null=True, blank=True)
    telefono = EncryptedTextField(null=True, blank=True)
    email = EncryptedTextField(null=True, blank=True)
    
    # Demográficos
    fecha_nacimiento = models.DateField()
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    comuna = models.CharField(max_length=100)
    cesfam = models.CharField(max_length=100, blank=True, null=True)
    nacionalidad = models.CharField(max_length=50, default="Chilena")
    es_migrante = models.BooleanField(default=False)
    
    # Cultural
    pueblo_originario = models.BooleanField(default=False)
    detalle_pueblo_originario = models.CharField(max_length=100, blank=True, null=True)

    # Ingreso
    tipo_paciente = models.CharField(max_length=100, blank=True, null=True)
    origen_ingreso = models.CharField(max_length=100, blank=True, null=True)

    # Clínicos
    tipo_discapacidad = EncryptedTextField(null=True, blank=True)
    observaciones = EncryptedTextField(null=True, blank=True) 
    vih_positivo = EncryptedTextField(default='NO')
    vdrl_reactivo = EncryptedTextField(default='NO')

    # Otros
    tiene_plan_parto = models.BooleanField(default=False)
    realizo_visita_guiada = models.BooleanField(default=False)
    tiene_acompanante = models.BooleanField(default=False)
    datos_acompanante = EncryptedTextField(null=True, blank=True)
    motivo_sin_acompanante = EncryptedTextField(null=True, blank=True)
    
    # Campos técnicos
    # AGREGAMOS ESTOS CAMPOS QUE FALTABAN PARA EL FORMULARIO DE ENFERMERA
    grupo_sanguineo = models.CharField(max_length=10, blank=True, null=True)
    factor_rh = models.CharField(max_length=10, blank=True, null=True)
    alergias = EncryptedTextField(blank=True, null=True)
    antecedentes_medicos = EncryptedTextField(blank=True, null=True)
    antecedentes_obstetricos = EncryptedTextField(blank=True, null=True)
    gestas = models.IntegerField(default=0)
    partos_vaginales = models.IntegerField(default=0)
    abortos = models.IntegerField(default=0)
    cesareas = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Blind Indexing manual si viene texto plano
        if self.rut and not self.rut.startswith('gAAAA'): 
            clean_rut = self.rut.replace(".", "").replace("-", "").upper().strip()
            self.rut_hash = hashlib.sha256(clean_rut.encode('utf-8')).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Madre ID {self.id}"

class Parto(models.Model):
    madre = models.ForeignKey(Madre, on_delete=models.PROTECT, related_name='partos')
    fecha = models.DateField()
    hora = models.TimeField()
    tipo_parto = models.CharField(max_length=50)
    edad_gestacional = models.IntegerField()
    profesional_acargo = models.CharField(max_length=150)
    observaciones = EncryptedTextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.fecha} - ID {self.id}"

class RecienNacido(models.Model):
    # OJO: related_name='recien_nacidos' es clave para que funcione el Excel
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    apellido_paterno = EncryptedTextField(blank=True, null=True)
    sexo = models.CharField(max_length=20)
    peso_gramos = models.IntegerField()
    talla_cm = models.FloatField()
    circunferencia_craneal = models.FloatField(null=True, blank=True)
    apgar_1 = models.IntegerField()
    apgar_5 = models.IntegerField()
    vacuna_bcg = models.BooleanField(default=False)
    vacuna_hepatitis_b = models.BooleanField(default=False)
    screening_auditivo = models.BooleanField(default=False)
    profilaxis_ocular = models.BooleanField(default=False)
    malformacion_congenita = EncryptedTextField(default='NO')
    observaciones = EncryptedTextField(blank=True, null=True)

    def __str__(self):
        return f"RN {self.sexo}"

# --- LOGS Y FLUJO ---

class LogActividad(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    username = models.CharField(max_length=150)
    rol = models.CharField(max_length=50)
    tipo_accion = models.CharField(max_length=20)
    modulo = models.CharField(max_length=20)
    descripcion = models.TextField()
    fecha_hora = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta: ordering = ['-fecha_hora']

class AltaMedica(models.Model):
    ESTADOS = [('PENDIENTE', 'Pendiente'), ('AUTORIZADA', 'Autorizada'), ('RECHAZADA', 'Rechazada')]
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='altas', null=True, blank=True)
    madre = models.ForeignKey(Madre, on_delete=models.CASCADE, related_name='altas', null=True, blank=True)
    
    solicitado_por = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='solicitudes', null=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    autorizado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='autorizaciones')
    fecha_autorizacion = models.DateTimeField(null=True, blank=True)
    
    observaciones = models.TextField(blank=True)
    tipo = models.CharField(max_length=50, default='MEDICA')

# --- PERFIL ÚNICO (Para Roles) ---
class Perfil(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=[
        ('TI', 'TI'),
        ('ADMISION', 'Admisión'),
        ('MATRONA', 'Matrona'),
        ('ENFERMERA', 'Enfermera'),
        ('MEDICO', 'Médico'),
        ('TECNICO', 'Técnico'),
        ('SUPERVISOR', 'Supervisor')
    ], default='ENFERMERA')

    def __str__(self):
        return f"{self.usuario.username} - {self.rol}"