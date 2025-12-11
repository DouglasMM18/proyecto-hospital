from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Madre, Parto, RecienNacido, PerfilUsuario, LogActividad, AltaMedica

# --- CONFIGURACIÓN DE ROLES EN EL USUARIO ---
class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    verbose_name_plural = 'Rol Asignado'

class UserAdmin(BaseUserAdmin):
    inlines = (PerfilUsuarioInline,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# --- MODELOS CLÍNICOS ---

@admin.register(Madre)
class MadreAdmin(admin.ModelAdmin):
    list_display = ('id', 'rut_hash', 'created_at')
    # Ocultamos el RUT real y Nombre en la lista para que se vea cifrado
    # (Solo al entrar a editar se desencripta)

@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'tipo_parto', 'profesional_acargo')
    list_filter = ('tipo_parto', 'fecha')

@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sexo', 'peso_gramos', 'parto')
    list_filter = ('sexo',)

@admin.register(LogActividad)
class LogActividadAdmin(admin.ModelAdmin):
    # Esto es vital para la auditoría: Ver quién hizo qué y cuándo
    list_display = ('fecha_hora', 'username', 'rol', 'tipo_accion', 'modulo', 'ip_address')
    list_filter = ('tipo_accion', 'modulo', 'rol')
    search_fields = ('username', 'descripcion')
    readonly_fields = ('fecha_hora', 'ip_address') # Nadie debe poder editar la fecha de un log

@admin.register(AltaMedica)
class AltaMedicaAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'estado', 'solicitado_por', 'fecha_solicitud')
    list_filter = ('estado', 'tipo')
    actions = ['autorizar_alta']

    def autorizar_alta(self, request, queryset):
        # Acción rápida para aprobar desde el admin
        queryset.update(estado='AUTORIZADA')
    autorizar_alta.short_description = "Autorizar Altas seleccionadas"