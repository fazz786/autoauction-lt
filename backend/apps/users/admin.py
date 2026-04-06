from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'email', 'role', 'country', 'is_blocked', 'created_at']
    list_filter   = ['role', 'is_blocked']
    fieldsets     = UserAdmin.fieldsets + (
        ('AutoAuction', {'fields': ('role', 'phone', 'country', 'is_blocked')}),
    )
