# Backend API - Hospital URNI

Este backend está construido en Django REST Framework.

## 🚀 Cómo levantarlo

1. Crear entorno: `python -m venv venv`
2. Activar: `source venv/Scripts/activate`
3. Instalar: `pip install -r requirements.txt`
4. Migrar BD: `python manage.py migrate`
5. Crear Admin: `python manage.py createsuperuser`
6. Correr: `python manage.py runserver`

## 🔐 Credenciales

- Usuario Admin: admin
- Contraseña: admin1234

## 📡 Endpoints Disponibles (API)

**Autenticación (JWT):**

- Login (Obtener Token): `POST /api/token/`
  - Body: `{ "username": "...", "password": "..." }`
- Refrescar Token: `POST /api/token/refresh/`

**Clínica (Requieren Header: `Authorization: Bearer <tu_token>`):**

- Listar Madres: `GET /api/madres/`
- Crear Madre: `POST /api/madres/`
- Ver Ficha Madre: `GET /api/madres/<id>/`
- Registrar Parto: `POST /api/partos/`
- Registrar Recién Nacido: `POST /api/recien-nacidos/`

**Reportes:**

- Exportar Excel: `GET /api/exportar-excel/`
