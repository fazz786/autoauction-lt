from rest_framework import serializers
from .models import Bid


class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)

    class Meta:
        model  = Bid
        fields = [
            'id', 'auction', 'bidder', 'bidder_name',
            'amount', 'status', 'created_at', 'reviewed_at',
        ]
        read_only_fields = ['bidder', 'status', 'created_at', 'reviewed_at', 'reviewed_by']


class BidCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Bid
        fields = ['auction', 'amount']

    def validate(self, data):
        auction = data['auction']
        amount  = data['amount']

        if not auction.is_live:
            raise serializers.ValidationError('This auction is not currently live.')

        min_bid = auction.get_current_bid() + 1
        if amount < min_bid:
            raise serializers.ValidationError(
                f'Bid must be at least €{min_bid:,.2f} (current bid + €1 minimum increment).'
            )
        return data

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
        return super().create(validated_data)
