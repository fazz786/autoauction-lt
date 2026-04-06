from django.urls import path
from .views import MessageCreateView, MessageInboxView, MessageReplyView

urlpatterns = [
    path('',                    MessageInboxView.as_view(),  name='message-inbox'),
    path('send/',               MessageCreateView.as_view(), name='message-send'),
    path('<int:pk>/reply/',     MessageReplyView.as_view(),  name='message-reply'),
]
