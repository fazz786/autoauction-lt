from django.urls import path
from .views import AuctionListView, AuctionDetailView, AuctionStatusView, StatsView

urlpatterns = [
    path('',                        AuctionListView.as_view(),   name='auction-list'),
    path('stats/',                  StatsView.as_view(),         name='auction-stats'),
    path('<int:pk>/',               AuctionDetailView.as_view(), name='auction-detail'),
    path('<int:pk>/status/',        AuctionStatusView.as_view(), name='auction-status'),
]
