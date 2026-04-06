"""
messages/models.py
Users can send messages to Admin through the platform.
Admin can view and reply from the dashboard.
"""
from django.db import models
from apps.users.models import User


class Message(models.Model):
    sender     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    subject    = models.CharField(max_length=200, blank=True)
    body       = models.TextField()
    is_read    = models.BooleanField(default=False)
    reply      = models.TextField(blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']

    def __str__(self):
        return f'Message from {self.sender}: {self.subject or self.body[:40]}'
