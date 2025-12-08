from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Madre, Parto, RecienNacido, PerfilUsuario

# --- CONFIGURACIÓN DE ROLES ---

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
    list_display = ('id', 'rut', 'nombre_completo', 'fecha_nacimiento', 'comuna')
    search_fields = ('comuna',) 

@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'hora', 'tipo_parto', 'profesional_acargo', 'madre')
    list_filter = ('tipo_parto', 'fecha')

@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sexo', 'peso_gramos', 'apgar_1', 'parto')
    list_filter = ('sexo', 'vacuna_bcg')