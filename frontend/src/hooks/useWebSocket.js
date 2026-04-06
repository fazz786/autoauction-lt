/* ─────────────────────────────────────────────────────────────────────────────
   hooks/useWebSocket.js
   Connects to the Django Channels WebSocket for a specific auction.
   Automatically reconnects if the connection drops.
   Returns the latest bid update received from the server.

   Usage:
     const { currentBid, bidCount, status } = useAuctionSocket(auctionId);
───────────────────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from 'react';
import { WS_URL } from '../api/config';

export default function useAuctionSocket(auctionId) {
  const [currentBid, setCurrentBid] = useState(null);
  const [bidCount,   setBidCount]   = useState(0);
  const [lastBidder, setLastBidder] = useState('');
  const [connected,  setConnected]  = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!auctionId) return;

    function connect() {
      const ws = new WebSocket(`${WS_URL}/auction/${auctionId}/`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log(`[WS] Connected to auction ${auctionId}`);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'auction_state') {
          // Initial state sent on connection
          setCurrentBid(data.current_bid);
        }

        if (data.type === 'bid_update') {
          // Broadcast after admin approves a bid
          setCurrentBid(data.current_bid);
          setBidCount(data.bid_count);
          setLastBidder(data.bidder);
        }

        if (data.type === 'auction_ended') {
          console.log('[WS] Auction ended');
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('[WS] Disconnected — reconnecting in 3s...');
        // Auto-reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [auctionId]);

  return { currentBid, bidCount, lastBidder, connected };
}
