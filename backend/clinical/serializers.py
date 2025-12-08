from rest_framework import serializers
from .models import Madre, Parto, RecienNacido
import hashlib

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    # Anidamos los recién nacidos para verlos dentro del parto
    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True)

    class Meta:
        model = Parto
        fields = '__all__'

class MadreSerializer(serializers.ModelSerializer):
    # Anidamos los partos para ver el historial clínico de la madre
    partos = PartoSerializer(many=True, read_only=True)
    class Meta:
        model = Madre
        # Excluimos rut_hash para que no aparezca en la API
        exclude = ['rut_hash'] 
        
    def validate_rut(self, value):
        """
        Normalizamos el RUT antes de que llegue al modelo
        y verificamos manualmente si el hash ya existe.
        """
        # 1. Esto asegura que 12.345.678-9 sea igual a 12345678-9
        clean_value = value.replace(".", "").upper().strip()
        # 2. Generar el hash de lo que viene llegando
        incoming_hash = hashlib.sha256(clean_value.encode('utf-8')).hexdigest()
        # 3. Verificar si ya existe en la BD
        queryset = Madre.objects.filter(rut_hash=incoming_hash)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Ya existe una paciente registrada con este RUT.")
            
        return clean_value