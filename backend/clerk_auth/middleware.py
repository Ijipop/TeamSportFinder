import os
import requests
import jwt  # type: ignore  # PyJWT package
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class ClerkJWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware pour authentifier les requêtes via JWT Clerk
    
    Utilisation:
        Dans settings.py:
        MIDDLEWARE = [
            ...
            'clerk_auth.middleware.ClerkJWTAuthenticationMiddleware',
            ...
        ]
    """
    
    def process_request(self, request):
        """
        Traite la requête et vérifie le token JWT Clerk
        """
        # Ignorer les endpoints publics
        public_paths = [
            '/admin/',
            '/api/auth/',
            '/api/docs/',
            '/api/schema/',
            '/static/',
            '/media/',
        ]
        
        if any(request.path.startswith(path) for path in public_paths):
            return None
        
        # Récupérer le token depuis le header Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            # Pas de token = requête non authentifiée
            # (géré par les permissions DRF)
            return None
        
        # Extraire le token en toute sécurité
        parts = auth_header.split(' ', 1)
        if len(parts) != 2:
            return None
        
        token = parts[1]
        
        try:
            clerk_secret_key = os.getenv('CLERK_SECRET_KEY')
            
            if not clerk_secret_key:
                return JsonResponse(
                    {'error': 'Configuration Clerk manquante'},
                    status=500
                )
            
            # Décoder le token JWT
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            
            # Vérifier le token avec l'API Clerk
            clerk_api_url = "https://api.clerk.com/v1/tokens/verify"
            headers = {
                'Authorization': f'Bearer {clerk_secret_key}',
                'Content-Type': 'application/json'
            }
            data = {'token': token}
            
            response = requests.post(clerk_api_url, headers=headers, json=data)
            
            if response.status_code == 200:
                # Token valide, ajouter les infos utilisateur à la requête
                request.clerk_user_id = decoded_token.get('sub')
                request.clerk_email = decoded_token.get('email')
                request.clerk_role = decoded_token.get('metadata', {}).get('role', 'player')
            else:
                # Token invalide
                return JsonResponse(
                    {'error': 'Token invalide'},
                    status=401
                )
                
        except jwt.ExpiredSignatureError:
            return JsonResponse(
                {'error': 'Token expiré'},
                status=401
            )
        except jwt.InvalidTokenError:
            return JsonResponse(
                {'error': 'Token invalide'},
                status=401
            )
        except Exception as e:
            return JsonResponse(
                {'error': f'Erreur d\'authentification: {str(e)}'},
                status=401
            )
        
        return None

