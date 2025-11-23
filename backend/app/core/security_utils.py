from cryptography.fernet import Fernet
import base64
from app.core.config import settings

def get_cipher_suite():
    # Use the SECRET_KEY to generate a Fernet key
    # Fernet requires a 32-byte url-safe base64-encoded key
    key = settings.SECRET_KEY
    
    # Ensure key is 32 bytes
    if len(key) < 32:
        key = key.ljust(32, '0')
    elif len(key) > 32:
        key = key[:32]
        
    key_bytes = base64.urlsafe_b64encode(key.encode())
    return Fernet(key_bytes)

def encrypt_string(text: str) -> str:
    if not text:
        return None
    cipher_suite = get_cipher_suite()
    encrypted_bytes = cipher_suite.encrypt(text.encode())
    return encrypted_bytes.decode()

def decrypt_string(encrypted_text: str) -> str:
    if not encrypted_text:
        return None
    cipher_suite = get_cipher_suite()
    decrypted_bytes = cipher_suite.decrypt(encrypted_text.encode())
    return decrypted_bytes.decode()
