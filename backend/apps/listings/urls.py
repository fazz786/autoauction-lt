from django.urls import path
from .views import ListingListView, ListingDetailView, ListingImageUploadView, ListingImageDeleteView

urlpatterns = [
    path('',                                   ListingListView.as_view(),        name='listing-list'),
    path('<int:pk>/',                          ListingDetailView.as_view(),      name='listing-detail'),
    path('<int:pk>/images/',                   ListingImageUploadView.as_view(), name='listing-images'),
    path('<int:pk>/images/<int:image_pk>/',    ListingImageDeleteView.as_view(), name='listing-image-delete'),
]
