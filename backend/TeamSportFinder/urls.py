from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/players/', include('players.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('tournaments.urls')),   # pour tournois + équipes
    path('api/', include('requestes.urls')),      # pour demandes d’adhésion
    path("api/", include("api.urls")),

]