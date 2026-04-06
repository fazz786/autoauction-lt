from rest_framework import serializers
from django.utils import timezone
from .models import Auction
from apps.listings.serializers import ListingSerializer


class AuctionSerializer(serializers.ModelSerializer):
    listing      = ListingSerializer(read_only=True)
    listing_id   = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.listings.models', fromlist=['Listing']).Listing.objects.all(),
        source='listing', write_only=True
    )
    current_bid  = serializers.SerializerMethodField()
    time_left_seconds = serializers.SerializerMethodField()
    bid_count    = serializers.SerializerMethodField()

    class Meta:
        model  = Auction
        fields = [
            'id', 'listing', 'listing_id', 'status',
            'start_time', 'end_time',
            'current_bid', 'time_left_seconds', 'bid_count',
            'winner', 'created_at',
        ]
        read_only_fields = ['winner', 'created_at']

    def get_current_bid(self, obj):
        return float(obj.get_current_bid())

    def get_time_left_seconds(self, obj):
        if obj.status != 'live':
            return 0
        delta = obj.end_time - timezone.now()
        return max(0, int(delta.total_seconds()))

    def get_bid_count(self, obj):
        return obj.bids.filter(status='approved').count()
