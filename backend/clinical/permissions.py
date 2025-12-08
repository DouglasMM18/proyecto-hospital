from rest_framework import permissions

class EsAdministradorAdmision(permissions.BasePermission):
    def has_permission(self, request, view):
        # Permite si es superuser O si tiene el rol correcto
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.perfil.rol == 'ADMIN_ADMISION'
        )

class EsEquipoClinico(permissions.BasePermission):
    """Permite acceso a Enfermeras y Matronas"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        rol = request.user.perfil.rol
        return request.user.is_superuser or rol in ['ENFERMERA', 'MATRONA']

class EsMatrona(permissions.BasePermission):
    """Solo Matronas (pueden borrar o editar todo)"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        return request.user.is_superuser or request.user.perfil.rol == 'MATRONA'

class EsSupervisor(permissions.BasePermission):
    """Solo Supervisor (Para ver reportes)"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        # El documento dice que el Supervisor/Jefe de Área genera reportes 
        return request.user.is_superuser or request.user.perfil.rol == 'SUPERVISOR'