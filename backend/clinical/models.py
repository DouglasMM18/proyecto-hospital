import hashlib
from django.db import models
from django.contrib.auth.models import User

# 1. PERFIL (Roles)
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


class Madre(models.Model):
    # --- TUS CAMPOS (Están perfectos) ---
    rut = models.CharField(max_length=500, unique=True) # Encriptado
    rut_hash = models.CharField(max_length=64, db_index=True, editable=False, null=True) # Hash Búsqueda
    
    nombre_completo = models.CharField(max_length=500)
    direccion = models.CharField(max_length=500, null=True, blank=True)
    telefono = models.CharField(max_length=500, null=True, blank=True)
    email = models.CharField(max_length=500, null=True, blank=True)
    
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
    tipo_discapacidad = models.CharField(max_length=500, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    vih_positivo = models.CharField(max_length=500, default='NO')
    vdrl_reactivo = models.CharField(max_length=500, default='NO')

    # Otros
    tiene_plan_parto = models.BooleanField(default=False)
    realizo_visita_guiada = models.BooleanField(default=False)
    tiene_acompanante = models.BooleanField(default=False)
    datos_acompanante = models.CharField(max_length=500, null=True, blank=True)
    motivo_sin_acompanante = models.CharField(max_length=500, null=True, blank=True)
    
    # Técnicos
    grupo_sanguineo = models.CharField(max_length=10, blank=True, null=True)
    factor_rh = models.CharField(max_length=10, blank=True, null=True)
    alergias = models.CharField(max_length=500, blank=True, null=True)
    antecedentes_medicos = models.TextField(blank=True, null=True)
    antecedentes_obstetricos = models.TextField(blank=True, null=True)
    gestas = models.IntegerField(default=0)
    partos_vaginales = models.IntegerField(default=0)
    abortos = models.IntegerField(default=0)
    cesareas = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Madre ID {self.id}"

# 3. PARTO
class Parto(models.Model):
    madre = models.ForeignKey(Madre, on_delete=models.PROTECT, related_name='partos')
    fecha = models.DateTimeField(auto_now_add=True) # Simplificado para evitar error de campo fecha
    tipo_parto = models.CharField(max_length=50)
    edad_gestacional = models.IntegerField()
    profesional_acargo = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.id} - {self.madre.nombre_completo}"

# 4. RECIEN NACIDO (¡Importante mantenerlo!)
class RecienNacido(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    apellido_paterno = models.CharField(max_length=500, blank=True, null=True)
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
    malformacion_congenita = models.CharField(max_length=500, default='NO')
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"RN {self.sexo} ({self.parto.id})"

# 5. ALTA (Renombrado de AltaMedica para compatibilidad)
class Alta(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='altas', null=True, blank=True)
    tipo = models.CharField(max_length=50, default='MEDICA')
    observaciones = models.TextField(blank=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='PENDIENTE') # PENDIENTE, AUTORIZADA, RECHAZADA
    autorizado_por = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Alta {self.estado}"

class LogAudit(models.Model):
    usuario = models.CharField(max_length=150, null=True, blank=True)
    rol = models.CharField(max_length=50, default='Desconocido')
    accion = models.CharField(max_length=50)    # <--- Se llama 'accion'
    modelo = models.CharField(max_length=50)    # <--- Se llama 'modelo'
    detalles = models.TextField()               # <--- Se llama 'detalles'
    fecha = models.DateTimeField(auto_now_add=True) 
    ip_address = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.fecha} - {self.usuario}"