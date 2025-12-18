from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Madre, Perfil, Parto, Alta, LogAudit, RecienNacido
from core.encryption import crypto_manager 

# ==========================================
# 1. LOGIN (JWT + Roles)
# ==========================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        if hasattr(user, 'perfil'):
            token['rol'] = user.perfil.rol
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        if hasattr(self.user, 'perfil'):
            data['rol'] = self.user.perfil.rol
        else:
            data['rol'] = 'TI'
        return data

# ==========================================
# 2. MADRE (CORRECCIÓN: Desencriptar TODO al leer)
# ==========================================
import hashlib
from rest_framework import serializers
from .models import Madre
from core.encryption import crypto_manager

class MadreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Madre
        fields = '__all__'

    # --- 1. CREAR (POST) ---
    def create(self, validated_data):
        # A. Generar Hash del RUT (Para búsquedas rápidas)
        if 'rut' in validated_data:
            rut_limpio = validated_data['rut']
            validated_data['rut_hash'] = hashlib.sha256(rut_limpio.encode()).hexdigest()

        # B. Encriptar datos sensibles
        self._encrypt_sensitive_data(validated_data)
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # A. Si cambian el RUT, actualizamos el Hash
        if 'rut' in validated_data:
            rut_limpio = validated_data['rut']
            validated_data['rut_hash'] = hashlib.sha256(rut_limpio.encode()).hexdigest()

        # B. Encriptar los datos nuevos (Dirección, Teléfono, etc.)
        self._encrypt_sensitive_data(validated_data)

        return super().update(instance, validated_data)

    # --- 3. FUNCIÓN AUXILIAR (Para no repetir código) ---
    def _encrypt_sensitive_data(self, data):
        # Lista de campos que SIEMPRE deben ser cifrados
        campos_sensibles = ['rut', 'nombre_completo', 'direccion', 'telefono', 'email']
        
        for campo in campos_sensibles:
            if campo in data:
                valor_real = data[campo]
                if valor_real: # Solo encriptamos si escribieron algo
                    try:
                        data[campo] = crypto_manager.encrypt(valor_real)
                    except Exception:
                        # Si falla, lanzamos error para no guardar basura
                        raise serializers.ValidationError({campo: "Error cifrando datos."})

    # --- 4. LEER (GET) ---
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Desencriptar para mostrar al usuario
        campos_sensibles = ['rut', 'nombre_completo', 'direccion', 'telefono', 'email']

        for campo in campos_sensibles:
            val = getattr(instance, campo, None)
            if val:
                try:
                    decrypted = crypto_manager.decrypt(val)
                    if decrypted and decrypted != "ERROR_DECRYPT":
                        representation[campo] = decrypted
                except Exception:
                    pass 
        return representation

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
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

class AltaSerializer(serializers.ModelSerializer):
    # 1. Campos calculados (usando tus métodos para desencriptar)
    madre_nombre = serializers.SerializerMethodField()
    madre_rut = serializers.SerializerMethodField()
    
    # 2. Campos directos (si NO están encriptados en el modelo Madre, usa 'source')
    # source='parto.madre.prevision' navega por las relaciones automáticamente
    prevision = serializers.CharField(source='parto.madre.prevision', default="Sin información", read_only=True)
    fecha_ingreso = serializers.DateTimeField(source='parto.fecha_ingreso', read_only=True)

    class Meta:
        model = Alta
        # Asegúrate de que los campos del modelo Alta estén aquí. 
        # Al usar __all__, Django incluirá los del modelo + los que definimos arriba manualmente.
        fields = '__all__'

    # Tu método existente
    def get_madre_nombre(self, obj):
        try:
            nombre_encriptado = obj.parto.madre.nombre_completo
            return crypto_manager.decrypt(nombre_encriptado)
        except:
            return "Desconocida"

    # Nuevo método para el RUT (asumiendo que también lo guardas encriptado)
    def get_madre_rut(self, obj):
        try:
            # Ajusta 'rut' al nombre real del campo en tu modelo Madre
            rut_encriptado = obj.parto.madre.rut 
            return crypto_manager.decrypt(rut_encriptado)
        except:
            return "S/R"

class LogAuditSerializer(serializers.ModelSerializer):
    # 1. FECHAS
    date = serializers.DateTimeField(source='fecha', read_only=True)
    created_at = serializers.DateTimeField(source='fecha', read_only=True)
    fecha_formateada = serializers.SerializerMethodField()
    # 2. ACCIÓN
    action = serializers.CharField(source='accion', read_only=True) 
    # 3. MÓDULO
    modulo = serializers.CharField(source='modelo', read_only=True)
    # 4. DESCRIPCIÓN
    descripcion = serializers.CharField(source='detalles', read_only=True)
    details = serializers.CharField(source='detalles', read_only=True)
    # 5. USUARIO
    username = serializers.CharField(source='usuario', read_only=True)
    # 6. IP
    ip = serializers.CharField(source='ip_address', read_only=True)

    class Meta:
        model = LogAudit
        fields = [
            'id', 
            'fecha', 'date', 'created_at', 'fecha_formateada',
            'usuario', 'username', 'rol',
            'accion', 'action',
            'modelo', 'modulo',
            'detalles', 'descripcion', 'details',
            'ip_address', 'ip'
        ]

    def get_fecha_formateada(self, obj):
        if obj.fecha:
            return obj.fecha.strftime('%d/%m/%Y %H:%M')
        return "-"
    
class UserSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    perfil = PerfilSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'role', 'perfil']

    def get_rol(self, obj):
        if hasattr(obj, 'perfil') and obj.perfil:
            return obj.perfil.rol
        return 'Sin Asignar'

    def get_role(self, obj):
        return self.get_rol(obj)