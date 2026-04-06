from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'sender_name', 'subject', 'body',
                  'is_read', 'reply', 'replied_at', 'created_at']
        read_only_fields = ['sender', 'is_read', 'reply', 'replied_at', 'created_at']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
