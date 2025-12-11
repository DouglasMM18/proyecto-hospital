from rest_framework import permissions

class EsAdministradorAdmision(permissions.BasePermission):
    """
    Permite acceso si es Superusuario O si tiene el rol 'ADMINISTRADOR'.
    CORRECCIÓN: Debe coincidir con el texto exacto de models.py
    """
    def has_permission(self, request, view):
        # 1. Autenticado?
        if not request.user.is_authenticated: 
            return False
        
        # 2. Tiene perfil? (Evita error 500 si el usuario no tiene perfil creado)
        if not hasattr(request.user, 'perfil'):
            return False

        # 3. Es Admin?
        return request.user.is_superuser or request.user.perfil.rol == 'ADMINISTRADOR'

class EsEquipoClinico(permissions.BasePermission):
    """
    Permite acceso a Enfermeras, Matronas y Supervisores.
    Estos roles pueden VER historias clínicas y CREAR partos,
    pero NO pueden crear Pacientes (Madres).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        if not hasattr(request.user, 'perfil'): return False
        
        rol = request.user.perfil.rol
        # Agregamos SUPERVISOR aquí para que también pueda ver las listas
        return request.user.is_superuser or rol in ['ENFERMERA', 'MATRONA', 'SUPERVISOR']

class EsMatrona(permissions.BasePermission):
    """
    Rol de Jefatura Clínica.
    Puede borrar o editar registros médicos mal ingresados.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        if not hasattr(request.user, 'perfil'): return False

        return request.user.is_superuser or request.user.perfil.rol == 'MATRONA'

class EsSupervisor(permissions.BasePermission):
    """
    Solo Supervisor (Para ver reportes y auditoría)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated: return False
        if not hasattr(request.user, 'perfil'): return False

        return request.user.is_superuser or request.user.perfil.rol == 'SUPERVISOR'