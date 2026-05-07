from django.urls import path
from .views import MyChatView, AdminChatListView, AdminChatDetailView

urlpatterns = [
    path('',              AdminChatListView.as_view(),  name='chat-list'),
    path('my/',           MyChatView.as_view(),         name='chat-my'),
    path('<int:user_id>/', AdminChatDetailView.as_view(), name='chat-detail'),
]
