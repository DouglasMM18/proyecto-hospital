import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
import hashlib
from django.http import HttpResponse, Http404
from django.template.loader import get_template
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth.models import User
from xhtml2pdf import pisa
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Madre, Parto, RecienNacido, LogActividad, AltaMedica

# --- IMPORTS CORREGIDOS ---
from .serializers import *
from .permissions import EsAdministradorAdmision, EsMatrona, EsEquipoClinico, EsSupervisor, EsAdminTI

def registrar_log(request, accion, modulo, descripcion):
    try:
        rol = request.user.perfil.rol if hasattr(request.user, 'perfil') else 'Anon'
        LogActividad.objects.create(
            usuario=request.user if request.user.is_authenticated else None,
            username=request.user.username if request.user.is_authenticated else 'Anon',
            rol=rol, tipo_accion=accion, modulo=modulo, descripcion=descripcion, ip_address=request.META.get('REMOTE_ADDR')
        )
    except: pass

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class MadreViewSet(viewsets.ModelViewSet):
    serializer_class = MadreSerializer
    queryset = Madre.objects.all()
    def get_queryset(self):
        qs = Madre.objects.all().order_by('-created_at')
        rut_param = self.request.query_params.get('rut')
        if rut_param:
            clean = rut_param.replace(".", "").replace("-", "").upper().strip()
            h = hashlib.sha256(clean.encode('utf-8')).hexdigest()
            qs = qs.filter(rut_hash=h)
        return qs
    def get_permissions(self):
        if self.action == 'create': return [EsAdministradorAdmision()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update']: return [EsEquipoClinico()]
        else: return [EsMatrona()]
    def perform_create(self, serializer):
        ins = serializer.save()
        registrar_log(self.request, 'CREAR', 'MADRE', f"ID: {ins.id}")

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all().order_by('-fecha')
    serializer_class = PartoSerializer
    def get_permissions(self):
        if self.action == 'create': return [EsEquipoClinico()]
        return [(EsMatrona | EsEquipoClinico)()]
    def perform_create(self, serializer):
        usuario = self.request.user
        nombre = f"{usuario.first_name} {usuario.last_name}".strip() or usuario.username
        ins = serializer.save(profesional_acargo=nombre)
        registrar_log(self.request, 'CREAR', 'PARTO', f"ID: {ins.id}")

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer

class AltaMedicaViewSet(viewsets.ModelViewSet):
    queryset = AltaMedica.objects.all()
    serializer_class = AltaMedicaSerializer
    def get_permissions(self):
        if self.action == 'create': return [EsEquipoClinico()]
        return [(EsMatrona | EsSupervisor)()]
    def perform_create(self, serializer):
        serializer.save(solicitado_por=self.request.user)
        registrar_log(self.request, 'CREAR', 'ALTA', "Solicitud")
    def perform_update(self, serializer):
        ins = serializer.save(autorizado_por=self.request.user, fecha_autorizacion=timezone.now())
        registrar_log(self.request, 'AUTORIZAR', 'ALTA', f"Estado: {ins.estado}")

class LogActividadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogActividad.objects.all().order_by('-fecha_hora')
    serializer_class = LogActividadSerializer
    permission_classes = [EsSupervisor | EsMatrona | EsAdminTI]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']: return [EsAdminTI()]
        return [(EsSupervisor | EsMatrona | EsAdminTI)()]
    def perform_create(self, serializer):
        user = serializer.save()
        registrar_log(self.request, 'CREAR', 'USUARIO', f"User: {user.username}")

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona | EsAdminTI]) 
def reporte_excel_completo(request):
    registrar_log(request, 'EXPORTAR', 'EXCEL', "Listado Partos")
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="Reporte_Gestion_Partos.xlsx"'
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Partos"
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="007bff")
    center_align = Alignment(horizontal="center")
    ws.append(['ID Parto', 'Fecha', 'Hora', 'Tipo', 'RUT Madre', 'Nombre', 'Edad G.', 'Profesional', 'RN Sexo', 'RN Peso'])
    for cell in ws[1]: cell.font = header_font; cell.fill = header_fill; cell.alignment = center_align
    
    for p in Parto.objects.select_related('madre').all().order_by('-fecha'):
        rn = p.recien_nacidos.first()
        ws.append([p.id, p.fecha, p.hora, p.tipo_parto, p.madre.rut, p.madre.nombre_completo, p.edad_gestacional, p.profesional_acargo, rn.sexo if rn else 'N/A', rn.peso_gramos if rn else 0])
    
    for col in ws.columns: ws.column_dimensions[col[0].column_letter].width = 20
    wb.save(response)
    return response

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona | EsAdminTI]) 
def reporte_pdf_rem(request):
    total = Parto.objects.count()
    cesareas = Parto.objects.filter(tipo_parto__icontains='CESAREA').count()
    normales = Parto.objects.filter(tipo_parto='EUTOCICO').count()
    context = {'partos': Parto.objects.all().order_by('-fecha')[:50], 'total_partos': total, 'total_cesareas': cesareas, 'total_normales': normales, 'fecha_generacion': timezone.now()}
    template = get_template('reporte_pdf.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Informe_REM.pdf"'
    pisa.CreatePDF(html, dest=response)
    return response

@api_view(['GET'])
@permission_classes([EsSupervisor | EsMatrona | EsAdminTI])
def reporte_auditoria_pdf(request):
    registrar_log(request, 'EXPORTAR', 'LOGS', "PDF Forense")
    context = {'logs': LogActividad.objects.all().order_by('-fecha_hora')[:200], 'fecha_generacion': timezone.now(), 'solicitante': request.user.username}
    template = get_template('auditoria_pdf.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Auditoria.pdf"'
    pisa.CreatePDF(html, dest=response)
    return response

@api_view(['GET'])
@permission_classes([EsMatrona | EsSupervisor])
def alta_medica_pdf(request, alta_id):
    try: alta = AltaMedica.objects.get(pk=alta_id)
    except: raise Http404("Alta no encontrada")
    if alta.estado != 'AUTORIZADA': return HttpResponse("Alta NO Autorizada.", status=400)
    registrar_log(request, 'EXPORTAR', 'ALTA', f"PDF Alta {alta.id}")
    context = {'parto': alta.parto, 'tipo_alta': alta.tipo, 'responsable': alta.autorizado_por.username, 'fecha_generacion': timezone.now()}
    template = get_template('alta_medica.html')
    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Alta_{alta.id}.pdf"'
    pisa.CreatePDF(html, dest=response)
    return response