"""
bids/views.py
Handles bid submission by users and approval/rejection by admin.
On approval, broadcasts updated bid info to all WebSocket clients
watching that auction via Django Channels channel layer.
"""
import json
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Bid
from .serializers import BidSerializer, BidCreateSerializer


class BidListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/bids/?auction=<id>   — list bids for an auction
    POST /api/bids/                — authenticated user: submit a bid
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Bid.objects.select_related('bidder', 'auction').all()
        auction_id = self.request.query_params.get('auction')
        if auction_id:
            qs = qs.filter(auction_id=auction_id)
        # Regular users only see their own bids
        if not self.request.user.is_admin:
            qs = qs.filter(bidder=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BidCreateSerializer
        return BidSerializer


class BidDetailView(generics.RetrieveAPIView):
    """GET /api/bids/<id>/ — view a single bid"""
    queryset           = Bid.objects.select_related('bidder', 'auction').all()
    serializer_class   = BidSerializer
    permission_classes = [permissions.IsAuthenticated]


class PendingBidsView(generics.ListAPIView):
    """GET /api/bids/pending/ — admin: list all pending bids"""
    serializer_class   = BidSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Bid.objects.filter(status='pending').select_related('bidder', 'auction__listing').order_by('created_at')


class BidReviewView(APIView):
    """
    POST /api/bids/<id>/approve/  — admin: approve bid
    POST /api/bids/<id>/reject/   — admin: reject bid

    On approval:
      1. Marks bid as approved
      2. Updates auction.current_bid
      3. Broadcasts via WebSocket to all watching clients
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, action):
        try:
            bid = Bid.objects.select_related('auction', 'bidder').get(pk=pk)
        except Bid.DoesNotExist:
            return Response({'detail': 'Bid not found.'}, status=404)

        if bid.status != 'pending':
            return Response({'detail': f'Bid is already {bid.status}.'}, status=400)

        if action not in ('approve', 'reject'):
            return Response({'detail': 'Action must be approve or reject.'}, status=400)

        # Update bid status
        bid.status      = 'approved' if action == 'approve' else 'rejected'
        bid.reviewed_at = timezone.now()
        bid.reviewed_by = request.user
        bid.save()

        if action == 'approve':
            # Update auction's cached current bid
            auction = bid.auction
            auction.current_bid = bid.amount
            auction.save(update_fields=['current_bid'])

            # ── WebSocket broadcast ───────────────────────────────────────
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'auction_{auction.id}',
                {
                    'type':        'bid_update',
                    'current_bid': float(bid.amount),
                    'bid_count':   auction.bids.filter(status='approved').count(),
                    'bidder':      bid.bidder.username,
                }
            )

        return Response(BidSerializer(bid).data)
