from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Max

from .models import Test, Question
from .serializers import (
    TestSerializer,
    QuestionSerializer,
    QuestionCreateSerializer,
)
from apps.accounts.permissions import IsAdminOrReadOnly
from apps.core.utils import get_request_language


class TestViewSet(viewsets.ModelViewSet):
    """Test ViewSet"""
    queryset = Test.objects.prefetch_related('questions').all()
    serializer_class = TestSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'language']
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter tests by language"""
        queryset = super().get_queryset()
        # Фильтрация по языку (если не указан явно в параметрах запроса)
        if 'language' not in self.request.query_params:
            lang = get_request_language(self.request)
            queryset = queryset.filter(language=lang)
        return queryset
    
    @action(detail=True, methods=['get', 'post'])
    def questions(self, request, pk=None):
        """Get or add questions to test"""
        test = self.get_object()
        
        if request.method == 'GET':
            questions = test.questions.all()
            serializer = QuestionSerializer(questions, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = QuestionCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Set order if not provided
            if 'order' not in serializer.validated_data:
                max_order = test.questions.aggregate(max_order=Max('order'))['max_order'] or 0
                serializer.validated_data['order'] = max_order + 1
            
            question = serializer.save(test=test)
            return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    """Question ViewSet for managing questions"""
    queryset = Question.objects.all()
    serializer_class = QuestionCreateSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        """Filter questions by test"""
        queryset = super().get_queryset()
        test_id = self.kwargs.get('test_pk')
        if test_id:
            queryset = queryset.filter(test_id=test_id)
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action in ['list', 'retrieve']:
            return QuestionSerializer
        return QuestionCreateSerializer
    
    def perform_create(self, serializer):
        """Set test when creating question"""
        test_id = self.kwargs.get('test_pk')
        if test_id:
            try:
                test = Test.objects.get(id=test_id)
                # Set order if not provided
                if 'order' not in serializer.validated_data:
                    max_order = test.questions.aggregate(max_order=Max('order'))['max_order'] or 0
                    serializer.validated_data['order'] = max_order + 1
                serializer.save(test=test)
            except Test.DoesNotExist:
                from rest_framework.exceptions import NotFound
                raise NotFound('Test not found')
        else:
            serializer.save()

