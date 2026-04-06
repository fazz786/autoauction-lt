"""
auctions/consumers.py
Django Channels WebSocket consumer.
Each auction has its own channel group: auction_<id>
When a bid is approved, the server broadcasts the new price to all
connected clients in that group — replacing the polling approach.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Auction


class AuctionConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.auction_id   = self.scope['url_route']['kwargs']['auction_id']
        self.group_name   = f'auction_{self.auction_id}'

        # Join the auction's channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send current state immediately on connect
        data = await self.get_auction_data()
        await self.send(text_data=json.dumps({'type': 'auction_state', **data}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Clients don't send bids via WebSocket — bids go through REST API.
           This handler is kept for future use (e.g. typing indicators)."""
        pass

    # ── Group message handlers ────────────────────────────────────────────────

    async def bid_update(self, event):
        """Broadcast new bid to all clients watching this auction."""
        await self.send(text_data=json.dumps({
            'type':        'bid_update',
            'current_bid': event['current_bid'],
            'bid_count':   event['bid_count'],
            'bidder':      event['bidder'],
        }))

    async def auction_ended(self, event):
        """Notify all clients that the auction has ended."""
        await self.send(text_data=json.dumps({
            'type':   'auction_ended',
            'winner': event.get('winner'),
        }))

    # ── DB helpers ────────────────────────────────────────────────────────────

    @database_sync_to_async
    def get_auction_data(self):
        try:
            auction = Auction.objects.get(pk=self.auction_id)
            return {
                'auction_id':  auction.id,
                'status':      auction.status,
                'current_bid': float(auction.get_current_bid()),
                'end_time':    auction.end_time.isoformat(),
            }
        except Auction.DoesNotExist:
            return {'error': 'Auction not found'}
