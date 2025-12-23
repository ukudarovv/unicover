from django.urls import path
from .views import LessonViewSet

urlpatterns = [
    path('<int:pk>/complete/', LessonViewSet.as_view({'post': 'complete'}), name='lesson-complete'),
]

