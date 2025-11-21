from django.db import models

from backend.accounts.models import User

class PlayerProfile(models.Model):
# """Profil etendu pour les joueurs"""
    user = models.OneToOneField(User , on_delete=models.CASCADE)
    city = models.CharField(max_length =100)
    favorite_sport = models.CharField(max_length =50)
    level = models.CharField(max_length =20, choices =[
        ('beginner ', 'Debutant '),
        ('intermediate ', 'Intermediaire '),
        ('advanced ', 'Avance ')
    ])
    position = models.CharField(max_length =50, blank=True)

    class Meta:
        db_table = 'player_profiles '