from django.urls import path
from rest_framework.routers import DefaultRouter
from tournaments.views import TournamentViewSet, TeamViewSet

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournaments')
router.register(r'teams', TeamViewSet, basename='teams')

urlpatterns = router.urls