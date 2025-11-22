from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts import views

router = DefaultRouter()
# router.register(r'users', views.UserViewSet, basename='users')

urlpatterns = [
    path('me/', views.get_current_user, name='current-user'),
    path('create/', views.create_user_from_clerk, name='create-user'),
] + router.urls