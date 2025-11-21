import os
import requests
import jwt  # type: ignore  # PyJWT package


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
        
        if not clerk_secret_key:
            return {'valid': False, 'error': 'CLERK_SECRET_KEY non configurée'}
        
        # Décoder le token (sans vérifier la signature pour l'instant)
        decoded = jwt.decode(
            token,
            options={"verify_signature": False}
        )
        
        # Vérifier avec l'API Clerk
        clerk_api_url = "https://api.clerk.com/v1/tokens/verify"
        headers = {
            'Authorization': f'Bearer {clerk_secret_key}',
            'Content-Type': 'application/json'
        }
        data = {'token': token}
        
        response = requests.post(clerk_api_url, headers=headers, json=data)
        
        if response.status_code == 200:
            return {
                'valid': True,
                'user_id': decoded.get('sub'),
                'email': decoded.get('email'),
                'role': decoded.get('metadata', {}).get('role', 'player')
            }
        else:
            return {'valid': False, 'error': 'Token invalide'}
            
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

