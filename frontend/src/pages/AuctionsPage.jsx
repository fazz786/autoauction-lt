import { useState, useEffect } from 'react';
import { S } from '../styles/theme';
import { getAuctions, getListings } from '../api/auctions';
import CarCard from '../components/CarCard';

export default function AuctionsPage({ setPage, setSelectedCar }) {
  const [allCars,  setAllCars]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [sort,     setSort]     = useState('newest');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [auctionData, listingData] = await Promise.all([getAuctions(), getListings()]);

        const auctions = Array.isArray(auctionData) ? auctionData : auctionData.results || [];
        const listings = Array.isArray(listingData) ? listingData : listingData.results || [];

        // IDs of listings that already have an auction (avoid duplicates)
        const auctionedListingIds = new Set(auctions.map(a => a.listing?.id).filter(Boolean));

        const mappedAuctions = auctions.map(a => ({
          id:            a.id,
          auctionId:     a.id,
          listingId:     a.listing?.id,
          make:          a.listing?.make          || '',
          model:         a.listing?.model         || '',
          year:          a.listing?.year          || '',
          mileage:       a.listing?.mileage_display || '',
          fuel:          a.listing?.fuel          || '',
          transmission:  a.listing?.transmission  || '',
          category:      a.listing?.category      || '',
          condition:     a.listing?.condition     || '',
          damage:        a.listing?.damage        || '',
          description:   a.listing?.description   || '',
          startingBid:   parseFloat(a.listing?.starting_bid || 0),
          currentBid:    a.current_bid            || 0,
          highestBidder: a.winner?.username       || '',
          auctionEnd:    new Date(a.end_time).getTime(),
          status:        a.status === 'scheduled' ? 'upcoming' : a.status,
          images:        a.listing?.images?.map(i => i.image) || [],
          bids: [], comments: [],
          _created: a.created_at,
        }));

        // Listings without any auction → show as 'listed'
        const mappedListings = listings
          .filter(l => !auctionedListingIds.has(l.id))
          .map(l => ({
            id:           `listing-${l.id}`,
            auctionId:    null,
            listingId:    l.id,
            make:         l.make          || '',
            model:        l.model         || '',
            year:         l.year          || '',
            mileage:      l.mileage_display || '',
            fuel:         l.fuel          || '',
            transmission: l.transmission  || '',
            category:     l.category      || '',
            condition:    l.condition     || '',
            damage:       l.damage        || '',
            description:  l.description   || '',
            startingBid:  parseFloat(l.starting_bid || 0),
            currentBid:   0,
            highestBidder: '',
            auctionEnd:   null,
            status:       'listed',
            images:       l.images?.map(i => i.image) || [],
            bids: [], comments: [],
            _created: l.created_at,
          }));

        setAllCars([...mappedAuctions, ...mappedListings]);
      } catch (err) {
        setError('Could not load vehicles. Is the Django server running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statuses   = [
    ['all','All'], ['live','Live'], ['upcoming','Upcoming'],
    ['listed','Listed'], ['ended','Ended'],
  ];
  const categories = ['All','Sedan','SUV','Hatchback','Truck','Van','Motorcycle','Other'];

  const filtered = allCars
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => category === 'All' || c.category?.toLowerCase() === category.toLowerCase())
    .filter(c => `${c.make} ${c.model} ${c.year}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price_asc')  return (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid);
      if (sort === 'price_desc') return (b.currentBid || b.startingBid) - (a.currentBid || a.startingBid);
      if (sort === 'ending')     return (a.auctionEnd || Infinity) - (b.auctionEnd || Infinity);
      // newest (default)
      return new Date(b._created || 0) - new Date(a._created || 0);
    });

  return (
    <div style={S.page} className="fade-in">
      <div style={{ marginBottom: 36 }}>
        <h1 style={S.sectionTitle}>Browse Vehicles</h1>
        <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15 }}>
          Live auctions, upcoming listings, and vehicles available for sale.
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, padding: '18px 24px', marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...S.input, maxWidth: 280, flex: '1 1 200px' }}
          placeholder="Search make, model, year..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {statuses.map(([v, l]) => (
            <span key={v} onClick={() => setFilter(v)}
              style={{ ...S.chip, ...(filter===v ? {background:'#f59e0b',color:'#000',border:'1px solid #f59e0b'} : {background:'#1e293b',color:'#64748b',border:'1px solid #334155'}) }}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <span key={c} onClick={() => setCategory(c)}
              style={{ ...S.chip, ...(category===c ? {background:'transparent',color:'#f59e0b',border:'1px solid #f59e0b'} : {background:'transparent',color:'#64748b',border:'1px solid #334155'}) }}>
              {c}
            </span>
          ))}
        </div>
        <select style={{ ...S.input, maxWidth: 190 }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="ending">Ending Soonest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'80px 0', color:'#64748b', fontFamily:'system-ui' }}>
          <div style={{fontSize:40,marginBottom:16}}>⏳</div>
          <div>Loading vehicles…</div>
        </div>
      )}
      {error && !loading && (
        <div style={{ background:'#ef444410', border:'1px solid #ef444430', borderRadius:12, padding:24, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>
          <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
          <div style={{fontWeight:700,marginBottom:8}}>Cannot connect to Django backend</div>
          <div style={{fontSize:13,color:'#94a3b8'}}>Run: <code>python manage.py runserver</code></div>
        </div>
      )}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: 16, color: '#64748b', fontSize: 14, fontFamily: 'system-ui' }}>
            <strong style={{color:'#94a3b8'}}>{filtered.length}</strong> vehicles found
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {filtered.map(car => (
              <CarCard key={car.id} car={car} onClick={() => { setSelectedCar(car); setPage('carDetail'); }} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{textAlign:'center',padding:'80px 0',color:'#64748b',fontFamily:'system-ui'}}>
              <div style={{fontSize:56,marginBottom:16}}>🔍</div>
              <div style={{fontSize:18}}>No vehicles match your search</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
