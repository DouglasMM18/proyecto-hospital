import hashlib # Generar la huella
from django.db import models
from core.fields import EncryptedTextField 

class Madre(models.Model):
    rut = EncryptedTextField(help_text="RUT cifrado (lectura)")
    # Aquí guardamos el SHA-256 del RUT limpio. 
    # "db_index=True" hace las búsquedas ultra rápidas.
    # unique=True impide que la base de datos acepte duplicados.
    rut_hash = models.CharField(max_length=64, unique=True, db_index=True, editable=False)

    nombre_completo = EncryptedTextField(help_text="Nombre completo cifrado")
    direccion = EncryptedTextField(null=True, blank=True)
    telefono = EncryptedTextField(null=True, blank=True)
    fecha_nacimiento = models.DateField()
    comuna = models.CharField(max_length=100)
    cesfam = models.CharField(max_length=100, blank=True, null=True)
    nacionalidad = models.CharField(max_length=50, default="Chilena")
    es_migrante = models.BooleanField(default=False)
    pueblo_originario = models.BooleanField(default=False)
    vih_positivo = EncryptedTextField(default='NO')
    vdrl_reactivo = EncryptedTextField(default='NO')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.rut:
            # Quitamos puntos y convertimos a mayúsculas
            clean_rut = self.rut.replace(".", "").upper().strip()
            # Generar Hash (Huella Digital)
            # Usamos SHA-256. Esto siempre genera el mismo string para el mismo RUT.
            self.rut_hash = hashlib.sha256(clean_rut.encode('utf-8')).hexdigest()
            # Guardamos el RUT limpio en el campo encriptado también
            # para que al desencriptar siempre se vea ordenado.
            self.rut = clean_rut
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Madre ID {self.id}"

class Parto(models.Model):
    # Una madre puede tener múltiples partos en el tiempo
    madre = models.ForeignKey(Madre, on_delete=models.PROTECT, related_name='partos')
    # Datos del evento
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
    profesional_acargo = models.CharField(max_length=150) # Matrona/Médico
    # Observaciones puede contener datos sensibles de la evolución
    observaciones = EncryptedTextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.fecha} - ID Madre {self.madre.id}"

class RecienNacido(models.Model):
    # Un parto puede tener 1 o más bebés (Gemelos)
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    # Identidad ("Apellido Paterno RN" cifrado)
    apellido_paterno = EncryptedTextField(blank=True, null=True)
    # Datos Biométricos del RN (Excel: PESO, TALLA, SEXO, APGAR)
    sexo = models.CharField(max_length=20, choices=[
        ('FEMENINO', 'Femenino'), 
        ('MASCULINO', 'Masculino'), 
        ('INDETERMINADO', 'Indeterminado')
    ])
    peso_gramos = models.IntegerField()
    talla_cm = models.FloatField()
    circunferencia_craneal = models.FloatField(verbose_name="CC", null=True, blank=True)
    # Evaluaciones
    apgar_1 = models.IntegerField(verbose_name="Apgar 1'")
    apgar_5 = models.IntegerField(verbose_name="Apgar 5'")
    # Vacunas y Procedimientos (Booleanos para checkboxes rápidos)
    vacuna_bcg = models.BooleanField(default=False)
    vacuna_hepatitis_b = models.BooleanField(default=False)
    screening_auditivo = models.BooleanField(default=False)
    profilaxis_ocular = models.BooleanField(default=False)
    # Datos Clínicos Sensibles del Bebé
    malformacion_congenita = EncryptedTextField(default='NO')
    observaciones = EncryptedTextField(blank=True, null=True) # Observaciones hay que dejarlo protegido

    def __str__(self):
        return f"RN {self.sexo} - {self.peso_gramos}g"