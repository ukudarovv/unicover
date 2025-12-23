from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('export/', UserViewSet.as_view({'get': 'export'}), name='user-export'),
    path('import_users/', UserViewSet.as_view({'post': 'import_users'}), name='user-import'),
]

