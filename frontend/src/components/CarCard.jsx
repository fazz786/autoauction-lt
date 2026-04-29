import { useState } from 'react';
import { S } from '../styles/theme';
import StatusBadge from './StatusBadge';
import Countdown from './Countdown';

/* ─────────────────────────────────────────────────────────────────────────────
   CarCard.jsx
   Reusable vehicle listing card used on the Home and Auctions pages.
   Props:
     car     – vehicle object from mockData
     onClick – callback when the card is clicked
     compact – boolean, reduces padding/font size for smaller grids
───────────────────────────────────────────────────────────────────────────── */
export default function CarCard({ car, onClick, compact = false }) {
  const [hovered, setHovered] = useState(false);

  // Normalise API auction objects and old mock-data objects to the same shape
  const listing   = car.listing || car;
  const rawImages = listing.images || car.images || [];
  const imageUrl  = rawImages.length > 0
    ? (typeof rawImages[0] === 'string' ? rawImages[0] : (rawImages[0].image?.startsWith('http') ? rawImages[0].image : `http://localhost:8000${rawImages[0].image}`))
    : null;
  const make         = listing.make         || car.make         || '';
  const model        = listing.model        || car.model        || '';
  const year         = listing.year         || car.year         || '';
  const mileage      = listing.mileage_display || car.mileage  || (listing.mileage_km ? `${Number(listing.mileage_km).toLocaleString()} km` : '—');
  const fuel         = listing.fuel         || car.fuel         || '';
  const transmission = listing.transmission || car.transmission || '';
  const category     = listing.category     || car.category     || '';
  const condition    = listing.condition    || car.condition     || '';
  const currentBid   = car.current_bid      ?? car.currentBid   ?? 0;
  const auctionEnd   = car.end_time ? new Date(car.end_time).getTime() : car.auctionEnd;
  const status       = car.status           || listing.status   || '';
  const highestBidder = car.highestBidder   || '';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...S.card, ...(hovered ? S.cardHovered : {}) }}
    >
      {/* Image */}
      <div style={{
        position:   'relative',
        height:     compact ? 155 : 200,
        overflow:   'hidden',
        background: '#1e293b',
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              transition: 'transform 0.4s',
              transform:  hovered ? 'scale(1.07)' : 'scale(1)',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#334155' }}>🚗</div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <StatusBadge status={status} />
        </div>
        {status === 'live' && auctionEnd && (
          <div style={{
            position:   'absolute',
            bottom:     10,
            right:      10,
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 6,
            padding:    '3px 10px',
          }}>
            <Countdown endTime={auctionEnd} />
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: compact ? '14px 16px' : '20px' }}>
        <div style={{ fontSize: compact ? 15 : 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
          {year} {make} {model}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: compact ? 12 : 14, fontFamily: 'system-ui' }}>
          {mileage} · {fuel} · {transmission}
        </div>

        {!compact && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[category, condition].map((tag) => (
              <span key={tag} style={{
                ...S.chip,
                background: '#1e293b',
                color:      '#94a3b8',
                border:     '1px solid #334155',
                fontSize:   11,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'system-ui', marginBottom: 2 }}>
              {status === 'listed' ? 'STARTING BID' : 'CURRENT BID'}
            </div>
            <div style={{ fontSize: compact ? 18 : 24, fontWeight: 700, color: '#f59e0b', fontFamily: 'system-ui' }}>
              €{Number(status === 'listed' ? (car.startingBid || 0) : currentBid).toLocaleString()}
            </div>
          </div>
          {!compact && status === 'live' && highestBidder && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'system-ui' }}>Top bidder</div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'system-ui', fontWeight: 600 }}>
                @{highestBidder}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
