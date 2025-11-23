from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import JoinRequest
from accounts.models import User

# --- Règle 1 : Capacité max et ajout automatique ---
@receiver(post_save, sender=JoinRequest)
def handle_join_request(sender, instance, created, **kwargs):
    """
    Quand une JoinRequest est sauvegardée :
    - Si status == "accepted", ajoute le joueur dans l'équipe
    - Vérifie la capacité max avant d'ajouter
    """
    if instance.status == "accepted":
        team = instance.team

        # Vérifie si l'équipe est déjà pleine
        if team.current_capacity >= team.max_capacity:
            # Annule l'acceptation si l'équipe est pleine
            instance.status = "rejected"
            instance.save(update_fields=["status"])
            return

        # Sinon, ajoute le joueur
        team.members.add(instance.player)
        team.current_capacity = team.members.count()
        team.save()

    elif instance.status == "rejected":
        # Log simple
        print(f"{instance.player} a été refusé pour {instance.team}")


# --- Règle 2 : Suppression en cascade ---
@receiver(post_delete, sender=JoinRequest)
def cleanup_join_request(sender, instance, **kwargs):
    """
    Si une JoinRequest acceptée est supprimée :
    - Retire le joueur de l'équipe
    - Recalcule la capacité
    """
    if instance.status == "accepted":
        team = instance.team
        team.members.remove(instance.player)
        team.current_capacity = team.members.count()
        team.save()


# --- Règle 3 : Cohérence des rôles ---
@receiver(pre_save, sender=User)
def enforce_role_consistency(sender, instance, **kwargs):
    """
    Garantit la cohérence des rôles :
    - Un organizer est toujours staff
    - Un player n'est jamais staff
    """
    if instance.role == "organizer":
        instance.is_staff = True
    elif instance.role == "player":
        instance.is_staff = False