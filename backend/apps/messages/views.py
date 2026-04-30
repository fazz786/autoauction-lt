from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message, SellerInquiry
from .serializers import MessageSerializer, SellerInquirySerializer


class MessageCreateView(generics.CreateAPIView):
    """POST /api/messages/send/ — authenticated user: send message to admin"""
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class MessageInboxView(generics.ListAPIView):
    """GET /api/messages/ — admin: view all received messages, mark as read"""
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Message.objects.select_related('sender').all()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        Message.objects.filter(is_read=False).update(is_read=True)
        return response


class MyMessagesView(generics.ListAPIView):
    """GET /api/messages/my/ — user: fetch own message history with admin replies"""
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user).order_by('created_at')


class MessageReplyView(APIView):
    """POST /api/messages/<id>/reply/ — admin: reply to a message"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            message = Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found.'}, status=404)

        reply_text = request.data.get('reply', '').strip()
        if not reply_text:
            return Response({'detail': 'Reply text is required.'}, status=400)

        message.reply      = reply_text
        message.is_read    = True
        message.replied_at = timezone.now()
        message.save()
        return Response(MessageSerializer(message).data)


class SellerInquiryCreateView(generics.CreateAPIView):
    """POST /api/messages/inquiry/ — public (no auth): seller contact form"""
    serializer_class   = SellerInquirySerializer
    permission_classes = [permissions.AllowAny]


class SellerInquiryListView(generics.ListAPIView):
    """GET /api/messages/inquiries/ — admin: view all seller inquiries"""
    serializer_class   = SellerInquirySerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = SellerInquiry.objects.all()
        # Mark all unread as read when admin fetches them
        qs.filter(is_read=False).update(is_read=True)
        return qs


class SellerInquiryUnreadCountView(APIView):
    """GET /api/messages/inquiries/unread/ — admin: unread count badge"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({'count': SellerInquiry.objects.filter(is_read=False).count()})
