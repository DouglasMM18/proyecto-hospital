from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MadreViewSet, 
    PartoViewSet, 
    RecienNacidoViewSet,
    AltaMedicaViewSet,
    LogActividadViewSet,
    UserViewSet,
    # Reportes
    reporte_pdf_rem,
    reporte_auditoria_pdf,
    alta_medica_pdf,
    reporte_excel_completo
)

# --- CONFIGURACIÓN DEL ROUTER (CRUD AUTOMÁTICO) ---
router = DefaultRouter()
router.register(r'madres', MadreViewSet)
router.register(r'partos', PartoViewSet)
router.register(r'recien-nacidos', RecienNacidoViewSet)
router.register(r'altas', AltaMedicaViewSet)
router.register(r'logs', LogActividadViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # 1. Rutas del CRUD (Router)
    path('', include(router.urls)),

    # 2. Rutas Manuales (Reportes PDF/Excel)
    path('reportes/rem/', reporte_pdf_rem, name='reporte_rem'),
    path('reportes/logs/', reporte_auditoria_pdf, name='reporte_logs'),
    path('reportes/excel/', reporte_excel_completo, name='reporte_excel'),
    # Esta ruta espera un ID (ej: /api/reportes/alta/5/)
    path('reportes/alta/<int:alta_id>/', alta_medica_pdf, name='reporte_alta'),
]