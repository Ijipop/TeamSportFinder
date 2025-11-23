from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from matches.models import Match
from matches.serializers import (
    MatchSerializer,
    MatchCreateSerializer,
    MatchUpdateSerializer,
    MatchListSerializer
)
from accounts.permissions import IsOrganizer, IsPlayerOrOrganizer
from tournaments.models import Team


class MatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les matchs
    
    Endpoints:
    - GET /api/matches/ : Lister les matchs (selon le rôle)
    - GET /api/matches/{id}/ : Détails d'un match
    - GET /api/matches/my/ : Mes matchs (joueur uniquement)
    - POST /api/matches/ : Créer un match (organisateur uniquement)
    - PUT /api/matches/{id}/ : Modifier un match (organisateur propriétaire uniquement)
    - PATCH /api/matches/{id}/ : Modifier partiellement (organisateur propriétaire uniquement)
    - DELETE /api/matches/{id}/ : Supprimer un match (organisateur propriétaire uniquement)
    """
    queryset = Match.objects.all().select_related('team_a', 'team_b', 'team_a__tournament', 'team_b__tournament')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return MatchCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MatchUpdateSerializer
        elif self.action == 'list':
            return MatchListSerializer
        elif self.action == 'my':
            return MatchListSerializer
        return MatchSerializer

    def get_permissions(self):
        """Permissions dynamiques selon l'action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOrganizer()]
        elif self.action in ['list', 'retrieve', 'my']:
            return [IsAuthenticated(), IsPlayerOrOrganizer()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Filtre les matchs selon le rôle de l'utilisateur
        - Organisateur : voit les matchs de ses tournois
        - Joueur : voit les matchs de ses équipes
        """
        user = self.request.user
        
        if user.role == 'organizer':
            # Organisateur : voir les matchs de ses tournois
            return Match.objects.filter(
                Q(team_a__tournament__organizer=user) | Q(team_b__tournament__organizer=user)
            ).select_related('team_a', 'team_b', 'team_a__tournament', 'team_b__tournament')
        
        elif user.role == 'player':
            # Joueur : voir les matchs de ses équipes
            return Match.objects.filter(
                Q(team_a__members=user) | Q(team_b__members=user)
            ).select_related('team_a', 'team_b', 'team_a__tournament', 'team_b__tournament').distinct()
        
        return Match.objects.none()

    def perform_create(self, serializer):
        """Crée un match (validation faite dans le serializer)"""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Met à jour un match (seul l'organisateur du tournoi peut)"""
        match = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if match.team_a.tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier ce match.")
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Supprime un match (seul l'organisateur du tournoi peut)"""
        match = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur du tournoi
        if match.team_a.tournament.organizer != request.user:
            raise PermissionDenied("Vous n'êtes pas autorisé à supprimer ce match.")
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='my', permission_classes=[IsAuthenticated, IsPlayerOrOrganizer])
    def my(self, request):
        """
        Joueur : voir tous ses matchs (équipes où il est membre)
        Organisateur : voir tous les matchs de ses tournois
        """
        user = request.user
        queryset = self.get_queryset()
        
        # Filtre optionnel : matchs à venir / passés
        filter_type = request.query_params.get('filter', None)
        now = timezone.now()
        
        if filter_type == 'upcoming':
            queryset = queryset.filter(date__gte=now)
        elif filter_type == 'past':
            queryset = queryset.filter(date__lt=now)
        
        # Trier par date (les plus proches en premier)
        queryset = queryset.order_by('date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_context(self):
        """Ajoute le contexte (request) au serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
