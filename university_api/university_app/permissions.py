from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin_user(user):
    return user.is_superuser or hasattr(user, "administrator_profile")


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and is_admin_user(request.user)


class IsAuthenticatedReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
