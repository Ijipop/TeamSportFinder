from django.contrib import admin
from matches.models import Match

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('team_a', 'team_b', 'date', 'location', 'score_a', 'score_b')
    search_fields = ('team_a__name', 'team_b__name', 'location')
    list_filter = ('date', 'location')