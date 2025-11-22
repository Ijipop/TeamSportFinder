import jwt  # type: ignore  # PyJWT package
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .utils import verify_clerk_token, get_user_from_clerk


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
            # Vérifier le token avec la fonction utilitaire
            verification_result = verify_clerk_token(token)
            
            if not verification_result.get('valid'):
                # Token invalide
                error_message = verification_result.get('error', 'Token invalide')
                return JsonResponse(
                    {'error': error_message},
                    status=401
                )
            
            # Token valide, récupérer les infos
            clerk_user_id = verification_result.get('user_id')
            clerk_email = verification_result.get('email')
            clerk_role = verification_result.get('role', 'player')
            decoded_token = verification_result.get('decoded_token', {})
            full_name = decoded_token.get('name') or decoded_token.get('full_name')
            
            # Récupérer l'utilisateur Django (sans créer)
            # Si l'utilisateur n'existe pas, il devra s'inscrire d'abord
            user = get_user_from_clerk(clerk_user_id)
            
            if user:
                # Ajouter l'utilisateur Django à la requête
                request.user = user
                request.clerk_user_id = clerk_user_id
                request.clerk_email = clerk_email
                request.clerk_role = clerk_role
            else:
                # L'utilisateur n'existe pas dans la base de données
                # On ne bloque pas la requête ici, mais l'endpoint vérifiera
                # On stocke juste les infos Clerk pour référence
                request.clerk_user_id = clerk_user_id
                request.clerk_email = clerk_email
                request.clerk_role = clerk_role
                # request.user restera AnonymousUser (géré par DRF)
                
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

