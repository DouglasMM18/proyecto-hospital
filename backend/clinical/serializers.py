from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil, Madre, Parto, RecienNacido, AltaMedica, LogActividad
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Ejecuta la validación normal (verifica usuario/pass)
        data = super().validate(attrs)
        
        # 2. Agrega datos extra a la respuesta JSON directa (no solo al token)
        data['username'] = self.user.username
        data['email'] = self.user.email
        
        # 3. Determinar el Rol
        if hasattr(self.user, 'perfil'):
            data['rol'] = self.user.perfil.rol
        elif self.user.is_superuser:
            data['rol'] = 'TI'  # Si es superuser sin perfil, es TI
        else:
            data['rol'] = 'INVITADO'
            
        return data

# --- SERIALIZER DE USUARIO (Con creación de rol) ---
class UserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(write_only=True, required=False)
    rol_actual = serializers.CharField(source='perfil.rol', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'rol', 'rol_actual']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        rol_nombre = validated_data.pop('rol', 'ENFERMERA')
        # Crear usuario encriptado
        user = User.objects.create_user(**validated_data)
        # Crear perfil asociado
        Perfil.objects.create(usuario=user, rol=rol_nombre)
        return user

# --- MODELOS CLÍNICOS ---
class MadreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Madre
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True)
    class Meta:
        model = Parto
        fields = '__all__'

class AltaMedicaSerializer(serializers.ModelSerializer):
    madre_nombre = serializers.CharField(source='madre.nombre_completo', read_only=True)
    solicitante = serializers.CharField(source='solicitado_por.username', read_only=True)
    class Meta:
        model = AltaMedica
        fields = '__all__'

class LogActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogActividad
        fields = '__all__'