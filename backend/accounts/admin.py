from django.contrib import admin
from accounts.models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role')
    search_fields = ('email', 'full_name')
    list_filter = ('role',)