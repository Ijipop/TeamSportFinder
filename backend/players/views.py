from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound

from players.models import PlayerProfile
from players.serializers import (
    PlayerProfileSerializer,
    PlayerProfileCreateSerializer
)


class PlayerProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer le profil joueur
    
    Endpoints:
    - GET /api/players/profile/ : Récupérer mon profil
    - POST /api/players/profile/ : Créer mon profil
    - PUT /api/players/profile/ : Mettre à jour mon profil
    - PATCH /api/players/profile/ : Mettre à jour partiellement mon profil
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PlayerProfileSerializer
    # Désactiver les méthodes qui nécessitent un ID dans l'URL
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    
    def get_queryset(self):
        """
        Retourne uniquement le profil de l'utilisateur connecté
        """
        user = self.request.user
        return PlayerProfile.objects.filter(user=user)
    
    def get_object(self):
        """
        Retourne le profil de l'utilisateur connecté
        """
        user = self.request.user
        
        # Vérifier que l'utilisateur est bien authentifié et a un rôle
        if not hasattr(user, 'role'):
            raise PermissionDenied("Utilisateur sans role. Contactez l'administrateur.")
        
        # Vérifier que l'utilisateur est un joueur
        if user.role != 'player':
            raise PermissionDenied("Seuls les joueurs peuvent acceder a leur profil.")
        
        try:
            return PlayerProfile.objects.get(user=user)
        except PlayerProfile.DoesNotExist:
            raise NotFound("Profil joueur non trouve. Creez d'abord votre profil.")
    
    def list(self, request, *args, **kwargs):
        """
        GET /api/players/profile/
        Retourne le profil de l'utilisateur connecté
        """
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except NotFound:
            return Response(
                {'detail': "Profil non trouve. Creez d'abord votre profil."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request, *args, **kwargs):
        """
        POST /api/players/profile/
        Crée le profil joueur pour l'utilisateur connecté
        """
        user = request.user
        
        # Vérifier que l'utilisateur est bien authentifié et a un rôle
        if not hasattr(user, 'role'):
            raise PermissionDenied("Utilisateur sans role. Contactez l'administrateur.")
        
        # Vérifier que l'utilisateur est un joueur
        if user.role != 'player':
            raise PermissionDenied("Seuls les joueurs peuvent creer un profil.")
        
        # Vérifier que le profil n'existe pas déjà
        if PlayerProfile.objects.filter(user=user).exists():
            return Response(
                {'detail': "Vous avez deja un profil. Utilisez PUT ou PATCH pour le modifier."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le profil
        serializer = PlayerProfileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save(user=user)
        
        # Retourner le profil complet
        response_serializer = PlayerProfileSerializer(profile)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        PUT /api/players/profile/
        Met à jour complètement le profil
        """
        # Utiliser get_object() au lieu de kwargs.get('pk')
        profile = self.get_object()
        serializer = PlayerProfileCreateSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner le profil complet
        response_serializer = PlayerProfileSerializer(profile)
        return Response(response_serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        PATCH /api/players/profile/
        Met à jour partiellement le profil
        """
        # Utiliser get_object() au lieu de kwargs.get('pk')
        profile = self.get_object()
        serializer = PlayerProfileCreateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner le profil complet
        response_serializer = PlayerProfileSerializer(profile)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/players/profile/
        Supprime le profil (optionnel, selon vos besoins)
        """
        # Utiliser get_object() au lieu de kwargs.get('pk')
        profile = self.get_object()
        profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# organizers/views.py

from rest_framework.views import APIView
from accounts.permissions import IsOrganizer
from tournaments.models import Tournament, Team
from requestes.models import JoinRequest

class OrganizerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        user = request.user
        tournaments = Tournament.objects.filter(organizer=user)
        teams = Team.objects.filter(tournament__organizer=user)
        pending_requests = JoinRequest.objects.filter(team__tournament__organizer=user, status='pending')

        return Response({
            "nb_tournaments": tournaments.count(),
            "nb_teams": teams.count(),
            "pending_requests": pending_requests.count(),
            "tournaments": [
                {
                    "id": str(t.id),
                    "name": t.name,
                    "sport": t.sport,
                    "city": t.city,
                    "nb_teams": t.teams.count(),
                }
                for t in tournaments
            ]
        })