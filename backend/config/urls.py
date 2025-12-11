from django.shortcuts import redirect
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from clinical.views import MyTokenObtainPairView 


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Clínica
    path('api/', include('clinical.urls')),
    
    # Rutas de Autenticación (Login)
    # Usamos TU vista que inyecta el ROL en el token
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]