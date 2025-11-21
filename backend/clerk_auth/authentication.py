from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from .utils import verify_clerk_token, get_or_create_user_from_clerk


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
        
        # Récupérer ou créer l'utilisateur Django
        clerk_user_id = verification_result.get('user_id')
        clerk_email = verification_result.get('email')
        clerk_role = verification_result.get('role', 'player')
        
        # Extraire le nom complet depuis le token décodé si disponible
        decoded_token = verification_result.get('decoded_token', {})
        full_name = decoded_token.get('name') or decoded_token.get('full_name') or None
        
        # Récupérer ou créer l'utilisateur Django
        user = get_or_create_user_from_clerk(
            clerk_user_id=clerk_user_id,
            email=clerk_email,
            full_name=full_name,
            role=clerk_role
        )
        
        # Stocker les infos Clerk dans la requête (pour référence)
        request.clerk_user_id = clerk_user_id
        request.clerk_email = clerk_email
        request.clerk_role = clerk_role
        
        # Retourner l'utilisateur Django et le token
        return (user, token)

