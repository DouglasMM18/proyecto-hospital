import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
# Agregamos AllowAny a la importación (mientras)
from rest_framework.permissions import IsAuthenticated, AllowAny 
from .models import Madre, Parto, RecienNacido
from .serializers import MadreSerializer, PartoSerializer, RecienNacidoSerializer

# --- Views ---
class MadreViewSet(viewsets.ModelViewSet):
    queryset = Madre.objects.all()
    serializer_class = MadreSerializer
    # Dejamos pasar a todos para probar (mientras)
    permission_classes = [AllowAny] 

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha', '-hora')
    serializer_class = PartoSerializer
    permission_classes = [AllowAny]

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer
    permission_classes = [AllowAny]

# --- FUNCIÓN DE EXPORTACIÓN ---
@api_view(['GET'])
@permission_classes([AllowAny]) # También lo abrimos para probar la descarga fácil
def exportar_partos_excel(request):
    """
    Genera un reporte CSV con los partos y recién nacidos.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="reporte_partos_urni.csv"'

    writer = csv.writer(response)
    
    writer.writerow([
        'ID Parto', 'Fecha', 'Hora', 'Tipo', 'Profesional', 
        'RUT Madre', 'Nombre Madre', 
        'Sexo RN', 'Peso', 'Talla', 'Apgar 1'
    ])

    partos = Parto.objects.all().select_related('madre').prefetch_related('recien_nacidos')

    for parto in partos:
        for rn in parto.recien_nacidos.all():
            writer.writerow([
                parto.id,
                parto.fecha,
                parto.hora,
                parto.tipo_parto,
                parto.profesional_acargo,
                parto.madre.rut, 
                parto.madre.nombre_completo,
                rn.sexo,
                rn.peso_gramos,
                rn.talla_cm,
                rn.apgar_1
            ])

    return response