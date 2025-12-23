from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse

from .models import Certificate
from .serializers import CertificateSerializer, CertificateCreateSerializer
from .utils import generate_certificate_pdf
from apps.accounts.permissions import IsAdminOrReadOnly


class CertificateViewSet(viewsets.ModelViewSet):
    """Certificate ViewSet"""
    queryset = Certificate.objects.select_related('student', 'course', 'protocol').all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'course']
    search_fields = ['number', 'student__full_name', 'student__phone', 'course__title']
    ordering_fields = ['issued_at']
    ordering = ['-issued_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CertificateCreateSerializer
        return CertificateSerializer
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Download certificate PDF"""
        certificate = self.get_object()
        
        # Generate PDF
        buffer = generate_certificate_pdf(certificate)
        
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{certificate.number}.pdf"'
        return response
    
    @action(detail=False, methods=['get'], url_path='verify/(?P<qr_code>[^/.]+)')
    def verify(self, request, qr_code=None):
        """Verify certificate by QR code"""
        try:
            # Extract number from QR code URL if it's a full URL
            if '/' in qr_code:
                qr_code = qr_code.split('/')[-1]
            
            certificate = Certificate.objects.get(number=qr_code)
            return Response({
                'valid': True,
                'certificate': CertificateSerializer(certificate).data
            }, status=status.HTTP_200_OK)
        except Certificate.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Certificate not found'
            }, status=status.HTTP_404_NOT_FOUND)

