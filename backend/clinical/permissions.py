from rest_framework import permissions

class EsAdministradorAdmision(permissions.BasePermission):
    def has_permission(self, request, view):
        # 1. Autenticado?
        if not request.user.is_authenticated: 
            return False
        # 2. Tiene perfil?
        if not hasattr(request.user, 'perfil'):
            return False
        # 3. Es Admin?
        return request.user.is_superuser or request.user.perfil.rol == 'ADMINISTRADOR'

class EsEquipoClinico(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'perfil'):
            return False
        rol = request.user.perfil.rol
        return request.user.is_superuser or rol in ['ADMINISTRADOR' , 'ENFERMERA', 'MATRONA', 'SUPERVISOR']

class EsMatrona(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        if not hasattr(request.user, 'perfil'): return False

        return request.user.is_superuser or request.user.perfil.rol == 'MATRONA'

class EsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        if not hasattr(request.user, 'perfil'): return False

        return request.user.is_superuser or request.user.perfil.rol == 'SUPERVISOR'