from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Madre, Parto, RecienNacido, LogActividad, AltaMedica, PerfilUsuario
from django.contrib.auth.models import User

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
        fields = '__all__' # Esto tomará automáticamente el email, ciudad, acompañante, etc.

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

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['rol']

class UserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'last_login', 'rol']