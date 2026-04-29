import { useState, useEffect } from 'react';
import { S } from '../styles/theme';
import StatusBadge from '../components/StatusBadge';
import Countdown from '../components/Countdown';
import { placeBid } from '../api/bids';
import { getComments, postComment, likeComment } from '../api/comments';
import { getBidsForAuction } from '../api/bids';
import useAuctionSocket from '../hooks/useWebSocket';

const MEDIA = 'http://localhost:8000';
const imgUrl = (src) => !src ? null : src.startsWith('http') ? src : `${MEDIA}${src}`;

export default function CarDetailPage({ car, user, setPage, showToast }) {
  const [bidAmount,  setBidAmount]  = useState('');
  const [bidError,   setBidError]   = useState('');
  const [comment,    setComment]    = useState('');
  const [comments,   setComments]   = useState(car.comments || []);
  const [bids,       setBids]       = useState(car.bids || []);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [tab,        setTab]        = useState('details');
  const [currentBid, setCurrentBid] = useState(car.currentBid || car.startingBid);
  const [liked,      setLiked]      = useState(false);

  // Real-time WebSocket for live bid updates
  const socket = useAuctionSocket(car.auctionId);

  // Update bid display + bids list from WebSocket broadcast (fires for ALL connected users)
  useEffect(() => {
    if (!socket.currentBid) return;
    // Use functional update to avoid stale-closure on currentBid
    setCurrentBid(prev => (socket.currentBid > prev ? socket.currentBid : prev));
    // Refresh bids list so the Bids tab stays live for every watcher, not just the bidder
    if (car.auctionId) {
      getBidsForAuction(car.auctionId)
        .then(data => setBids(Array.isArray(data) ? data : data.results || []))
        .catch(() => {});
    }
    if (socket.lastBidder && socket.lastBidder !== user?.username) {
      showToast('New bid: €' + socket.currentBid.toLocaleString() + ' by @' + socket.lastBidder, 'warning');
    }
  }, [socket.currentBid, socket.lastBidder]);

  // Load real comments and bids from Django
  useEffect(() => {
    if (!car.auctionId) return;
    getComments(car.auctionId).then(data => setComments(Array.isArray(data) ? data : data.results || [])).catch(() => {});
    getBidsForAuction(car.auctionId).then(data => setBids(Array.isArray(data) ? data : data.results || [])).catch(() => {});
  }, [car.auctionId]);

  const minBid = currentBid + 100;

  const handleBid = async () => {
    if (!user) { setPage('login'); return; }
    const amt = Number(bidAmount);
    if (!bidAmount || isNaN(amt) || amt < minBid) { setBidError('Minimum bid is €' + minBid.toLocaleString()); return; }
    setBidError('');
    try {
      await placeBid(car.auctionId, amt);
      setBidAmount('');
      showToast('Bid placed successfully!', 'success');
      const updated = await getBidsForAuction(car.auctionId);
      setBids(Array.isArray(updated) ? updated : updated.results || []);
    } catch (err) {
      setBidError(err.message || 'Could not place bid.');
    }
  };

  const handleComment = async () => {
    if (!user) { setPage('login'); return; }
    if (!comment.trim()) return;
    try {
      await postComment(car.auctionId, comment.trim());
      setComment('');
      showToast('Comment posted!', 'info');
      const updated = await getComments(car.auctionId);
      setComments(Array.isArray(updated) ? updated : updated.results || []);
    } catch (err) {
      showToast(err.message || 'Could not post comment.', 'error');
    }
  };

  const handleLike = async (commentId) => {
    if (!user) { setPage('login'); return; }
    try {
      await likeComment(commentId);
      const updated = await getComments(car.auctionId);
      setComments(Array.isArray(updated) ? updated : updated.results || []);
    } catch (_) {}
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: 1240, margin: '0 auto' }} className="fade-in">
      <div onClick={() => setPage('auctions')} style={{ marginBottom: 24, color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui' }}>
        ← Back to Auctions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 44 }}>
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10, height: 420, background: '#1e293b', position: 'relative' }}>
            <img src={imgUrl(car.images?.[imgIdx] || car.images?.[0])} alt={car.make} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 16, left: 16 }}><StatusBadge status={car.status} /></div>
            {socket.connected && car.status === 'live' && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#22c55e', fontFamily: 'system-ui' }}>
                ● Live
              </div>
            )}
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button onClick={() => setLiked(v => !v)} style={{ ...S.btn, ...S.btnGhost, padding: '8px 14px', fontSize: 18 }}>
                {liked ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
          {car.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              {car.images.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{ width: 88, height: 64, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: imgIdx===i?'2px solid #f59e0b':'2px solid transparent' }}>
                  <img src={imgUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: 24 }}>
            {['details','bids','comments'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:tab===t?'2px solid #f59e0b':'2px solid transparent', padding:'12px 24px', color:tab===t?'#f59e0b':'#64748b', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'system-ui' }}>
                {t.toUpperCase()}
                {(t==='bids'||t==='comments') && <span style={{marginLeft:8,background:'#1e293b',borderRadius:12,padding:'1px 8px',fontSize:11}}>{t==='bids'?bids.length:comments.length}</span>}
              </button>
            ))}
          </div>
          {tab === 'details' && (
            <div className="fade-in">
              <p style={{ color:'#94a3b8', lineHeight:1.85, fontFamily:'system-ui', fontSize:15, marginBottom:28 }}>{car.description}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['VIN',car.vin||'—'],['Category',car.category],['Mileage',car.mileage],['Fuel',car.fuel],['Transmission',car.transmission],['Condition',car.condition],['Damage',car.damage]].map(([k,v]) => (
                  <div key={k} style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:9, padding:'14px 18px' }}>
                    <div style={{ fontSize:11, color:'#64748b', fontFamily:'system-ui', fontWeight:700, letterSpacing:1, marginBottom:4 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize:14, fontFamily:'system-ui', color:k==='Damage'&&v!=='None'?'#f59e0b':'#e2e8f0' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'bids' && (
            <div className="fade-in">
              {bids.length === 0
                ? <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'40px 0'}}>No approved bids yet.</div>
                : <table style={S.table}>
                    <thead><tr><th style={S.th}>Bidder</th><th style={S.th}>Amount</th><th style={S.th}>Time</th><th style={S.th}>Status</th></tr></thead>
                    <tbody>
                      {[...bids].reverse().map((b,i) => (
                        <tr key={i}>
                          <td style={S.td}><span style={{color:'#94a3b8',fontWeight:600}}>@{b.bidder_name||b.user}</span></td>
                          <td style={{...S.td,color:'#f59e0b',fontWeight:700}}>€{Number(b.amount).toLocaleString()}</td>
                          <td style={{...S.td,color:'#64748b'}}>{b.created_at ? new Date(b.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : b.time}</td>
                          <td style={S.td}>{i===0?<span style={{color:'#22c55e',fontSize:12,fontWeight:700}}>HIGHEST</span>:<span style={{color:'#64748b',fontSize:12}}>Outbid</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          )}
          {tab === 'comments' && (
            <div className="fade-in">
              <div style={{ marginBottom: 24 }}>
                <textarea style={{...S.input,minHeight:80,resize:'vertical'}} placeholder={user?'Write a comment…':'Login to comment'} value={comment} onChange={e=>setComment(e.target.value)} disabled={!user}/>
                <button onClick={handleComment} style={{...S.btn,...S.btnPrimary,marginTop:10}}>Post Comment</button>
              </div>
              {comments.map((c,i) => (
                <div key={i} style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:11,padding:'16px 20px',marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{color:'#f59e0b',fontWeight:700,fontSize:14,fontFamily:'system-ui'}}>@{c.author_name||c.user}</span>
                    <span style={{color:'#64748b',fontSize:12,fontFamily:'system-ui'}}>{c.created_at?new Date(c.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):c.time}</span>
                  </div>
                  <div style={{color:'#94a3b8',fontFamily:'system-ui',fontSize:14,lineHeight:1.65}}>{c.text}</div>
                  <div style={{marginTop:10,display:'flex',gap:16}}>
                    <span onClick={()=>handleLike(c.id)} style={{color:'#64748b',fontSize:12,cursor:'pointer',fontFamily:'system-ui'}}>👍 {c.like_count||c.likes||0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:16,padding:28,marginBottom:20}}>
              <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>{car.year} {car.make} {car.model}</h2>
              <div style={{color:'#64748b',fontSize:14,fontFamily:'system-ui',marginBottom:24}}>{car.mileage} · {car.fuel} · {car.category}</div>
              {car.status === 'live' && (
                <div style={{background:'#f59e0b09',border:'1px solid #f59e0b33',borderRadius:11,padding:'16px 20px',marginBottom:24,textAlign:'center'}}>
                  <div style={{fontSize:11,color:'#64748b',fontFamily:'system-ui',marginBottom:5,letterSpacing:1}}>AUCTION ENDS IN</div>
                  <Countdown endTime={car.auctionEnd} size="lg"/>
                </div>
              )}
              <div style={{display:'flex',gap:24,marginBottom:24}}>
                <div>
                  <div style={{fontSize:11,color:'#64748b',fontFamily:'system-ui',marginBottom:4,letterSpacing:1}}>CURRENT BID</div>
                  <div style={{fontSize:34,fontWeight:700,color:'#f59e0b',fontFamily:'system-ui'}}>€{Number(currentBid).toLocaleString()}</div>
                </div>
                <div style={{borderLeft:'1px solid #1e293b',paddingLeft:24}}>
                  <div style={{fontSize:11,color:'#64748b',fontFamily:'system-ui',marginBottom:4,letterSpacing:1}}>STARTING BID</div>
                  <div style={{fontSize:20,color:'#94a3b8',fontFamily:'system-ui',fontWeight:600}}>€{Number(car.startingBid).toLocaleString()}</div>
                </div>
              </div>
              {car.status === 'live' && (
                <>
                  <div style={{marginBottom:14}}>
                    <label style={S.label}>Your Bid (min €{minBid.toLocaleString()})</label>
                    <input type="number" style={{...S.input,...(bidError?{border:'1px solid #ef4444'}:{})}} placeholder={'€'+minBid.toLocaleString()} value={bidAmount}
                      onChange={e=>{setBidAmount(e.target.value);setBidError('');}} onKeyDown={e=>e.key==='Enter'&&handleBid()} />
                    {bidError && <div style={{color:'#ef4444',fontSize:13,marginTop:6,fontFamily:'system-ui'}}>{bidError}</div>}
                  </div>
                  <button onClick={handleBid} style={{...S.btn,...S.btnPrimary,width:'100%',fontSize:15,padding:'14px'}}>{user?'Place Bid →':'Login to Bid'}</button>
                  <div style={{fontSize:12,color:'#64748b',marginTop:12,fontFamily:'system-ui',textAlign:'center'}}>Minimum increment: €100</div>
                </>
              )}
              {car.status === 'ended' && <div style={{background:'#6b728018',border:'1px solid #6b728044',borderRadius:9,padding:16,color:'#6b7280',textAlign:'center',fontFamily:'system-ui'}}>This auction has ended</div>}
              {car.status === 'upcoming' && <button onClick={()=>showToast('You will be notified when this auction goes live!','success')} style={{...S.btn,...S.btnOutline,width:'100%',fontSize:14,padding:13}}>🔔 Notify Me When Live</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
