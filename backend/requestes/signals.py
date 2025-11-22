from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import JoinRequest

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
    
@receiver(post_delete, sender=JoinRequest)
def cleanup_join_request(sender, instance, **kwargs):
    """
    Suppression en cascade : si une JoinRequest acceptée est supprimée,
    on retire le joueur de l’équipe et on recalcule la capacité.
    """
    if instance.status == "accepted":
        team = instance.team
        team.members.remove(instance.player)
        team.current_capacity = team.members.count()
        team.save()
