from django.urls import path
from .views import (
    MessageCreateView, MessageInboxView, MyMessagesView, MessageReplyView,
    SellerInquiryCreateView, SellerInquiryListView, SellerInquiryUnreadCountView,
)

urlpatterns = [
    path('',                        MessageInboxView.as_view(),            name='message-inbox'),
    path('send/',                   MessageCreateView.as_view(),           name='message-send'),
    path('my/',                     MyMessagesView.as_view(),              name='my-messages'),
    path('<int:pk>/reply/',         MessageReplyView.as_view(),            name='message-reply'),
    path('inquiry/',                SellerInquiryCreateView.as_view(),     name='seller-inquiry-create'),
    path('inquiries/',              SellerInquiryListView.as_view(),       name='seller-inquiry-list'),
    path('inquiries/unread/',       SellerInquiryUnreadCountView.as_view(),name='seller-inquiry-unread'),
]
