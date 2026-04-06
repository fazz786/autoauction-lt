"""
bids/models.py
A Bid is placed by a User on an Auction.
All bids start as 'pending' and must be approved or rejected by Admin.
On approval, a WebSocket broadcast is triggered to update all live clients.
"""
from django.db import models
from apps.users.models import User
from apps.auctions.models import Auction


class Bid(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    auction    = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    bidder     = models.ForeignKey(User,    on_delete=models.CASCADE, related_name='bids')
    amount     = models.DecimalField(max_digits=10, decimal_places=2)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_bids'
    )

    class Meta:
        db_table = 'bids'
        ordering = ['-created_at']

    def __str__(self):
        return f'Bid €{self.amount} by {self.bidder} on {self.auction} [{self.status}]'
