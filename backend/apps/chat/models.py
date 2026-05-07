from django.db import models
from apps.users.models import User


class ChatMessage(models.Model):
    # 'user' is always the regular user side of the conversation (never admin)
    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_chat_messages')
    body   = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f'[{self.user}] {self.sender}: {self.body[:40]}'
