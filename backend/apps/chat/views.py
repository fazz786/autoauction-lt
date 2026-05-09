from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.permissions import IsAdminRole
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from apps.users.models import User


class MyChatView(APIView):
    """
    GET  /api/chat/my/  — user: fetch own conversation
    POST /api/chat/my/  — user: send a message to admin
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        msgs = ChatMessage.objects.filter(user=request.user).select_related('sender')
        msgs.filter(sender__role='admin', is_read=False).update(is_read=True)
        return Response(ChatMessageSerializer(msgs, many=True).data)

    def post(self, request):
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'detail': 'Message body required.'}, status=400)
        msg = ChatMessage.objects.create(user=request.user, sender=request.user, body=body)
        return Response(ChatMessageSerializer(msg).data, status=201)


class AdminChatListView(APIView):
    """GET /api/chat/ — admin: list all users who have active conversations"""
    permission_classes = [IsAdminRole]

    def get(self, request):
        user_ids = ChatMessage.objects.values_list('user', flat=True).distinct()
        users = User.objects.filter(id__in=user_ids)
        result = []
        for user in users:
            msgs = ChatMessage.objects.filter(user=user)
            unread = msgs.filter(sender__role='user', is_read=False).count()
            last   = msgs.last()
            result.append({
                'user_id':   user.id,
                'username':  user.username,
                'unread':    unread,
                'last_body': last.body if last else '',
                'last_at':   last.created_at.isoformat() if last else '',
            })
        result.sort(key=lambda x: x['last_at'], reverse=True)
        return Response(result)


class AdminChatDetailView(APIView):
    """
    GET  /api/chat/<user_id>/  — admin: fetch full conversation with a user
    POST /api/chat/<user_id>/  — admin: send a message to a user
    """
    permission_classes = [IsAdminRole]

    def get(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        msgs = ChatMessage.objects.filter(user=user).select_related('sender')
        msgs.filter(sender__role='user', is_read=False).update(is_read=True)
        return Response(ChatMessageSerializer(msgs, many=True).data)

    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'detail': 'Message body required.'}, status=400)
        msg = ChatMessage.objects.create(user=user, sender=request.user, body=body)
        return Response(ChatMessageSerializer(msg).data, status=201)
