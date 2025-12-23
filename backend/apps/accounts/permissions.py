from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission for admin users only"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission for admin users or read-only"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission for object owner or admin"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return obj.user == request.user or obj.id == request.user.id

