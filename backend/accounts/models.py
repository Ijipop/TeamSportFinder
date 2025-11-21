import uuid
from django.db import models

class User(models.Model):
    """
    Utilisateur synchronisé avec Clerk
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    clerk_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=[
        ('player', 'Joueur'),
        ('organisateur', 'Organisateur')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Propriétés pour compatibilité avec DRF et Django auth
    @property
    def is_authenticated(self):
        """
        Toujours True pour les utilisateurs créés depuis Clerk
        (ils sont authentifiés par définition)
        """
        return True
    
    @property
    def is_anonymous(self):
        """
        Toujours False pour les utilisateurs créés depuis Clerk
        """
        return False
    
    @property
    def is_active(self):
        """
        Toujours True pour les utilisateurs créés depuis Clerk
        """
        return True

    class Meta:
        db_table = 'users'