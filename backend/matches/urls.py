from django.urls import path
from rest_framework.routers import DefaultRouter
from matches.views import MatchViewSet

router = DefaultRouter()
router.register(r'matches', MatchViewSet, basename='matches')

urlpatterns = router.urls

