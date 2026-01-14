from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectCategoryViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'categories', ProjectCategoryViewSet, basename='project-category')
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]

