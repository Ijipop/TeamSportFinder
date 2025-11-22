from rest_framework.permissions import BasePermission

class IsPlayer(BasePermission):
    """
    Permission pour les joueurs (role == 'player')
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'player'


class IsOrganizer(BasePermission):
    """
    Permission pour les organisateurs (role == 'organizer')
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'organizer'