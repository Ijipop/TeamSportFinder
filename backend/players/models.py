from django.db import models

from accounts.models import User

class PlayerProfile(models.Model):
# """Profil etendu pour les joueurs"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length =100)
    favorite_sport = models.CharField(max_length =50)
    level = models.CharField(max_length=20, choices=[
        ('beginner', 'Debutant'),
        ('intermediate', 'Intermediaire'),
        ('advanced', 'Avance')
    ])
    position = models.CharField(max_length =50, blank=True)

    class Meta:
        db_table = 'player_profiles'
        verbose_name = "player"
        verbose_name_plural = "players"

class OrganizerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)

    class Meta:
        db_table = 'organizer_profiles'
        verbose_name = "organizer"
        verbose_name_plural = "organizers"

    def __str__(self):
        return f"{self.user.full_name} - Organisateur"
