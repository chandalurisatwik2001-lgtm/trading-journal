"""
Google OAuth verification service
"""
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

def verify_google_token(token: str) -> dict:
    """
    Verify Google ID token and extract user information.
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        dict: User information from Google (email, name, picture, sub)
        
    Raises:
        ValueError: If token is invalid
    """
    try:
        # Get Google Client ID from settings
        client_id = settings.GOOGLE_CLIENT_ID
        
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured")
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            client_id
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer')
        
        # Extract user information
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
        
    except ValueError as e:
        # Invalid token
        raise ValueError(f"Invalid Google token: {str(e)}")
    except Exception as e:
        # Other errors
        raise ValueError(f"Error verifying Google token: {str(e)}")
