from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, BulkEmailViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')
router.register(r'bulk-email', BulkEmailViewSet, basename='bulk-email')

urlpatterns = [
    path('', include(router.urls)),
    path('mark_all_read/', NotificationViewSet.as_view({'post': 'mark_all_read'}), name='mark-all-read'),
]

