from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Auction
from .serializers import AuctionSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin


class AuctionListView(generics.ListCreateAPIView):
    """
    GET  /api/auctions/   — public: list all auctions
    POST /api/auctions/   — admin: create auction for a listing
    Supports: ?status=live  ?status=upcoming  ?status=ended
    """
    serializer_class   = AuctionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Auction.objects.select_related('listing', 'winner').prefetch_related('listing__images')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AuctionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auctions/<id>/  — public: view auction details
    PUT    /api/auctions/<id>/  — admin: update auction
    DELETE /api/auctions/<id>/  — admin: cancel auction
    """
    queryset           = Auction.objects.select_related('listing', 'winner').prefetch_related('listing__images', 'bids')
    serializer_class   = AuctionSerializer
    permission_classes = [IsAdminOrReadOnly]


class AuctionStatusView(APIView):
    """POST /api/auctions/<id>/status/ — admin: change auction status"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            auction = Auction.objects.get(pk=pk)
        except Auction.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        new_status = request.data.get('status')
        valid = ['scheduled', 'live', 'ended', 'cancelled']
        if new_status not in valid:
            return Response({'detail': f'Status must be one of: {valid}'}, status=400)

        auction.status = new_status
        auction.save()
        return Response(AuctionSerializer(auction).data)
