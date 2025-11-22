from django.contrib import admin
from tournaments.models import Tournament, Team

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'sport', 'city', 'start_date', 'organizer', 'created_at')
    search_fields = ('name', 'sport', 'city')
    list_filter = ('sport', 'city', 'start_date')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'tournament', 'max_capacity', 'current_capacity', 'is_full', 'created_at')
    search_fields = ('name', 'tournament__name')
    list_filter = ('tournament', 'max_capacity')