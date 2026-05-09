from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.permissions import IsAdminRole
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingCreateSerializer, ListingImageSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin


class ListingListView(generics.ListCreateAPIView):
    """
    GET  /api/listings/        — public: list all active listings
    POST /api/listings/        — admin only: create new listing
    Supports: ?search=BMW  ?category=suv  ?status=active  ?ordering=starting_bid
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['make', 'model', 'year', 'vin', 'category']
    ordering_fields    = ['starting_bid', 'year', 'mileage_km', 'created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = Listing.objects.prefetch_related('images').all()
        # Filter by status (default: only active for public)
        status = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        if status:
            qs = qs.filter(status=status)
        elif not (self.request.user.is_authenticated and self.request.user.is_admin):
            qs = qs.filter(status='active')
        if category:
            qs = qs.filter(category__iexact=category)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ListingCreateSerializer
        return ListingSerializer


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/listings/<id>/  — public: view single listing
    PUT    /api/listings/<id>/  — admin: update
    DELETE /api/listings/<id>/  — admin: delete
    """
    queryset           = Listing.objects.prefetch_related('images').all()
    serializer_class   = ListingSerializer
    permission_classes = [IsAdminOrReadOnly]


class ListingImageUploadView(generics.CreateAPIView):
    """POST /api/listings/<id>/images/ — admin: upload one image for a listing (multipart)"""
    permission_classes  = [IsAdminRole]
    serializer_class    = ListingImageSerializer
    parser_classes      = [__import__('rest_framework.parsers', fromlist=['MultiPartParser']).MultiPartParser]

    def perform_create(self, serializer):
        listing = Listing.objects.get(pk=self.kwargs['pk'])
        # First image uploaded becomes primary
        is_primary = not listing.images.exists()
        serializer.save(listing=listing, is_primary=is_primary)


class ListingImageDeleteView(generics.DestroyAPIView):
    """DELETE /api/listings/<pk>/images/<image_pk>/ — admin: delete a single image"""
    permission_classes = [IsAdminRole]

    def get_object(self):
        return ListingImage.objects.get(pk=self.kwargs['image_pk'], listing_id=self.kwargs['pk'])

    def perform_destroy(self, instance):
        was_primary = instance.is_primary
        instance.image.delete(save=False)   # remove file from disk
        instance.delete()
        if was_primary:
            # promote next image to primary
            nxt = ListingImage.objects.filter(listing_id=self.kwargs['pk']).first()
            if nxt:
                nxt.is_primary = True
                nxt.save()
