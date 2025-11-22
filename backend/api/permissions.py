from rest_framework.permissions import BasePermission

class IsPlayer(BasePermission):
    """
    Permission : accessible uniquement aux joueurs
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "player")


class IsOrganizer(BasePermission):
    """
    Permission : accessible uniquement aux organisateurs
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "organizer")


class IsAuthenticatedClerk(BasePermission):
    """
    Vérifie que l'utilisateur est bien authentifié via Clerk
    (ici tu peux brancher la logique JWT Clerk)
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)