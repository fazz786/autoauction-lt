"""
bids/views.py
Bids are auto-approved on placement and broadcast via WebSocket immediately.
Admin only selects the winner at the end of the auction.
"""
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Bid
from .serializers import BidSerializer, BidCreateSerializer


def _broadcast_bid(bid):
    auction = bid.auction
    auction.current_bid = bid.amount
    auction.save(update_fields=['current_bid'])
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'auction_{auction.id}',
            {
                'type':        'bid_update',
                'current_bid': float(bid.amount),
                'bid_count':   auction.bids.count(),
                'bidder':      bid.bidder.username,
            }
        )
    except Exception:
        pass


class BidListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/bids/?auction=<id>  — public: all bids for an auction
    POST /api/bids/               — authenticated user: place a bid (auto-approved)
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Bid.objects.select_related('bidder', 'auction').all()
        auction_id = self.request.query_params.get('auction')
        if auction_id:
            return qs.filter(auction_id=auction_id).order_by('-amount')
        if not self.request.user.is_authenticated:
            return qs.none()
        if self.request.user.is_admin:
            return qs
        return qs.filter(bidder=self.request.user)

    def get_serializer_class(self):
        return BidCreateSerializer if self.request.method == 'POST' else BidSerializer

    def perform_create(self, serializer):
        bid = serializer.save()
        _broadcast_bid(bid)


class BidDetailView(generics.RetrieveAPIView):
    queryset           = Bid.objects.select_related('bidder', 'auction').all()
    serializer_class   = BidSerializer
    permission_classes = [permissions.IsAuthenticated]


class PendingBidsView(generics.ListAPIView):
    """GET /api/bids/pending/ — kept for backwards compat, now returns all bids for admin"""
    serializer_class   = BidSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Bid.objects.select_related('bidder', 'auction__listing').order_by('-created_at')


class SetWinnerView(APIView):
    """POST /api/bids/<id>/winner/ — admin: mark this bid's bidder as auction winner"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            bid = Bid.objects.select_related('auction', 'bidder').get(pk=pk)
        except Bid.DoesNotExist:
            return Response({'detail': 'Bid not found.'}, status=404)

        auction = bid.auction
        auction.winner = bid.bidder
        auction.status = 'ended'
        auction.save(update_fields=['winner', 'status'])

        # Mark winning bid, clear others
        auction.bids.exclude(pk=bid.pk).update(status='rejected')
        bid.status      = 'approved'
        bid.reviewed_at = timezone.now()
        bid.reviewed_by = request.user
        bid.save()

        return Response({'detail': f'Winner set to @{bid.bidder.username}', 'auction_id': auction.id})
