from rest_framework import permissions

class EsAdministradorAdmision(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser or request.user.is_staff: return True
        return bool(request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'ADMISION')

class EsMatrona(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True
        return bool(request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'MATRONA')

class EsEquipoClinico(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True
        return bool(request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol in ['MATRONA', 'MEDICO', 'ENFERMERA', 'TECNICO'])

class EsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True
        return bool(request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol == 'SUPERVISOR')

class EsAdminTI(permissions.BasePermission):
    def has_permission(self, request, view):
        # TIene acceso si es Superuser, Staff o tiene rol TI/ADMIN_TI
        if request.user.is_superuser or request.user.is_staff: return True
        return bool(request.user.is_authenticated and hasattr(request.user, 'perfil') and request.user.perfil.rol in ['TI', 'ADMIN_TI'])