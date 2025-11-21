import uuid
from django.db import models

from tournaments.models import Team

class Match(models.Model):
# """Match entre deux equipes"""
    id = models.UUIDField(primary_key=True , default=uuid.uuid4)
    team_a = models.ForeignKey(Team , on_delete=models.CASCADE ,
    related_name='matches_as_team_a')
    team_b = models.ForeignKey(Team , on_delete=models.CASCADE ,
    related_name='matches_as_team_b')
    date = models.DateTimeField ()
    location = models.CharField(max_length =200)
    score_a = models.IntegerField(null=True , blank=True)
    score_b = models.IntegerField(null=True , blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matches '
