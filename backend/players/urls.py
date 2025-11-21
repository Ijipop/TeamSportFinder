from django.urls import path, include
from rest_framework.routers import DefaultRouter
from players.views import PlayerProfileViewSet

# Créer un router pour les ViewSets
router = DefaultRouter()
router.register(r'profile', PlayerProfileViewSet, basename='player-profile')

urlpatterns = [
    path('', include(router.urls)),
]

