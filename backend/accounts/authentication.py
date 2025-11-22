"""
Authentification JWT avec Clerk
"""
import jwt
import requests
from django.conf import settings
from rest_framework import authentication, exceptions
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class ClerkJWTAuthentication(authentication.BaseAuthentication):
    """
    Authentification basée sur les JWT tokens de Clerk
    """
    
    def authenticate(self, request):
        """
        Authentifie la requête en vérifiant le JWT token de Clerk
        """
        # Récupérer le token depuis le header Authorization
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None  # Pas de token = pas d'authentification
        
        # Le format attendu est: "Bearer <token>"
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise exceptions.AuthenticationFailed('Format du header Authorization invalide')
        
        token = parts[1]
        
        try:
            # Décoder et valider le JWT
            payload = self.verify_jwt(token)
            
            # Créer un objet utilisateur simplifié
            user = ClerkUser(payload)
            
            return (user, None)  # (user, auth) tuple
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expiré')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Token invalide: {str(e)}')
        except Exception as e:
            logger.error(f"Erreur d'authentification: {str(e)}")
            raise exceptions.AuthenticationFailed('Erreur d\'authentification')
    
    def verify_jwt(self, token):
        """
        Vérifie et décode le JWT token en utilisant les JWKS de Clerk
        """
        # Récupérer les JWKS (JSON Web Key Set) de Clerk
        jwks = self.get_jwks()
        
        # Décoder le header du token pour obtenir le 'kid' (Key ID)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        
        if not kid:
            raise jwt.InvalidTokenError('Token sans kid')
        
        # Trouver la bonne clé dans le JWKS
        signing_key = None
        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                # Construire la clé publique RSA
                signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not signing_key:
            raise jwt.InvalidTokenError('Clé de signature introuvable')
        
        # Décoder et valider le token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=['RS256'],
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iat': True,
            }
        )
        
        return payload
    
    def get_jwks(self):
        """
        Récupère les JWKS de Clerk (avec cache pour optimiser)
        """
        cache_key = 'clerk_jwks'
        jwks = cache.get(cache_key)
        
        if jwks is None:
            # Télécharger les JWKS depuis Clerk
            jwks_url = settings.CLERK_JWKS_URL
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            jwks = response.json()
            
            # Mettre en cache pour 1 heure
            cache.set(cache_key, jwks, 3600)
        
        return jwks


class ClerkUser:
    """
    Classe représentant un utilisateur Clerk
    Compatible avec Django REST Framework
    """
    
    def __init__(self, payload):
        self.payload = payload
        self.clerk_user_id = payload.get('sub')  # 'sub' contient l'user ID
        self.email = payload.get('email', '')
        self.first_name = payload.get('given_name', '')
        self.last_name = payload.get('family_name', '')
        self.is_authenticated = True
        self.is_active = True
    
    @property
    def is_anonymous(self):
        return False
    
    @property
    def full_name(self):
        """Nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def __str__(self):
        return self.email or self.clerk_user_id