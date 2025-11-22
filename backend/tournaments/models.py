import uuid
from django.db import models

from accounts.models import User

class Tournament(models.Model):
# """Tournoi/Ligue cree par un organisateur"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    sport = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    start_date = models.DateField()
    # organizer = models.ForeignKey(User , on_delete=models.CASCADE , related_name='tournaments ')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tournaments'
        verbose_name = "tournament"
        verbose_name_plural = "tournaments"
    
    def __str__(self):
        return f"{self.name} ({self.sport})"


class Team(models.Model):
# """Equipe dans un tournoi"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length = 200)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='teams')
    max_capacity = models.IntegerField(default = 15)
    current_capacity = models.IntegerField(default = 0)
    members = models.ManyToManyField(User, related_name='teams',blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def available_spots(self):
        return self.max_capacity - self.current_capacity

    @property
    def is_full(self):
        return self.current_capacity >= self.max_capacity

    class Meta:
        db_table = 'teams'
        verbose_name = "team"
        verbose_name_plural = "teams"
    
    def __str__(self):
        return f"{self.name} ({self.tournament.name})"