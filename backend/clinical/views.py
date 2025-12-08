import openpyxl
from django.http import HttpResponse
from django.template.loader import get_template
from django.utils import timezone
from django.db.models import Count, Q
from xhtml2pdf import pisa
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Madre, Parto, RecienNacido
from .serializers import (
    MadreSerializer, 
    PartoSerializer, 
    RecienNacidoSerializer, 
    MyTokenObtainPairSerializer
)
from .permissions import EsSupervisor, EsMatrona, EsEquipoClinico

# --- VISTA LOGIN ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- VIEWSETS (CRUD) ---
class MadreViewSet(viewsets.ModelViewSet):
    queryset = Madre.objects.all().order_by('-created_at')
    serializer_class = MadreSerializer
    permission_classes = [AllowAny] 

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha', '-hora')
    serializer_class = PartoSerializer
    permission_classes = [AllowAny]

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer
    permission_classes = [AllowAny]

# --- NUEVO: REPORTE EXCEL AVANZADO (.xlsx) ---
@api_view(['GET'])
@permission_classes([AllowAny]) # Idealmente cambiar a [EsSupervisor]
def reporte_excel_completo(request):
    """
    Genera un Excel nativo con formato, filtros y estadísticas.
    Cumple con el requerimiento de 'Exportar Data Cruda' pero mejorado.
    """
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = 'attachment; filename="Reporte_Gestion_Partos.xlsx"'

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Registro de Partos"

    # 1. Cabecera con Estilo
    headers = ['ID', 'Fecha', 'Hora', 'Tipo Parto', 'Sem. Gestación', 'Profesional', 'RUT Madre', 'Nombre Madre', 'Sexo RN', 'Peso (g)', 'Apgar 1']
    ws.append(headers)
    
    # Negrita para la cabecera
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)

    # 2. Datos
    partos = Parto.objects.all().select_related('madre').prefetch_related('recien_nacidos')
    
    for parto in partos:
        # Manejo de múltiples bebés (gemelos)
        rns = parto.recien_nacidos.all()
        sexo_str = ", ".join([rn.sexo for rn in rns])
        peso_str = ", ".join([str(rn.peso_gramos) for rn in rns])
        apgar_str = ", ".join([str(rn.apgar_1) for rn in rns])

        ws.append([
            parto.id,
            parto.fecha,
            parto.hora,
            parto.tipo_parto,
            parto.edad_gestacional,
            parto.profesional_acargo,
            parto.madre.rut,       # Se desencripta auto
            parto.madre.nombre_completo, # Se desencripta auto
            sexo_str,
            peso_str,
            apgar_str
        ])

    wb.save(response)
    return response

# --- NUEVO: REPORTE PDF (REM) ---
@api_view(['GET'])
@permission_classes([AllowAny]) # Idealmente cambiar a [EsSupervisor]
def reporte_pdf_rem(request):
    """
    Genera un PDF oficial con estadísticas calculadas (Valor Agregado).
    """
    # 1. Calcular Estadísticas (Inteligencia de Negocios)
    total_partos = Parto.objects.count()
    # Usamos Q objects para filtros complejos
    cesareas = Parto.objects.filter(Q(tipo_parto__icontains='CESAREA')).count()
    normales = Parto.objects.filter(tipo_parto='EUTOCICO').count()

    # 2. Preparar datos para el HTML
    partos = Parto.objects.all().select_related('madre').prefetch_related('recien_nacidos').order_by('-fecha')[:50] # Últimos 50 para el PDF

    context = {
        'partos': partos,
        'total_partos': total_partos,
        'total_cesareas': cesareas,
        'total_normales': normales,
        'fecha_generacion': timezone.now()
    }

    # 3. Renderizar HTML a PDF
    template_path = 'reporte_pdf.html' # Debe estar en templates/
    template = get_template(template_path)
    html = template.render(context)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Reporte_REM.pdf"'

    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Tuvimos errores al generar el PDF <pre>' + html + '</pre>')
    
    return response