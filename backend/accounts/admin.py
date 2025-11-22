from django.contrib import admin
from django.contrib.auth.models import Group, User as DjangoUser

from accounts.models import User

# Supprimer les modèles par défaut de l’admin
admin.site.unregister(Group)
admin.site.unregister(DjangoUser)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role')
    search_fields = ('email', 'full_name')
    list_filter = ('role',)
