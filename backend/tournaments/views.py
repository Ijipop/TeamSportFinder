from django.db import models as django_models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound

from tournaments.models import Tournament, Team
from tournaments.serializers import (
    TournamentSerializer,
    TournamentCreateSerializer,
    TournamentListSerializer,
    TeamSerializer,
    TeamCreateSerializer,
    TeamListSerializer,
    TeamUpdateSerializer
)
from accounts.permissions import IsOrganizer, IsPlayerOrOrganizer
from accounts.serializers import UserSerializer


class TournamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tournois
    
    Endpoints:
    - GET /api/tournaments/ : Lister tous les tournois (joueurs et organisateurs)
    - GET /api/tournaments/{id}/ : Détails d'un tournoi
    - GET /api/tournaments/my/ : Mes tournois (organisateur uniquement)
    - GET /api/tournaments/{id}/teams/ : Équipes d'un tournoi
    - POST /api/tournaments/ : Créer un tournoi (organisateur uniquement)
    - PUT /api/tournaments/{id}/ : Modifier un tournoi (organisateur propriétaire uniquement)
    - PATCH /api/tournaments/{id}/ : Modifier partiellement (organisateur propriétaire uniquement)
    - DELETE /api/tournaments/{id}/ : Supprimer un tournoi (organisateur propriétaire uniquement)
    """
    queryset = Tournament.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return TournamentCreateSerializer
        elif self.action == 'list':
            return TournamentListSerializer
        elif self.action == 'my':
            return TournamentListSerializer
        return TournamentSerializer

    def get_permissions(self):
        """Permissions dynamiques selon l'action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my']:
            return [permissions.IsAuthenticated(), IsOrganizer()]
        elif self.action in ['list', 'retrieve', 'teams']:
            return [permissions.IsAuthenticated(), IsPlayerOrOrganizer()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_context(self):
        """Ajoute le contexte (request) au serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        """Retourne les tournois selon le contexte"""
        # Pour l'action 'my', on filtre par organisateur
        if self.action == 'my':
            return Tournament.objects.filter(organizer=self.request.user)
        # Sinon, retourner tous les tournois
        return Tournament.objects.all().select_related('organizer').prefetch_related('teams')

    def perform_create(self, serializer):
        """Crée un tournoi avec l'organisateur connecté"""
        user = self.request.user
        
        # Vérifier que l'utilisateur est bien un organisateur
        if not hasattr(user, 'role') or user.role != 'organizer':
            raise PermissionDenied("Seuls les organisateurs peuvent créer un tournoi.")
        
        serializer.save(organizer=user)

    def update(self, request, *args, **kwargs):
        """Met à jour un tournoi (seul l'organisateur propriétaire peut)"""
        tournament = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier ce tournoi.")
        
        serializer = TournamentCreateSerializer(tournament, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner le tournoi complet
        response_serializer = TournamentSerializer(tournament)
        return Response(response_serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Met à jour partiellement un tournoi (seul l'organisateur propriétaire peut)"""
        tournament = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier ce tournoi.")
        
        serializer = TournamentCreateSerializer(tournament, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner le tournoi complet
        response_serializer = TournamentSerializer(tournament)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Supprime un tournoi (seul l'organisateur propriétaire peut)"""
        tournament = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à supprimer ce tournoi.")
        
        tournament.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='my', permission_classes=[permissions.IsAuthenticated, IsOrganizer])
    def my(self, request):
        """
        GET /api/tournaments/my/
        Liste tous les tournois créés par l'organisateur connecté
        """
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='teams', permission_classes=[permissions.IsAuthenticated, IsPlayerOrOrganizer])
    def teams(self, request, pk=None):
        """
        GET /api/tournaments/{id}/teams/
        Liste toutes les équipes d'un tournoi
        """
        tournament = self.get_object()
        teams = tournament.teams.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les équipes
    
    Endpoints:
    - GET /api/teams/ : Lister toutes les équipes (avec filtres)
    - GET /api/teams/{id}/ : Détails d'une équipe
    - GET /api/teams/search/ : Rechercher des équipes disponibles (joueurs)
    - GET /api/teams/{id}/members/ : Membres d'une équipe
    - POST /api/teams/ : Créer une équipe (organisateur uniquement)
    - PUT /api/teams/{id}/ : Modifier une équipe (organisateur propriétaire uniquement)
    - PATCH /api/teams/{id}/ : Modifier partiellement (organisateur propriétaire uniquement)
    - DELETE /api/teams/{id}/ : Supprimer une équipe (organisateur propriétaire uniquement)
    """
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return TeamCreateSerializer
        elif self.action == 'list':
            return TeamListSerializer
        elif self.action == 'search':
            return TeamListSerializer
        return TeamSerializer

    def get_permissions(self):
        """Permissions dynamiques selon l'action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOrganizer()]
        elif self.action in ['list', 'retrieve', 'search', 'members']:
            return [permissions.IsAuthenticated(), IsPlayerOrOrganizer()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_context(self):
        """Ajoute le contexte (request) au serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        """Retourne les équipes selon les filtres"""
        queryset = Team.objects.all().select_related('tournament', 'tournament__organizer').prefetch_related('members')
        
        # Filtre par tournoi (query param: ?tournament_id=...)
        tournament_id = self.request.query_params.get('tournament_id', None)
        if tournament_id:
            try:
                queryset = queryset.filter(tournament_id=tournament_id)
            except ValueError:
                pass  # Ignorer si l'UUID est invalide
        
        # Filtre par disponibilité (query param: ?available=true)
        available = self.request.query_params.get('available', None)
        if available == 'true':
            queryset = queryset.filter(current_capacity__lt=django_models.F('max_capacity'))
        
        # Filtre par recherche de nom (query param: ?search=...)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

    def perform_create(self, serializer):
        """Crée une équipe avec validation"""
        # La validation du tournoi et de l'organisateur est faite dans le serializer
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Met à jour une équipe (seul l'organisateur du tournoi peut)"""
        team = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if team.tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier cette équipe.")
        
        # Utiliser TeamUpdateSerializer (on ne peut pas changer le tournament_id)
        serializer = TeamUpdateSerializer(team, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner l'équipe complète
        response_serializer = TeamSerializer(team)
        return Response(response_serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Met à jour partiellement une équipe (seul l'organisateur du tournoi peut)"""
        team = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if team.tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier cette équipe.")
        
        # Utiliser TeamUpdateSerializer (on ne peut pas changer le tournament_id)
        serializer = TeamUpdateSerializer(team, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Retourner l'équipe complète
        response_serializer = TeamSerializer(team)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Supprime une équipe (seul l'organisateur du tournoi peut)"""
        team = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if team.tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à supprimer cette équipe.")
        
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[permissions.IsAuthenticated, IsPlayerOrOrganizer])
    def search(self, request):
        """
        GET /api/teams/search/?tournament_id=...&available=true&search=...
        Recherche des équipes disponibles pour les joueurs
        """
        queryset = self.get_queryset()
        
        # Par défaut, ne montrer que les équipes non pleines pour la recherche
        available = request.query_params.get('available', 'true')
        if available == 'true':
            queryset = queryset.filter(current_capacity__lt=django_models.F('max_capacity'))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='members', permission_classes=[permissions.IsAuthenticated, IsPlayerOrOrganizer])
    def members(self, request, pk=None):
        """
        GET /api/teams/{id}/members/
        Liste tous les membres d'une équipe
        """
        team = self.get_object()
        members = team.members.all()
        serializer = UserSerializer(members, many=True)
        return Response(serializer.data)