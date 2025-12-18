from django.contrib import admin
# Importamos los modelos con sus NOMBRES NUEVOS
from .models import Madre, Parto, RecienNacido, Alta, LogAudit, Perfil

# 1. Perfil (Roles)
@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol')
    search_fields = ('usuario__username', 'rol')

# 2. Madre
@admin.register(Madre)
class MadreAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_completo', 'rut', 'created_at')
    search_fields = ('nombre_completo', 'rut')
    list_filter = ('nacionalidad', 'comuna')

# 3. Parto
@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'madre', 'fecha', 'tipo_parto')
    list_filter = ('tipo_parto',)

# 4. Recién Nacido
@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'parto', 'sexo', 'peso_gramos', 'apgar_1')
    list_filter = ('sexo',)

# 5. Alta (La de la campanita)
@admin.register(Alta)
class AltaAdmin(admin.ModelAdmin):
    list_display = ('id', 'parto', 'estado', 'tipo', 'fecha_solicitud')
    list_filter = ('estado', 'tipo')
    actions = ['marcar_autorizada']

    def marcar_autorizada(self, request, queryset):
        queryset.update(estado='AUTORIZADA')
    marcar_autorizada.short_description = "Autorizar altas seleccionadas"

# 6. Auditoría (Logs de seguridad)
@admin.register(LogAudit)
class LogAuditAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'usuario', 'accion', 'modelo', 'ip_address')
    list_filter = ('accion', 'modelo')
    readonly_fields = ('usuario', 'rol', 'accion', 'modelo', 'detalles', 'ip_address', 'fecha')
    
    # Quitamos permiso de agregar/borrar logs para que sea inmutable (Punto extra de seguridad)
    def has_add_permission(self, request):
        return False
    def has_delete_permission(self, request, obj=None):
        return False