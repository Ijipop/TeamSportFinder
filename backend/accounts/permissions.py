# backend/accounts/permissions.py
from rest_framework import permissions

class IsPlayer(permissions.BasePermission):
    """Permission pour les joueurs uniquement"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role == 'player'
        )

class IsOrganizer(permissions.BasePermission):
    """Permission pour les organisateurs uniquement"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role == 'organizer'
        )

class IsPlayerOrOrganizer(permissions.BasePermission):
    """Permission pour joueurs ou organisateurs"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role in ['player', 'organizer']
        )

# from rest_framework.permissions import BasePermission

# class IsPlayer(BasePermission):
#     """
#     Permission pour les joueurs (role == 'player')
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'player'


# class IsOrganizer(BasePermission):
#     """
#     Permission pour les organisateurs (role == 'organizer')
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'organizer'