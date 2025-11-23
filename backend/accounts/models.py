# accounts/models.py

import uuid
from django.db import models
from django.core.exceptions import ValidationError
class User(models.Model):
    # Utilisateur synchronisé avec Clerk
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    clerk_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    
    role = models.CharField(max_length=20, choices=[
        ('player', 'Joueur'),
        ('organizer', 'Organisateur')
    ],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Propriétés pour compatibilité avec DRF et Django auth
    @property
    def is_authenticated(self):
        # Toujours True pour les utilisateurs créés depuis Clerk (ils sont authentifiés par définition)
        return True
    
    @property
    def is_anonymous(self):
        # Toujours False pour les utilisateurs créés depuis Clerk
        return False
    
    @property
    def is_active(self):
        # Toujours True pour les utilisateurs créés depuis Clerk
        return True
    
    def clean(self):
        # Validators pour cohérence des rôles.
        # Exemple : un joueur ne peut pas avoir un clerk_id vide
        if self.role == "player" and not self.clerk_id:
            raise ValidationError("Un joueur doit avoir un clerk_id valide.")

    class Meta:
        db_table = 'users'
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.full_name or self.email

class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    city = models.CharField(max_length=100)
    main_sport = models.CharField(max_length=100)
    level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Débutant'),
            ('intermediate', 'Intermédiaire'),
            ('advanced', 'Avancé'),
        ]
    )
    preferred_position = models.CharField(max_length=100, blank=True, null=True)

    # class Meta:
    #     db_table = "player_profiles"
    #     verbose_name = "Player Profile"
    #     verbose_name_plural = "Player Profiles"

    def __str__(self):
        return f"{self.user.full_name} - {self.main_sport}"