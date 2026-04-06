from django.contrib import admin
from .models import Bid

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display  = ['id', 'auction', 'bidder', 'amount', 'status', 'created_at']
    list_filter   = ['status']
    search_fields = ['bidder__username', 'auction__listing__make']
