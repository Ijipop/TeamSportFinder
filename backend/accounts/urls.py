from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts import views

# Exemple : si tu as un UserViewSet
router = DefaultRouter()
# router.register(r'users', views.UserViewSet, basename='users')

urlpatterns = router.urls