from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MyTokenObtainPairView,
    MadreViewSet,
    PartoViewSet, 
    RecienNacidoViewSet,
    AltaViewSet,
    LogAuditViewSet,
    UserViewSet,
    reporte_excel_completo,
    alta_medica_pdf,
    reporte_auditoria_pdf,
    reporte_pdf_rem,
)

router = DefaultRouter()
router.register(r'madres', MadreViewSet)
router.register(r'partos', PartoViewSet)
router.register(r'recien-nacidos', RecienNacidoViewSet)
router.register(r'altas', AltaViewSet)
router.register(r'logs', LogAuditViewSet)
router.register(r'users', UserViewSet) 

urlpatterns = [
    path('', include(router.urls)),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reportes/excel-partos/', reporte_excel_completo, name='reporte_excel'),
    path('reportes/excel/', reporte_excel_completo, name='reporte_excel_alt'),
    path('reportes/pdf-auditoria/', reporte_auditoria_pdf, name='reporte_auditoria'),
    path('reportes/auditoria/', reporte_auditoria_pdf, name='reporte_auditoria_alt'),
    path('reportes/logs/', reporte_auditoria_pdf, name='reporte_auditoria_logs'),
    path('reportes/rem/', reporte_pdf_rem, name='reporte_rem'),
    path('altas/<int:pk>/pdf/', alta_medica_pdf, name='alta_pdf'),
]