"""
listings/models.py
Stores all vehicle listings created by the Admin.
Each listing can be linked to an Auction.
"""
from django.db import models
from apps.users.models import User


class Listing(models.Model):
    STATUS_CHOICES = [
        ('draft',    'Draft'),
        ('active',   'Active'),
        ('archived', 'Archived'),
    ]
    FUEL_CHOICES = [
        ('petrol', 'Petrol'), ('diesel', 'Diesel'),
        ('hybrid', 'Hybrid'), ('electric', 'Electric'),
    ]
    TRANSMISSION_CHOICES = [
        ('manual', 'Manual'), ('automatic', 'Automatic'), ('cvt', 'CVT'),
    ]
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'), ('good', 'Good'),
        ('fair', 'Fair'), ('poor', 'Poor'),
    ]
    CATEGORY_CHOICES = [
        ('sedan', 'Sedan'), ('suv', 'SUV'), ('hatchback', 'Hatchback'),
        ('coupe', 'Coupe'), ('wagon', 'Wagon'), ('truck', 'Truck'),
        ('motorcycle', 'Motorcycle'), ('other', 'Other'),
    ]

    # Core vehicle info
    make         = models.CharField(max_length=60)
    model        = models.CharField(max_length=60)
    year         = models.PositiveIntegerField()
    vin          = models.CharField(max_length=17, unique=True)
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='sedan')
    color        = models.CharField(max_length=40, blank=True)
    mileage_km   = models.PositiveIntegerField(default=0)
    fuel         = models.CharField(max_length=15, choices=FUEL_CHOICES,         default='petrol')
    transmission = models.CharField(max_length=15, choices=TRANSMISSION_CHOICES, default='manual')
    condition    = models.CharField(max_length=15, choices=CONDITION_CHOICES,    default='good')
    damage       = models.CharField(max_length=255, default='None')
    description  = models.TextField(blank=True)

    # Auction pricing
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)

    # Meta
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='listings')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'listings'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.year} {self.make} {self.model} (VIN: {self.vin})'


class ListingImage(models.Model):
    listing    = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='listings/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'listing_images'

    def __str__(self):
        return f'Image for {self.listing}'
