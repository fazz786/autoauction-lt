from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    is_admin    = serializers.SerializerMethodField()

    class Meta:
        model  = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'is_admin', 'body', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'is_admin', 'is_read', 'created_at']

    def get_is_admin(self, obj):
        return obj.sender.role == 'admin'
