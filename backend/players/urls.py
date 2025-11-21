from django.urls import path
from players.views import PlayerProfileViewSet

# Routes personnalisées pour le profil joueur (sans ID dans l'URL)
# Le router DRF génère des routes avec ID, donc on crée les routes manuellement
urlpatterns = [
    path('profile/', PlayerProfileViewSet.as_view({
        'get': 'list',      # GET /api/players/profile/
        'post': 'create',   # POST /api/players/profile/
        'put': 'update',    # PUT /api/players/profile/
        'patch': 'partial_update',  # PATCH /api/players/profile/
        'delete': 'destroy',  # DELETE /api/players/profile/
    }), name='player-profile'),
]

