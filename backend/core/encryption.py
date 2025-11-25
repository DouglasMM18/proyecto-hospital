import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
from django.conf import settings

class CryptoManager:
    """
    Clase encargada de manejar el cifrado y descifrado usando ChaCha20-Poly1305.
    """
    
    def __init__(self):
        # La llave debe ser de 32 bytes para ChaCha20.
        key_b64 = getattr(settings, 'ENCRYPTION_KEY', None)
        if not key_b64:
            raise ValueError("La llave de encriptación no está configurada en settings.")
        
        try:
            self.key = base64.urlsafe_b64decode(key_b64)
            self.aead = ChaCha20Poly1305(self.key)
        except Exception as e:
            raise ValueError(f"Error al inicializar criptografía: {e}")

    def encrypt(self, plaintext: str) -> str:
        if not plaintext:
            return None
        
        # Convertir texto a bytes
        data = plaintext.encode('utf-8')
        
        # Generar Nonce aleatorio de 12 bytes (VITAL para la seguridad)
        nonce = os.urandom(12)
        
        # Cifrar
        ciphertext = self.aead.encrypt(nonce, data, None)
        
        # Guardar nonce + ciphertext juntos
        combined = nonce + ciphertext
        
        # Retornar como string base64 para guardar en BD
        return base64.urlsafe_b64encode(combined).decode('utf-8')

    def decrypt(self, token: str) -> str:
        if not token:
            return None
            
        try:
            # Decodificar base64 a bytes
            combined = base64.urlsafe_b64decode(token)
            
            # Separar nonce (primeros 12 bytes) y ciphertext
            nonce = combined[:12]
            ciphertext = combined[12:]
            
            # Descifrar
            plaintext = self.aead.decrypt(nonce, ciphertext, None)
            return plaintext.decode('utf-8')
        except Exception:
            # En producción loguearíamos el error, aquí retornamos un indicador
            return "ERROR_DECRYPT"

# Instancia global
crypto_manager = CryptoManager()