import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Madre, Parto, RecienNacido
from .serializers import MadreSerializer, PartoSerializer, RecienNacidoSerializer

# --- Views ---

class MadreViewSet(viewsets.ModelViewSet):
    queryset = Madre.objects.all()
    serializer_class = MadreSerializer
    permission_classes = [IsAuthenticated] 

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha', '-hora')
    serializer_class = PartoSerializer
    permission_classes = [IsAuthenticated]

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer
    permission_classes = [IsAuthenticated]

# --- FUNCIÓN DE EXPORTACIÓN ---

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Se proteje la vista
def exportar_partos_excel(request):
    """
    Genera un reporte CSV con los partos y recién nacidos.
    """
    # Configuramos la respuesta para que sea un archivo descargable
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="reporte_partos_urni.csv"'

    writer = csv.writer(response)
    
    # 1. Cabecera del Excel
    writer.writerow([
        'ID Parto', 'Fecha', 'Hora', 'Tipo', 'Profesional', 
        'RUT Madre', 'Nombre Madre', 
        'Sexo RN', 'Peso', 'Talla', 'Apgar 1'
    ])

    # 2. Consultamos los datos (optimizando la consulta para velocidad)
    partos = Parto.objects.all().select_related('madre').prefetch_related('recien_nacidos')

    # 3. Escribimos fila por fila
    for parto in partos:
        # Como un parto puede tener gemelos, iteramos los bebés
        for rn in parto.recien_nacidos.all():
            writer.writerow([
                parto.id,
                parto.fecha,
                parto.hora,
                parto.tipo_parto,
                parto.profesional_acargo,
                parto.madre.rut, # Al acceder a .rut, tu campo custom lo descifra automáticamente
                parto.madre.nombre_completo,
                rn.sexo,
                rn.peso_gramos,
                rn.talla_cm,
                rn.apgar_1
            ])

    return response