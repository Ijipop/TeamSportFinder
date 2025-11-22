from django.contrib import admin, messages
from requestes.models import JoinRequest

@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    list_display = ('player', 'team', 'status', 'message', 'created_at', 'updated_at')
    search_fields = ('player__username', 'team__name')
    list_filter = ('status', 'created_at')

    def save_model(self, request, obj, form, change):
        """
        Surcharge pour donner un feedback visuel dans l’admin
        """
        super().save_model(request, obj, form, change)

        if obj.status == "accepted":
            team = obj.team
            if team.current_capacity >= team.max_capacity:
                messages.error(request, f"L'équipe {team.name} est déjà pleine. Demande rejetée.")
            else:
                messages.success(request, f"{obj.player} a bien rejoint {team.name}.")
        elif obj.status == "rejected":
            messages.warning(request, f"La demande de {obj.player} pour {obj.team} a été rejetée.")
