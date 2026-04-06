from django.contrib import admin
from .models import Listing, ListingImage

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'year', 'make', 'model', 'category', 'condition', 'starting_bid', 'status']
    list_filter   = ['status', 'category', 'fuel']
    search_fields = ['make', 'model', 'vin']
    inlines       = [ListingImageInline]
