from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from .utils import verify_clerk_token


class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Authentification personnalisée pour DRF utilisant Clerk JWT
    
    Utilisation:
        Dans settings.py:
        REST_FRAMEWORK = {
            'DEFAULT_AUTHENTICATION_CLASSES': [
                'clerk_auth.authentication.ClerkAuthentication',
            ],
        }
    """
    
    def authenticate(self, request):
        """
        Authentifie la requête en vérifiant le token JWT Clerk
        
        Returns:
            tuple: (user, token) ou None si pas d'authentification
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        # Extraire le token en toute sécurité
        parts = auth_header.split(' ', 1)
        if len(parts) != 2:
            return None
        
        token = parts[1]
        verification_result = verify_clerk_token(token)
        
        if not verification_result.get('valid'):
            raise AuthenticationFailed(
                verification_result.get('error', 'Token invalide')
            )
        
        # Stocker les infos utilisateur dans la requête
        request.clerk_user_id = verification_result.get('user_id')
        request.clerk_email = verification_result.get('email')
        request.clerk_role = verification_result.get('role', 'player')
        
        # Retourner (user, token) - user sera None car on utilise Clerk
        # On peut créer un objet user factice ou utiliser le user_id
        user = None  # On utilisera request.clerk_user_id dans les views
        return (user, token)

