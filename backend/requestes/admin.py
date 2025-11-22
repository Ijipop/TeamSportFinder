from django.contrib import admin
from requestes.models import JoinRequest

@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    list_display = ('player', 'team', 'status', 'message', 'created_at', 'updated_at')
    search_fields = ('player__username', 'team__name')
    list_filter = ('status', 'created_at')