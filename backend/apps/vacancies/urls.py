from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VacancyViewSet, VacancyApplicationViewSet

# Separate router for applications to avoid conflicts - must be registered first
applications_router = DefaultRouter()
applications_router.register(r'', VacancyApplicationViewSet, basename='vacancy-application')

router = DefaultRouter()
router.register(r'', VacancyViewSet, basename='vacancy')

urlpatterns = [
    path('applications/', include(applications_router.urls)),
    path('', include(router.urls)),
]

