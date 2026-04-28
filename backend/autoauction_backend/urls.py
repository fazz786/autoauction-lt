"""
AutoAuction LT — Main URL Configuration
All API routes are prefixed with /api/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',          admin.site.urls),

    # ── REST API endpoints ────────────────────────────────────────────────
    path('api/auth/',       include('apps.users.urls')),
    path('api/listings/',   include('apps.listings.urls')),
    path('api/auctions/',   include('apps.auctions.urls')),
    path('api/bids/',       include('apps.bids.urls')),
    path('api/comments/',   include('apps.comments.urls')),
    path('api/messages/',   include('apps.messages.urls')),
    path('api/chat/',       include('apps.chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
