from django.contrib import admin
from .models import Auction

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display  = ['id', 'listing', 'status', 'start_time', 'end_time', 'current_bid']
    list_filter   = ['status']
    search_fields = ['listing__make', 'listing__model', 'listing__vin']
