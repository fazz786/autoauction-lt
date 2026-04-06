"""
auctions/routing.py
WebSocket URL patterns for Django Channels.
ws://localhost:8000/ws/auction/<id>/
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/auction/(?P<auction_id>\d+)/$', consumers.AuctionConsumer.as_asgi()),
]
