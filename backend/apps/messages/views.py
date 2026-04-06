from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer


class MessageCreateView(generics.CreateAPIView):
    """POST /api/messages/ — authenticated user: send message to admin"""
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class MessageInboxView(generics.ListAPIView):
    """GET /api/messages/ — admin: view all received messages"""
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset           = Message.objects.select_related('sender').all()


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
