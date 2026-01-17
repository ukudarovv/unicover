from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentPageViewSet

router = DefaultRouter()
router.register(r'content-pages', ContentPageViewSet, basename='contentpage')

urlpatterns = [
    path('', include(router.urls)),
]
