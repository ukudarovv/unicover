from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestAttemptViewSet, ExtraAttemptRequestViewSet

router = DefaultRouter()
router.register(r'', TestAttemptViewSet, basename='exam')

# Регистрируем extra-attempts отдельно, чтобы избежать конфликтов с роутером
extra_attempts_router = DefaultRouter()
extra_attempts_router.register(r'', ExtraAttemptRequestViewSet, basename='extra-attempt-request')

urlpatterns = [
    path('extra-attempts/', include(extra_attempts_router.urls)),
    path('', include(router.urls)),
]

