import uuid
from django.db import models

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
    player = models.ForeignKey(User , on_delete=models.CASCADE ,
<<<<<<< HEAD:backend/join_requests/models.py
    related_name='join_requests')
    team = models.ForeignKey(Team , on_delete=models.CASCADE ,
    related_name='join_requests')
=======
    related_name='requestes ')
    team = models.ForeignKey(Team , on_delete=models.CASCADE ,
    related_name='requestes ')
>>>>>>> bc2effd7347dcb193762e1758105f87f5b963fb1:backend/requestes/models.py
    status = models.CharField(max_length =20, choices=STATUS_CHOICES ,
    default='pending ')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
<<<<<<< HEAD:backend/join_requests/models.py
        db_table = 'join_requests '
        unique_together = ['player', 'team'] # Une seule demande par joueur/equipe
=======
        db_table = 'requestes '
        unique_together = ['player ', 'team'] # Une seule demande par joueur/equipe
>>>>>>> bc2effd7347dcb193762e1758105f87f5b963fb1:backend/requestes/models.py
