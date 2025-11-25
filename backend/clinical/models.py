from django.db import models
from core.fields import EncryptedTextField  # Importamos nuestro campo seguro

class Madre(models.Model):
    # DATOS SENSIBLES (Cifrados con ChaCha20) [cite: 16]
    rut = EncryptedTextField(unique=True, help_text="RUT cifrado de la paciente")
    nombre_completo = EncryptedTextField(help_text="Nombre completo cifrado")
    
    # Datos demográficos (Excel columnas: COMUNA, CESFAM, FECHA NAC MADRE, etc.) [cite: 115]
    fecha_nacimiento = models.DateField()
    comuna = models.CharField(max_length=100)
    cesfam = models.CharField(max_length=100, blank=True, null=True)
    nacionalidad = models.CharField(max_length=50, default="Chilena")
    es_migrante = models.BooleanField(default=False)
    pueblo_originario = models.BooleanField(default=False)

    def __str__(self):
        # Ojo: Al imprimir el objeto, se mostrará descifrado automáticamente
        return f"Paciente {self.id}"

class Parto(models.Model):
    # Relación: Una madre puede tener múltiples partos en el tiempo
    madre = models.ForeignKey(Madre, on_delete=models.PROTECT, related_name='partos')
    
    # Datos del evento (Excel: FECHA NAC, HORA, TIPO DE PARTO, PROFESIONAL) [cite: 115]
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
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parto {self.fecha} - {self.madre}"

class RecienNacido(models.Model):
    # Relación: Un parto puede tener 1 o más bebés (Gemelos)
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    
    # Datos Biométricos del RN (Excel: PESO, TALLA, SEXO, APGAR) [cite: 115]
    sexo = models.CharField(max_length=20, choices=[('FEMENINO', 'Femenino'), ('MASCULINO', 'Masculino'), ('INDETERMINADO', 'Indeterminado')])
    peso_gramos = models.IntegerField()
    talla_cm = models.FloatField()
    circunferencia_craneal = models.FloatField(verbose_name="CC")
    
    # Evaluaciones
    apgar_1 = models.IntegerField(verbose_name="Apgar 1'")
    apgar_5 = models.IntegerField(verbose_name="Apgar 5'")
    
    # Vacunas y Procedimientos (Booleanos para checkboxes rápidos)
    vacuna_bcg = models.BooleanField(default=False)
    vacuna_hepatitis_b = models.BooleanField(default=False)
    screening_auditivo = models.BooleanField(default=False)
    
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"RN {self.sexo} - {self.peso_gramos}g"