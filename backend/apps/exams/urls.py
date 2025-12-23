from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestAttemptViewSet

router = DefaultRouter()
router.register(r'', TestAttemptViewSet, basename='exam')

urlpatterns = [
    path('', include(router.urls)),
]

