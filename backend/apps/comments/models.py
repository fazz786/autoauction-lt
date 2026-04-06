"""
comments/models.py
Users can post comments on auction listings.
Admins can delete any comment.
"""
from django.db import models
from apps.users.models import User
from apps.auctions.models import Auction


class Comment(models.Model):
    auction    = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='comments')
    author     = models.ForeignKey(User,    on_delete=models.CASCADE, related_name='comments')
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author} on {self.auction}'


class CommentLike(models.Model):
    comment    = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user       = models.ForeignKey(User,    on_delete=models.CASCADE, related_name='liked_comments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comment_likes'
        unique_together = ['comment', 'user']  # one like per user per comment
