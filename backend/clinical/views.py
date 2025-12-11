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
# CORRECCIÓN 1: Agregamos EsAdministradorAdmision a los imports
from .permissions import EsAdministradorAdmision, EsSupervisor, EsMatrona, EsEquipoClinico

# --- VISTA LOGIN ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- VIEWSETS (CRUD) ---

class MadreViewSet(viewsets.ModelViewSet):
    # CORRECCIÓN 2: Restauramos el queryset y serializer (Vital para que no falle el router)
    queryset = Madre.objects.all().order_by('-created_at')
    serializer_class = MadreSerializer

    def get_permissions(self):
        """
        Seguridad:
        - Crear: Solo Admisión (ADMINISTRADOR) o Matrona. (Enfermera NO pasa)
        - Ver: Equipo Clínico.
        - Editar/Borrar: Solo Matrona.
        """
        if self.action == 'create':
            permission_classes = [EsAdministradorAdmision | EsMatrona]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [EsEquipoClinico | EsAdministradorAdmision]
        else:
            permission_classes = [EsMatrona]
            
        return [permission() for permission in permission_classes] 

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha', '-hora')
    serializer_class = PartoSerializer
    
    # CORRECCIÓN 3: Seguridad real en lugar de AllowAny
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [EsEquipoClinico] # Enfermeras sí crean partos
        elif self.action in ['list', 'retrieve']:
            permission_classes = [EsEquipoClinico | EsSupervisor]
        else:
            permission_classes = [EsMatrona] # Solo Matrona edita/borra
        return [permission() for permission in permission_classes]

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer
    
    # CORRECCIÓN 3: Seguridad real
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [EsEquipoClinico]
        else:
            permission_classes = [EsMatrona | EsEquipoClinico]
        return [permission() for permission in permission_classes]

# --- REPORTE EXCEL AVANZADO (.xlsx) ---
@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona]) # Seguridad Activada
def reporte_excel_completo(request):
    """
    Genera un Excel nativo con formato, filtros y estadísticas.
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
            parto.madre.rut,       
            parto.madre.nombre_completo,
            sexo_str,
            peso_str,
            apgar_str
        ])

    wb.save(response)
    return response

# --- REPORTE PDF (REM) ---
@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona]) # Seguridad Activada
def reporte_pdf_rem(request):
    """
    Genera un PDF oficial con estadísticas calculadas.
    """
    total_partos = Parto.objects.count()
    cesareas = Parto.objects.filter(Q(tipo_parto__icontains='CESAREA')).count()
    normales = Parto.objects.filter(tipo_parto='EUTOCICO').count()

    partos = Parto.objects.all().select_related('madre').prefetch_related('recien_nacidos').order_by('-fecha')[:50]

    context = {
        'partos': partos,
        'total_partos': total_partos,
        'total_cesareas': cesareas,
        'total_normales': normales,
        'fecha_generacion': timezone.now()
    }

    try:
        template = get_template('reporte_pdf.html')
        html = template.render(context)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Reporte_REM.pdf"'
        pisa_status = pisa.CreatePDF(html, dest=response)
        
        if pisa_status.err:
            return HttpResponse('Error PDF', status=500)
        return response
    except Exception as e:
         return HttpResponse(f"Error generando PDF: {str(e)}", status=500)