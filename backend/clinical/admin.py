from django.contrib import admin
from .models import Madre, Parto, RecienNacido, LogActividad, AltaMedica, Perfil

@admin.register(Madre)
class MadreAdmin(admin.ModelAdmin):
    # Quitamos 'prevision' de los filtros porque no existe en el modelo
    list_display = ('id', 'fecha_nacimiento', 'nacionalidad', 'comuna', 'created_at')
    list_filter = ('comuna', 'nacionalidad') 
    search_fields = ('rut_hash',) 

@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'hora', 'tipo_parto', 'edad_gestacional', 'profesional_acargo')
    list_filter = ('tipo_parto', 'fecha')
    search_fields = ('profesional_acargo',)

@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sexo', 'peso_gramos', 'talla_cm', 'apgar_1', 'apgar_5')
    list_filter = ('sexo', 'vacuna_bcg')

@admin.register(AltaMedica)
class AltaMedicaAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado', 'tipo', 'solicitado_por', 'fecha_solicitud')
    list_filter = ('estado', 'tipo')

@admin.register(LogActividad)
class LogActividadAdmin(admin.ModelAdmin):
    list_display = ('fecha_hora', 'username', 'rol', 'tipo_accion', 'modulo', 'ip_address')
    list_filter = ('tipo_accion', 'modulo', 'rol')
    search_fields = ('username', 'descripcion')
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol')
    list_filter = ('rol',)
    search_fields = ('usuario__username', 'usuario__email')