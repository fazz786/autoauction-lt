from django.urls import path
from .views import BidListCreateView, BidDetailView, PendingBidsView, BidReviewView

urlpatterns = [
    path('',                              BidListCreateView.as_view(), name='bid-list'),
    path('pending/',                      PendingBidsView.as_view(),   name='bid-pending'),
    path('<int:pk>/',                     BidDetailView.as_view(),     name='bid-detail'),
    path('<int:pk>/<str:action>/',        BidReviewView.as_view(),     name='bid-review'),
]
