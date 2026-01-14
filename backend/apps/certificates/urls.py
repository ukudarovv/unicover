from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificateViewSet, CertificateTemplateViewSet

router = DefaultRouter()
# Register templates first to avoid conflicts with the empty prefix
router.register(r'templates', CertificateTemplateViewSet, basename='certificate-template')
router.register(r'', CertificateViewSet, basename='certificate')

urlpatterns = [
    path('', include(router.urls)),
]

