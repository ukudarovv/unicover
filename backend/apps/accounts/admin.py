from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'full_name', 'email', 'role', 'verified', 'is_active', 'created_at')
    list_filter = ('role', 'verified', 'is_active', 'is_staff', 'created_at')
    search_fields = ('phone', 'email', 'full_name', 'iin')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'iin', 'city', 'organization')}),
        ('Permissions', {'fields': ('role', 'verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Settings', {'fields': ('language',)}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'password1', 'password2', 'role', 'full_name', 'email'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')

