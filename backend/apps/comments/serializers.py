from rest_framework import serializers
from .models import Comment, CommentLike


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    like_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Comment
        fields = ['id', 'auction', 'author', 'author_name', 'text', 'like_count', 'created_at']
        read_only_fields = ['author', 'created_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
