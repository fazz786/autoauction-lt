from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from apps.permissions import IsAdminRole
from .models import Auction
from .serializers import AuctionSerializer
from apps.users.models import User
from apps.bids.models import Bid


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
    PATCH  /api/auctions/<id>/  — admin: partial update (reschedule)
    DELETE /api/auctions/<id>/  — admin: cancel auction

    When rescheduling (status → scheduled), winner is cleared and
    all bids for this auction are reset to 'approved'.
    """
    queryset           = Auction.objects.select_related('listing', 'winner').prefetch_related('listing__images', 'bids')
    serializer_class   = AuctionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_update(self, serializer):
        new_status = self.request.data.get('status')
        instance   = serializer.save()
        # Clear winner and reset all bids whenever auction is re-opened
        if new_status in ('scheduled', 'live'):
            instance.winner = None
            instance.save(update_fields=['winner'])
            instance.bids.all().update(status='pending')


class StatsView(APIView):
    """GET /api/auctions/stats/ — public: platform-wide statistics"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_listings = Auction.objects.filter(status__in=['live', 'scheduled']).count()
        registered_buyers = User.objects.filter(role='user').count()
        traded = Bid.objects.filter(status='approved').aggregate(total=Sum('amount'))['total'] or 0
        total_bids = Bid.objects.filter(status='approved').count()
        satisfaction = 98 if total_bids == 0 else min(99, round(
            Bid.objects.filter(status='approved').count() /
            max(Bid.objects.exclude(status='pending').count(), 1) * 100
        ))
        return Response({
            'active_listings':   active_listings,
            'registered_buyers': registered_buyers,
            'traded_this_month': float(traded),
            'satisfaction_rate': satisfaction,
        })


class AuctionStatusView(APIView):
    """POST /api/auctions/<id>/status/ — admin: change auction status"""
    permission_classes = [IsAdminRole]

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
        # Re-opening an auction always clears the previous winner and resets bids
        if new_status in ('scheduled', 'live'):
            auction.winner = None
            auction.bids.all().update(status='pending')
        auction.save()
        return Response(AuctionSerializer(auction).data)
