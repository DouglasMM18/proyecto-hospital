from django.contrib import admin
from .models import Madre, Parto, RecienNacido

@admin.register(Madre)
class MadreAdmin(admin.ModelAdmin):
    # Mostramos columnas clave. Recuerda que RUT y Nombre se descifran solos al leerse.
    list_display = ('id', 'rut', 'nombre_completo', 'fecha_nacimiento', 'comuna')
    # Buscador: Django intentará buscar en texto cifrado, lo cual es complejo. 
    # Para el MVP, la búsqueda en campos cifrados es limitada, pero lo configuramos igual.
    search_fields = ('comuna',) 

@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'hora', 'tipo_parto', 'profesional_acargo', 'madre')
    list_filter = ('tipo_parto', 'fecha') # Filtros laterales útiles

@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sexo', 'peso_gramos', 'apgar_1', 'parto')
    list_filter = ('sexo', 'vacuna_bcg')