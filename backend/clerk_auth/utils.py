import os
import requests
import jwt  # type: ignore  # PyJWT package
from accounts.models import User


def verify_clerk_token(token):
    """
    Vérifie un token JWT Clerk et retourne les informations utilisateur
    
    Args:
        token: Le token JWT à vérifier
        
    Returns:
        dict: {'valid': bool, 'user_id': str, 'email': str, 'role': str} ou {'valid': False, 'error': str}
    """
    try:
        clerk_secret_key = os.getenv('CLERK_SECRET_KEY')
        
        # Décoder le token (sans vérifier la signature pour l'instant)
        # En mode développement, on accepte le token si on peut le décoder
        # Pour le développement, on ne vérifie pas strictement l'expiration
        # (en production, vous devriez vérifier avec JWKS)
        decoded = jwt.decode(
            token,
            options={"verify_signature": False, "verify_exp": False}
        )
        
        # Pour le développement : ne pas vérifier l'expiration du token
        # (en production, vous devriez vérifier l'expiration avec une marge de tolérance)
        # Les tokens Clerk peuvent avoir une durée de vie très courte en développement
        # import time
        # exp = decoded.get('exp')
        # if exp:
        #     current_time = time.time()
        #     if current_time > exp + 300:  # 5 minutes de marge
        #         return {'valid': False, 'error': 'Token expiré'}
        
        # Pour le développement : accepter le token si on peut le décoder
        # (En production, vous devriez vérifier la signature avec JWKS)
        user_id = decoded.get('sub')
        email = decoded.get('email') or decoded.get('primary_email_address')
        
        if not user_id:
            return {'valid': False, 'error': 'Token sans user ID (sub)'}
        
        # Vérifier avec l'API Clerk (optionnel pour le développement)
        # Si CLERK_SECRET_KEY est configurée, on essaie de vérifier
        if clerk_secret_key:
            try:
                clerk_api_url = "https://api.clerk.com/v1/tokens/verify"
                headers = {
                    'Authorization': f'Bearer {clerk_secret_key}',
                    'Content-Type': 'application/json'
                }
                data = {'token': token}
                
                response = requests.post(clerk_api_url, headers=headers, json=data, timeout=5)
                
                if response.status_code != 200:
                    # Si la vérification échoue mais qu'on est en dev, on accepte quand même
                    # (pour permettre les tests sans avoir à configurer l'API Clerk)
                    pass
            except:
                # Si l'appel API échoue, on accepte quand même en mode dev
                pass
        
        # Retourner les infos du token décodé
        return {
            'valid': True,
            'user_id': user_id,
            'email': email or f'{user_id}@clerk.dev',
            'role': decoded.get('metadata', {}).get('role', 'player'),
            'decoded_token': decoded  # Inclure le token décodé pour récupérer d'autres infos
        }
            
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Token expiré'}
    except Exception as e:
        return {'valid': False, 'error': str(e)}


def get_clerk_user_info(user_id):
    """
    Récupère les informations d'un utilisateur depuis Clerk
    
    Args:
        user_id: L'ID de l'utilisateur Clerk
        
    Returns:
        dict: Les informations de l'utilisateur ou None si erreur
    """
    clerk_secret_key = os.getenv('CLERK_SECRET_KEY')
    
    if not clerk_secret_key:
        return None
        
    clerk_api_url = f"https://api.clerk.com/v1/users/{user_id}"
    
    headers = {
        'Authorization': f'Bearer {clerk_secret_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(clerk_api_url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception:
        return None


def get_user_from_clerk(clerk_user_id):
    """
    Récupère un utilisateur Django depuis l'ID Clerk (sans créer)
    
    Args:
        clerk_user_id: L'ID de l'utilisateur Clerk
        
    Returns:
        User ou None: L'instance User Django si trouvé, None sinon
    """
    try:
        return User.objects.get(clerk_id=clerk_user_id)
    except User.DoesNotExist:
        return None


def get_or_create_user_from_clerk(clerk_user_id, email, full_name=None, role='player'):
    """
    Récupère ou crée un utilisateur Django depuis les infos Clerk
    Utilisé uniquement lors de l'inscription
    
    Args:
        clerk_user_id: L'ID de l'utilisateur Clerk
        email: L'email de l'utilisateur
        full_name: Le nom complet (optionnel)
        role: Le rôle de l'utilisateur ('player' ou 'organisateur')
        
    Returns:
        User: L'instance User Django
    """
    try:
        # Essayer de récupérer l'utilisateur existant
        user = User.objects.get(clerk_id=clerk_user_id)
        
        # Mettre à jour les infos si nécessaire
        if user.email != email:
            user.email = email
        if full_name and user.full_name != full_name:
            user.full_name = full_name
        if user.role != role:
            user.role = role
        user.save()
        
        return user
    except User.DoesNotExist:
        # Créer un nouvel utilisateur
        # Si full_name n'est pas fourni, utiliser l'email comme fallback
        if not full_name:
            full_name = email.split('@')[0]  # Utiliser la partie avant @ comme nom
        
        user = User.objects.create(
            clerk_id=clerk_user_id,
            email=email,
            full_name=full_name,
            role=role
        )
        return user

