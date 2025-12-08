from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MadreViewSet, 
    PartoViewSet, 
    RecienNacidoViewSet, 
    reporte_excel_completo,
    reporte_pdf_rem,
)

router = DefaultRouter()
router.register(r'madres', MadreViewSet)
router.register(r'partos', PartoViewSet)
router.register(r'recien-nacidos', RecienNacidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # --- NUEVOS REPORTES AVANZADOS ---
    path('reportes/excel/', reporte_excel_completo, name='reporte_excel_avanzado'),
    path('reportes/pdf/', reporte_pdf_rem, name='reporte_pdf_rem'),
]