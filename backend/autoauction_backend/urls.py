"""
AutoAuction LT — Main URL Configuration
All API routes are prefixed with /api/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

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

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
