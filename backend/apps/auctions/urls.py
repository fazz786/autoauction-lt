from django.urls import path
from .views import AuctionListView, AuctionDetailView, AuctionStatusView

urlpatterns = [
    path('',                        AuctionListView.as_view(),   name='auction-list'),
    path('<int:pk>/',               AuctionDetailView.as_view(), name='auction-detail'),
    path('<int:pk>/status/',        AuctionStatusView.as_view(), name='auction-status'),
]
