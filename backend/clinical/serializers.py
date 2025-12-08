from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Madre, Parto, RecienNacido
import hashlib

# --- SERIALIZER DE LOGIN PERSONALIZADO ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregamos el rol al token cifrado
        token['username'] = user.username
        try:
            token['rol'] = user.perfil.rol
        except Exception:
            # Si el usuario no tiene perfil (ej. superuser antiguo), asumimos TI o Admin
            token['rol'] = 'TI' 
            
        return token

# --- SERIALIZERS DE MODELOS ---

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True)
    class Meta:
        model = Parto
        fields = '__all__'

class MadreSerializer(serializers.ModelSerializer):
    partos = PartoSerializer(many=True, read_only=True)

    class Meta:
        model = Madre
        exclude = ['rut_hash'] 
        
    def validate_rut(self, value):
        clean_value = value.replace(".", "").upper().strip()
        incoming_hash = hashlib.sha256(clean_value.encode('utf-8')).hexdigest()
        
        queryset = Madre.objects.filter(rut_hash=incoming_hash)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Ya existe una paciente registrada con este RUT.")
            
        return clean_value