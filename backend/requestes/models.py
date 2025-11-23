import uuid
from django.db import models
from accounts.models import User
from tournaments.models import Team

class JoinRequest(models.Model):
# """Demande d'adhésion à une équipe"""

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='join_requests_as_player')    # join_requests or 'requestes'?
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='join_requests_as_team')      # autre nom pour eviter memes noms
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # message = models.TextField(blank=True, null=True) # alt?
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['player', 'team'] # Une seule demande par joueur/equipe
        verbose_name = "requeste"
        verbose_name_plural = "requestes"
    
    def __str__(self):
        return f"{self.player.full_name} → {self.team.name} ({self.status})"

