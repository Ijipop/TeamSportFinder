from rest_framework import viewsets, permissions
from tournaments.models import Tournament, Team
from tournaments.serializers import TournamentSerializer, TeamSerializer


class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # L’organisateur est automatiquement l’utilisateur connecté
        serializer.save(organizer=self.request.user)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # L’équipe est liée à un tournoi existant
        serializer.save()