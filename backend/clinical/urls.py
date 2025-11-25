from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MadreViewSet, PartoViewSet, RecienNacidoViewSet
from .views import exportar_partos_excel

# El router crea las URLs automáticamente (ej: /api/madres/, /api/partos/)
router = DefaultRouter()
router.register(r'madres', MadreViewSet)
router.register(r'partos', PartoViewSet)
router.register(r'recien-nacidos', RecienNacidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('exportar-excel/', exportar_partos_excel, name='exportar_excel'),
]