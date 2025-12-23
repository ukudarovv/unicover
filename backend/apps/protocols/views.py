from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse
from django.utils import timezone

from .models import Protocol, ProtocolSignature
from .serializers import (
    ProtocolSerializer,
    ProtocolCreateSerializer,
    ProtocolSignatureSerializer,
    OTPRequestSerializer,
    OTPSignSerializer,
)
from .utils import generate_protocol_pdf
from apps.accounts.permissions import IsAdmin, IsAdminOrReadOnly
from apps.accounts.models import User


class ProtocolViewSet(viewsets.ModelViewSet):
    """Protocol ViewSet"""
    queryset = Protocol.objects.select_related('student', 'course', 'attempt').prefetch_related('signatures__signer').all()
    serializer_class = ProtocolSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'result']
    search_fields = ['number', 'student__full_name', 'student__phone', 'course__title']
    ordering_fields = ['created_at', 'exam_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProtocolCreateSerializer
        return ProtocolSerializer
    
    def create(self, request, *args, **kwargs):
        """Create protocol from test attempt"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        attempt_id = serializer.validated_data.get('attempt')
        if attempt_id:
            from apps.exams.models import TestAttempt
            try:
                attempt = TestAttempt.objects.get(id=attempt_id.id if hasattr(attempt_id, 'id') else attempt_id)
                protocol = Protocol.objects.create(
                    student=serializer.validated_data['student'],
                    course=serializer.validated_data['course'],
                    attempt=attempt,
                    exam_date=serializer.validated_data['exam_date'],
                    score=serializer.validated_data['score'],
                    passing_score=serializer.validated_data['passing_score'],
                    result=serializer.validated_data['result'],
                )
                
                # Create signatures for PDEK members
                pdek_members = User.objects.filter(role__in=['pdek_member', 'pdek_chairman'])
                for member in pdek_members:
                    ProtocolSignature.objects.create(
                        protocol=protocol,
                        signer=member,
                        role='chairman' if member.role == 'pdek_chairman' else 'member'
                    )
                
                return Response(ProtocolSerializer(protocol).data, status=status.HTTP_201_CREATED)
            except TestAttempt.DoesNotExist:
                pass
        
        protocol = serializer.save()
        return Response(ProtocolSerializer(protocol).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def request_signature(self, request, pk=None):
        """Request OTP for signature"""
        protocol = self.get_object()
        
        # Check if user is PDEK member
        if not request.user.is_pdek_member:
            return Response(
                {'error': 'Only PDEK members can sign protocols'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create signature
        signature, created = ProtocolSignature.objects.get_or_create(
            protocol=protocol,
            signer=request.user
        )
        
        # Generate OTP
        otp_code = signature.generate_otp()
        
        # Send SMS (if Twilio configured)
        try:
            from django.conf import settings
            if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.messages.create(
                    body=f'Ваш код для подписания протокола {protocol.number}: {otp_code}',
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=request.user.phone
                )
        except Exception as e:
            # Log error but don't fail
            print(f"Failed to send SMS: {e}")
        
        return Response({
            'message': 'OTP code sent to your phone',
            'otp_expires_at': signature.otp_expires_at
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Sign protocol with OTP"""
        protocol = self.get_object()
        serializer = OTPSignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        otp_code = serializer.validated_data['otp']
        
        # Get signature
        try:
            signature = ProtocolSignature.objects.get(
                protocol=protocol,
                signer=request.user
            )
        except ProtocolSignature.DoesNotExist:
            return Response(
                {'error': 'Signature not found. Please request OTP first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify OTP
        if not signature.verify_otp(otp_code):
            return Response(
                {'error': 'Invalid or expired OTP code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update protocol status
        all_signed = protocol.signatures.filter(otp_verified=True).count()
        total_signatures = protocol.signatures.count()
        
        if all_signed == total_signatures:
            if signature.role == 'chairman':
                protocol.status = 'signed_chairman'
            else:
                protocol.status = 'signed_members'
            protocol.save()
        
        return Response(
            ProtocolSerializer(protocol).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Download protocol PDF"""
        protocol = self.get_object()
        
        # Generate PDF
        buffer = generate_protocol_pdf(protocol)
        
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="protocol_{protocol.number}.pdf"'
        return response

