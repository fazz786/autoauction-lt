from django.urls import path
from .views import ListingListView, ListingDetailView, ListingImageUploadView

urlpatterns = [
    path('',                      ListingListView.as_view(),        name='listing-list'),
    path('<int:pk>/',             ListingDetailView.as_view(),      name='listing-detail'),
    path('<int:pk>/images/',      ListingImageUploadView.as_view(), name='listing-images'),
]
