from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Madre, Parto, RecienNacido, LogActividad, AltaMedica

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        if hasattr(user, 'perfil'):
            token['rol'] = user.perfil.rol
        return token

class MadreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Madre
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parto
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

class LogActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogActividad
        fields = '__all__'

class AltaMedicaSerializer(serializers.ModelSerializer):
    madre_nombre = serializers.CharField(source='parto.madre.nombre_completo', read_only=True)
    solicitante = serializers.CharField(source='solicitado_por.username', read_only=True)
    autorizador = serializers.CharField(source='autorizado_por.username', read_only=True)
    
    class Meta:
        model = AltaMedica
        fields = '__all__'