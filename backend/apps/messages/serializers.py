from rest_framework import serializers
from .models import Message, SellerInquiry


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


class SellerInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model  = SellerInquiry
        fields = ['id', 'name', 'email', 'phone', 'vehicle_info', 'message', 'is_read', 'created_at']
        read_only_fields = ['is_read', 'created_at']
