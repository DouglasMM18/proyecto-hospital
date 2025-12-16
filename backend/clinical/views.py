import openpyxl
import hashlib
from django.http import HttpResponse, Http404
from django.template.loader import get_template
from django.utils import timezone
from django.db.models import Count, Q
from xhtml2pdf import pisa
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Madre, Parto, RecienNacido, LogActividad, AltaMedica
from .serializers import *
from .permissions import EsAdministradorAdmision, EsMatrona, EsEquipoClinico, EsSupervisor

# --- HELPER DE LOGS ---
def registrar_log(request, accion, modulo, descripcion):
    try:
        rol = request.user.perfil.rol if hasattr(request.user, 'perfil') else 'Anon'
        LogActividad.objects.create(
            usuario=request.user if request.user.is_authenticated else None,
            username=request.user.username if request.user.is_authenticated else 'Anon',
            rol=rol,
            tipo_accion=accion,
            modulo=modulo,
            descripcion=descripcion,
            ip_address=request.META.get('REMOTE_ADDR')
        )
    except Exception as e:
        print(f"Log Error: {e}")

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- VIEWSETS ---

class MadreViewSet(viewsets.ModelViewSet):
    serializer_class = MadreSerializer
    queryset = Madre.objects.all()

    def get_queryset(self):
        # BLIND INDEXING: Búsqueda por Hash
        qs = Madre.objects.all().order_by('-created_at')
        rut_param = self.request.query_params.get('rut')
        if rut_param:
            clean = rut_param.replace(".", "").replace("-", "").upper().strip()
            h = hashlib.sha256(clean.encode('utf-8')).hexdigest()
            qs = qs.filter(rut_hash=h)
        return qs

    def get_permissions(self):
        if self.action == 'create': 
            return [(EsAdministradorAdmision | EsMatrona)()]
        if self.action in ['list','retrieve']: 
            return [(EsEquipoClinico | EsAdministradorAdmision)()]
        return [EsMatrona()]

    def perform_create(self, serializer):
        ins = serializer.save()
        registrar_log(self.request, 'CREAR', 'MADRE', f"ID: {ins.id}")

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha')
    serializer_class = PartoSerializer
    
    def get_permissions(self):
        if self.action == 'create': 
            return [EsEquipoClinico()]
        return [(EsMatrona | EsEquipoClinico)()]

    def perform_create(self, serializer):
        ins = serializer.save()
        registrar_log(self.request, 'CREAR', 'PARTO', f"ID: {ins.id}")

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer

# --- NUEVO: CRUD ALTAS ---
class AltaMedicaViewSet(viewsets.ModelViewSet):
    queryset = AltaMedica.objects.all()
    serializer_class = AltaMedicaSerializer

    def get_permissions(self):
        if self.action == 'create': 
            return [EsEquipoClinico()]
        return [(EsMatrona | EsSupervisor)()]

    def perform_create(self, serializer):
        serializer.save(solicitado_por=self.request.user)
        registrar_log(self.request, 'CREAR', 'ALTA', "Solicitud Alta")

    def perform_update(self, serializer):
        ins = serializer.save(autorizado_por=self.request.user, fecha_autorizacion=timezone.now())
        registrar_log(self.request, 'AUTORIZAR', 'ALTA', f"Estado: {ins.estado}")

class LogActividadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogActividad.objects.all()
    serializer_class = LogActividadSerializer
    permission_classes = [EsSupervisor | EsMatrona]

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [EsSupervisor | EsMatrona] 

# --- REPORTES ---

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona]) 
def reporte_excel_completo(request):
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="Gestion_Partos.xlsx"'
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Partos"
    ws.append(['ID', 'Fecha', 'Tipo', 'RUT Madre', 'Nombre Madre'])
    for p in Parto.objects.all():
        ws.append([p.id, p.fecha, p.tipo_parto, p.madre.rut, p.madre.nombre_completo])
    wb.save(response)
    return response

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona]) 
def reporte_pdf_rem(request):
    total = Parto.objects.count()
    cesareas = Parto.objects.filter(tipo_parto__icontains='CESAREA').count()
    normales = Parto.objects.filter(tipo_parto='EUTOCICO').count()
    context = {'partos': Parto.objects.all()[:50], 'total_partos': total, 'total_cesareas': cesareas, 'total_normales': normales, 'fecha_generacion': timezone.now()}
    template = get_template('reporte_pdf.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    pisa.CreatePDF(html, dest=response)
    return response

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona])
def reporte_auditoria_pdf(request):
    registrar_log(request, 'EXPORTAR', 'LOGS', "PDF Forense")
    context = {'logs': LogActividad.objects.all()[:200], 'fecha_generacion': timezone.now(), 'solicitante': request.user.username}
    template = get_template('auditoria_pdf.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Auditoria.pdf"'
    pisa.CreatePDF(html, dest=response)
    return response

@api_view(['GET'])
@permission_classes([EsMatrona | EsSupervisor])
def alta_medica_pdf(request, alta_id):
    try:
        alta = AltaMedica.objects.get(pk=alta_id)
    except AltaMedica.DoesNotExist:
        raise Http404("Alta no encontrada")
    
    if alta.estado != 'AUTORIZADA':
        return HttpResponse("Alta NO Autorizada.", status=400)

    registrar_log(request, 'EXPORTAR', 'ALTA', f"PDF Alta {alta.id}")
    context = {
        'parto': alta.parto, 'tipo_alta': alta.tipo, 
        'responsable': alta.autorizado_por.username, 'fecha_generacion': timezone.now()
    }
    template = get_template('alta_medica.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Alta_{alta.id}.pdf"'
    pisa.CreatePDF(html, dest=response)
    return response