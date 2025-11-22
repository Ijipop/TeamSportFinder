# from django.contrib import admin
# from tournaments.models import Tournament, Team

# @admin.register(Tournament)
# class TournamentAdmin(admin.ModelAdmin):
#     list_display = ('name', 'sport', 'city', 'start_date', 'organizer', 'created_at')
#     search_fields = ('name', 'sport', 'city')
#     list_filter = ('sport', 'city', 'start_date')

# @admin.register(Team)
# class TeamAdmin(admin.ModelAdmin):
#     list_display = ('name', 'tournament', 'max_capacity', 'current_capacity', 'is_full', 'created_at')
#     search_fields = ('name', 'tournament__name')
#     list_filter = ('tournament', 'max_capacity')

from django.contrib import admin
from requestes.models import JoinRequest
from .models import Tournament, Team

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['name', 'sport', 'city', 'organizer', 'start_date', 'team_count']
    list_filter = ['sport', 'city', 'start_date']
    search_fields = ['name', 'organizer__full_name']

    def team_count(self, obj):
        return obj.teams.count()
    team_count.short_description = "Nombre d'équipes"


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'tournament', 'current_capacity', 'max_capacity', 'is_full_display']
    list_filter = ['tournament__sport']
    filter_horizontal = ['members']

    def is_full_display(self, obj):
        return 'Oui' if obj.is_full else 'Non'
    is_full_display.short_description = "Équipe pleine"


# ⚠️ On désenregistre d'abord JoinRequest pour éviter AlreadyRegistered
try:
    admin.site.unregister(JoinRequest)
except admin.sites.NotRegistered:
    pass  # si jamais il n'était pas encore enregistré

@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    list_display = ['player', 'team', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['player__full_name', 'team__name']
    actions = ['accept_requests', 'reject_requests']

    def accept_requests(self, request, queryset):
        for req in queryset:
            if not req.team.is_full:
                req.status = 'accepted'
                req.team.members.add(req.player)
                req.team.current_capacity += 1
                req.team.save()
                req.save()
    accept_requests.short_description = "Accepter les demandes sélectionnées"

    def reject_requests(self, request, queryset):
        queryset.update(status='rejected')
    reject_requests.short_description = "Rejeter les demandes sélectionnées"