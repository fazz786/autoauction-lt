from rest_framework import serializers
from .models import Listing, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ListingImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']


class ListingSerializer(serializers.ModelSerializer):
    images       = ListingImageSerializer(many=True, read_only=True)
    created_by   = serializers.StringRelatedField(read_only=True)
    mileage_display = serializers.SerializerMethodField()

    class Meta:
        model  = Listing
        fields = [
            'id', 'make', 'model', 'year', 'vin', 'category', 'color',
            'mileage_km', 'mileage_display', 'fuel', 'transmission',
            'condition', 'damage', 'description', 'starting_bid',
            'status', 'created_by', 'images', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_mileage_display(self, obj):
        return f'{obj.mileage_km:,} km'


class ListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Listing
        fields = [
            'make', 'model', 'year', 'vin', 'category', 'color',
            'mileage_km', 'fuel', 'transmission', 'condition',
            'damage', 'description', 'starting_bid', 'status',
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
