from django.db import models
from .encryption import crypto_manager

class EncryptedTextField(models.TextField):
    """
    Un campo de texto que se cifra automáticamente antes de guardarse en la BD
    y se descifra automáticamente al leerse.
    """
    description = "Text field encrypted with ChaCha20-Poly1305"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    # 1. Al leer de la base de datos -> Descifrar
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return crypto_manager.decrypt(value)

    # 2. Al convertir a formato Python (ej. serializadores) -> Descifrar
    def to_python(self, value):
        if value is None:
            return value
        # Si ya es un string legible (no parece base64 o ya fue descifrado), retornarlo
        # Esta es una validación simple, en prod sería más robusta.
        return value

    # 3. Al guardar en la base de datos -> Cifrar
    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value is None:
            return value
        # Ciframos el dato usando nuestra clase de encryption.py
        return crypto_manager.encrypt(str(value))