import uuid
from django.db import models

from backend.accounts.models import User
from backend.tournaments.models import Team

class JoinRequest(models.Model):
# """Demande d'adhesion a une equipe"""
    STATUS_CHOICES = [
    ('pending ', 'En attente '),
    ('accepted ', 'Accepte '),
    ('rejected ', 'Refuse ')
    ]

    id = models.UUIDField(primary_key=True , default=uuid.uuid4)
    player = models.ForeignKey(User , on_delete=models.CASCADE ,
    related_name='requestes ')
    team = models.ForeignKey(Team , on_delete=models.CASCADE ,
    related_name='requestes ')
    status = models.CharField(max_length =20, choices=STATUS_CHOICES ,
    default='pending ')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'requestes '
        unique_together = ['player ', 'team'] # Une seule demande par joueur/equipe