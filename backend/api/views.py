
from rest_framework import viewsets, permissions
from .serializers import *
from accounts.models import User
# from players.models import PlayerProfile
from tournaments.models import Tournament, Team
from requestes.models import JoinRequest
from matches.models import Match

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# class PlayerProfileViewSet(viewsets.ModelViewSet):
#     queryset = PlayerProfile.objects.all()
#     serializer_class = PlayerProfileSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class JoinRequestViewSet(viewsets.ModelViewSet):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestSerializer

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from api.permissions import IsOrganizer, IsPlayer
# from tournaments.models import Team
# from .serializers import TeamSerializer
# from django.db.models import F

# class TeamViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les équipes.
#     - Organisateur : CRUD complet
#     - Joueur : lecture seule + recherche
#     """
#     queryset = Team.objects.all()
#     serializer_class = TeamSerializer
#     permission_classes = [IsAuthenticated]

#     def get_permissions(self):
#         if self.action in ["create", "update", "partial_update", "destroy"]:
#             return [IsAuthenticated(), IsOrganizer()]
#         elif self.action in ["list", "retrieve"]:
#             return [IsAuthenticated(), IsPlayer()]
#         return [IsAuthenticated()]

#     def get_queryset(self):
#         user = self.request.user
#         qs = Team.objects.all()

#         # Filtres pour les joueurs
#         sport = self.request.query_params.get("sport")
#         city = self.request.query_params.get("city")
#         available = self.request.query_params.get("available")

#         if sport:
#             qs = qs.filter(tournament__sport__iexact=sport)
#         if city:
#             qs = qs.filter(tournament__city__iexact=city)
#         if available == "true":
#             qs = qs.filter(current_capacity__lt=F("max_capacity"))

#         # Organisateur → ses propres équipes
#         if user.role == "organizer":
#             qs = qs.filter(tournament__organizer=user)

#         return qs

#     def create(self, request, *args, **kwargs):
#         """Créer une équipe (organisateur uniquement)"""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)