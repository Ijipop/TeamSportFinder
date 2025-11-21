import uuid
from django.db import models

class User(models.Model):
# """Utilisateur synchronise avec Clerk"""
    id = models.UUIDField(primary_key=True , default=uuid.uuid4)
    clerk_id = models.CharField(max_length =255, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length =255)
    role = models.CharField(max_length =20, choices =[
    ('player ', 'Joueur '),
    ('organizer ', 'Organisateur ')
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users '