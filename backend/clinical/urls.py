from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'madres', MadreViewSet, basename='madre')
router.register(r'partos', PartoViewSet)
router.register(r'recien-nacidos', RecienNacidoViewSet)
router.register(r'logs', LogActividadViewSet)
router.register(r'altas', AltaMedicaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reportes/excel/', reporte_excel_completo, name='reporte_excel'),
    path('reportes/pdf/', reporte_pdf_rem, name='reporte_rem'),
    path('reportes/auditoria/', reporte_auditoria_pdf, name='reporte_auditoria'),
    path('reportes/alta/<int:alta_id>/', alta_medica_pdf, name='alta_medica_pdf'),
]