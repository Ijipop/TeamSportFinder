from django.urls import path
from rest_framework.routers import DefaultRouter
from requestes.views import JoinRequestViewSet

router = DefaultRouter()
router.register(r'join-requests', JoinRequestViewSet, basename='join-requests')

urlpatterns = router.urls