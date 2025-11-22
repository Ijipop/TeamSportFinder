from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TournamentViewSet, TeamViewSet, JoinRequestViewSet, MatchViewSet

router = DefaultRouter()
router.register(r"tournaments", TournamentViewSet, basename="tournament")
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"join-requests", JoinRequestViewSet, basename="joinrequest")
router.register(r"matches", MatchViewSet, basename="match")

urlpatterns = [
    path("", include(router.urls)),
]