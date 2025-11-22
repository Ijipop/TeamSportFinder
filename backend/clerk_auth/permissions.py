"""
Permissions personnalisées pour Clerk
"""
from rest_framework import permissions


class IsClerkAuthenticated(permissions.BasePermission):
    """
    Permission qui vérifie que l'utilisateur est authentifié avec Clerk
    (même s'il n'existe pas encore dans la base de données Django)
    """
    def has_permission(self, request, view):
        # Vérifier que les infos Clerk sont présentes (même si user est AnonymousUser)
        return (
            hasattr(request, 'clerk_user_id') and 
            request.clerk_user_id is not None
        )

