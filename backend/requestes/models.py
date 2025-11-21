import uuid
from django.db import models
from django.utils import timezone

from accounts.models import User
from tournaments.models import Team

class JoinRequest(models.Model):
# """Demande d'adhesion a une equipe"""
    STATUS_CHOICES = [
        ('pending ', 'En attente '),
        ('accepted ', 'Accepte '),
        ('rejected ', 'Refuse ')
    ]

    id = models.UUIDField(primary_key=True , default=uuid.uuid4)
    # player = models.ForeignKey(User , on_delete=models.CASCADE , related_name='requestes ')
    # team = models.ForeignKey(Team , on_delete=models.CASCADE , related_name='requestes ')
    # status = models.CharField(max_length =20, choices=STATUS_CHOICES , default='pending ')
    player = models.ForeignKey(User , on_delete=models.CASCADE , related_name='join_requests_as_player')
    team = models.ForeignKey(Team , on_delete=models.CASCADE , related_name='join_requests_as_team')
    status = models.CharField(max_length =20, choices=STATUS_CHOICES , default='pending')
    message = models.TextField(blank=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    models.DateTimeField(auto_now_add=True, default=timezone.now)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # db_table = 'join_requests'
        # unique_together = ['player', 'team'] # Une seule demande par joueur/equipe
        db_table = 'requestes'
        unique_together = ['player', 'team'] # Une seule demande par joueur/equipe