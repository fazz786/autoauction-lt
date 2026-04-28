"""
auctions/models.py
An Auction links a Listing to a timed bidding session.
Admin creates and controls auctions.
"""
from django.db import models
from django.utils import timezone
from apps.listings.models import Listing
from apps.users.models import User


class Auction(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live',      'Live'),
        ('ended',     'Ended'),
        ('cancelled', 'Cancelled'),
    ]

    listing      = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name='auction')
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    start_time   = models.DateTimeField()
    end_time     = models.DateTimeField()
    current_bid  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    winner       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_auctions')
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_auctions')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auctions'
        ordering = ['end_time']

    def __str__(self):
        return f'Auction: {self.listing} [{self.status}]'

    @property
    def is_live(self):
        return self.status == 'live'

    @property
    def starting_bid(self):
        return self.listing.starting_bid

    def get_current_bid(self):
        """Returns the highest approved bid amount, or starting_bid if none."""
        top = self.bids.filter(status='approved').order_by('-amount').first()
        return top.amount if top else self.listing.starting_bid
