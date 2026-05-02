import { useState, useEffect, useRef } from 'react';
import { S } from '../styles/theme';
import AddListingPage from './AddListingPage';
import EditListingPage from './EditListingPage';
import { getListings, deleteListing } from '../api/auctions';
import { getPendingBids, setWinner } from '../api/bids';
import { getAllUsers, toggleBlockUser, setUserRole, getMe, updateMe } from '../api/auth';
import { getChatList, getChat, adminSendMsg } from '../api/chat';
import { getAuctions, setAuctionStatus, createAuction } from '../api/auctions';
import { getSellerInquiries } from '../api/messages';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard({ showToast }) {
  const [tab,      setTab]      = useState('overview');
  const [listings, setListings] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [bids,     setBids]     = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [editListing,  setEditListing]  = useState(null);
  const [inquiries,      setInquiries]      = useState([]);
  // Auction creation — tracks which listing's form is open + its field values
  const [auctionForm,    setAuctionForm]    = useState(null); // { listingId, start, end }
  const [auctionCreating,setAuctionCreating]= useState(false);
  // Bids tab — which auction groups are expanded
  const [expandedBidAuctions, setExpandedBidAuctions] = useState(new Set());
  const [chatConvos,  setChatConvos]  = useState([]);
  const [activeChat,  setActiveChat]  = useState(null);
  const [chatMsgs,    setChatMsgs]    = useState([]);
  const [chatBody,    setChatBody]    = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatPollRef = useRef(null);
  const chatBottomRef = useRef(null);
  const pollRef = useRef(null);
  const [profile, setProfile] = useState({ first_name:'', last_name:'', email:'', phone:'', country:'Lithuania' });
  const [profilePassword, setProfilePassword] = useState({ current:'', new_:'', confirm:'' });
  const [profileSaving, setProfileSaving] = useState(false);

  const fetchChatList = async () => {
    try {
      const data = await getChatList();
      setChatConvos(Array.isArray(data) ? data : []);
    } catch (_) {}
  };

  const fetchInquiries = async () => {
    try {
      const data = await getSellerInquiries();
      const list = Array.isArray(data) ? data : data.results || [];
      setInquiries(prev => {
        // Show toast if new inquiry arrived while admin is not on inquiries tab
        if (list.length > prev.length) {
          const newest = list[0];
          showToast(`New inquiry from ${newest.name}`, 'info');
        }
        return list;
      });
    } catch (_) {}
  };

  const fetchActiveChatMsgs = async (userId) => {
    try {
      const data = await getChat(userId);
      const list = Array.isArray(data) ? data : [];
      setChatMsgs(list);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch (_) {}
  };

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [l, u, b, a, me, inq] = await Promise.all([
          getListings(), getAllUsers(), getPendingBids(), getAuctions(), getMe(), getSellerInquiries()
        ]);
        setInquiries(Array.isArray(inq) ? inq : inq.results || []);
        setListings(Array.isArray(l) ? l : l.results || []);
        setUsers(Array.isArray(u) ? u : u.results || []);
        setBids(Array.isArray(b) ? b : b.results || []);
        setAuctions(Array.isArray(a) ? a : a.results || []);
        fetchChatList();
        setProfile({ first_name: me.first_name||'', last_name: me.last_name||'', email: me.email||'', phone: me.phone||'', country: me.country||'Lithuania' });
      } catch (err) {
        showToast('Error loading data: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    pollRef.current = setInterval(fetchChatList, 4000);
    const inquiryPoll = setInterval(fetchInquiries, 3000);
    return () => { clearInterval(pollRef.current); clearInterval(inquiryPoll); };
  }, []);

  const handleSetWinner = async (bidId) => {
    try {
      await setWinner(bidId);
      setBids(bs => bs.map(b => b.id === bidId ? {...b, status:'approved'} : {...b, status: b.auction === bs.find(x=>x.id===bidId)?.auction ? 'rejected' : b.status}));
      setAuctions(prev => prev.map(a => {
        const winBid = bids.find(b => b.id === bidId);
        return winBid && a.id === winBid.auction ? {...a, status:'ended'} : a;
      }));
      showToast('Winner set! Auction ended.', 'success');
    } catch(e) { showToast(e.message,'error'); }
  };
  const handleCreateAuction = async () => {
    if (!auctionForm?.listingId || !auctionForm.start || !auctionForm.end) {
      showToast('Fill in start and end date/time.', 'error'); return;
    }
    if (new Date(auctionForm.end) <= new Date(auctionForm.start)) {
      showToast('End time must be after start time.', 'error'); return;
    }
    setAuctionCreating(true);
    try {
      await createAuction({ listing_id: auctionForm.listingId, start_time: auctionForm.start, end_time: auctionForm.end, status: 'scheduled' });
      showToast('Auction scheduled!', 'success');
      setAuctionForm(null);
      const a = await getAuctions();
      setAuctions(Array.isArray(a) ? a : a.results || []);
    } catch(e) { showToast(e.message, 'error'); }
    finally { setAuctionCreating(false); }
  };

  const toggleBidGroup = (auctionId) => {
    setExpandedBidAuctions(prev => {
      const next = new Set(prev);
      next.has(auctionId) ? next.delete(auctionId) : next.add(auctionId);
      return next;
    });
  };

  const handleToggleUser = async (id) => {
    try { const r = await toggleBlockUser(id); setUsers(us => us.map(u => u.id===id?{...u,is_blocked:r.is_blocked}:u)); }
    catch(e) { showToast(e.message,'error'); }
  };
  const handleSetRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await setUserRole(userId, newRole);
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`User is now ${newRole === 'admin' ? 'an Admin' : 'a regular User'}.`, 'success');
    } catch(e) { showToast(e.message, 'error'); }
  };
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateMe(profile);
      showToast('Profile updated!', 'success');
    } catch(e) { showToast(e.message, 'error'); }
    finally { setProfileSaving(false); }
  };
  const handleChangePassword = async () => {
    if (!profilePassword.current) { showToast('Enter your current password.', 'error'); return; }
    if (!profilePassword.new_) { showToast('New password cannot be empty.', 'error'); return; }
    if (profilePassword.new_ !== profilePassword.confirm) { showToast('Passwords do not match.', 'error'); return; }
    setProfileSaving(true);
    try {
      await updateMe({ current_password: profilePassword.current, password: profilePassword.new_ });
      setProfilePassword({ current:'', new_:'', confirm:'' });
      showToast('Password changed!', 'success');
    } catch(e) { showToast(e.message, 'error'); }
    finally { setProfileSaving(false); }
  };
  const handleDeleteListing = async (id) => {
    try { await deleteListing(id); setListings(ls => ls.filter(l => l.id!==id)); showToast('Listing deleted.','warning'); }
    catch(e) { showToast(e.message,'error'); }
  };

  const pending = bids.filter(b => b.status==='pending').length;

  return (
    <div style={S.page} className="fade-in">
      <div style={{ marginBottom:36, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <h1 style={{ ...S.sectionTitle, marginBottom:0 }}>Admin Dashboard</h1>
        <button onClick={() => setShowAddForm(true)} style={{ ...S.btn, ...S.btnPrimary }}>+ Add Listing</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:36 }}>
        {[
          ['Live Auctions', auctions.filter(a=>a.status==='live').length, '#22c55e'],
          ['Total Listings', listings.length, '#3b82f6'],
          ['Awaiting Winner', auctions.filter(a=>a.status==='ended'&&!a.winner).length, '#f59e0b'],
          ['Users', users.length, '#a855f7'],
          ['New Inquiries', inquiries.filter(i=>!i.is_read).length, '#ef4444'],
        ].map(([l,v,c]) => (
          <div key={l} style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:12, padding:'20px 22px' }}>
            <div style={{ fontSize:11, color:'#64748b', fontFamily:'system-ui', fontWeight:700, marginBottom:8, letterSpacing:1 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:30, fontWeight:700, color:c, fontFamily:'system-ui' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', marginBottom:28 }}>
        {['overview','listings','auctions','bids','users','inquiries','messages','profile'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:tab===t?'2px solid #f59e0b':'2px solid transparent', padding:'12px 22px', color:tab===t?'#f59e0b':'#64748b', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'system-ui', letterSpacing:0.5, display:'flex', alignItems:'center', gap:7 }}>
            {t.toUpperCase()}
            {t==='bids' && auctions.filter(a=>a.status==='ended'&&!a.winner).length>0 && <span style={{background:'#f59e0b22',color:'#f59e0b',borderRadius:10,padding:'1px 7px',fontSize:11}}>{auctions.filter(a=>a.status==='ended'&&!a.winner).length} need winner</span>}
            {t==='inquiries' && inquiries.filter(i=>!i.is_read).length>0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:11}}>{inquiries.filter(i=>!i.is_read).length}</span>}
            {t==='messages' && chatConvos.reduce((s,c)=>s+c.unread,0)>0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:11}}>{chatConvos.reduce((s,c)=>s+c.unread,0)}</span>}
          </button>
        ))}
      </div>

      {loading && <div style={{textAlign:'center',padding:'40px',color:'#64748b',fontFamily:'system-ui'}}>Loading from Django…</div>}

      {!loading && tab==='overview' && (
        <div className="fade-in" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:13,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Live Auctions</h3>
            {auctions.filter(a=>a.status==='live').slice(0,5).map(a => (
              <div key={a.id} style={{padding:'12px 0',borderBottom:'1px solid #1e293b22',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14,fontFamily:'system-ui',fontWeight:600}}>{a.listing?.year} {a.listing?.make} {a.listing?.model}</div>
                  <div style={{fontSize:12,color:'#64748b',fontFamily:'system-ui',marginTop:2}}>Ends: {new Date(a.end_time).toLocaleString()}</div>
                </div>
                <div style={{fontSize:18,fontWeight:700,color:'#f59e0b',fontFamily:'system-ui'}}>€{Number(a.current_bid||a.listing?.starting_bid||0).toLocaleString()}</div>
              </div>
            ))}
            {auctions.filter(a=>a.status==='live').length===0 && <div style={{color:'#64748b',fontFamily:'system-ui',padding:'20px 0',textAlign:'center'}}>No live auctions</div>}
          </div>
          <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:13,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Awaiting Winner Selection</h3>
            {auctions.filter(a => a.status === 'ended' && !a.winner).length === 0
              ? <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'30px 0'}}>No ended auctions awaiting winner ✓</div>
              : auctions.filter(a => a.status === 'ended' && !a.winner).slice(0,4).map(a => {
                  const topBid = [...bids].filter(b => b.auction === a.id).sort((x,y) => y.amount - x.amount)[0];
                  return (
                    <div key={a.id} style={{padding:'14px 0',borderBottom:'1px solid #1e293b22'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div style={{fontSize:14,fontFamily:'system-ui',fontWeight:600}}>{a.listing?.year} {a.listing?.make} {a.listing?.model}</div>
                          <div style={{fontSize:12,color:'#64748b',fontFamily:'system-ui',marginTop:3}}>
                            {bids.filter(b=>b.auction===a.id).length} bid(s) · ended {new Date(a.end_time).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                          </div>
                        </div>
                        <button onClick={() => setTab('bids')} style={{...S.btn,...S.btnSuccess,padding:'6px 14px',fontSize:12}}>Select Winner →</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {!loading && tab==='listings' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:20}}>All Listings ({listings.length})</h3>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Vehicle</th><th style={S.th}>Category</th><th style={S.th}>Starting Bid</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id}>
                  <td style={{...S.td,fontWeight:600}}>{l.year} {l.make} {l.model}</td>
                  <td style={{...S.td,color:'#64748b'}}>{l.category}</td>
                  <td style={{...S.td,color:'#f59e0b',fontWeight:700,fontFamily:'system-ui'}}>€{Number(l.starting_bid).toLocaleString()}</td>
                  <td style={S.td}><span style={{color:l.status==='active'?'#22c55e':'#64748b',fontSize:12,fontWeight:700}}>{l.status?.toUpperCase()}</span></td>
                  <td style={S.td}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>setEditListing(l)} style={{...S.btn,...S.btnGhost,padding:'5px 12px',fontSize:12}}>Edit</button>
                      <button onClick={()=>handleDeleteListing(l.id)} style={{...S.btn,...S.btnDanger,padding:'5px 12px',fontSize:12}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab==='auctions' && (
        <div className="fade-in">

          {/* ── Listings without an auction ── */}
          {(() => {
            const auctionedIds = new Set(auctions.map(a => a.listing?.id).filter(Boolean));
            const unassigned   = listings.filter(l => !auctionedIds.has(l.id));
            if (unassigned.length === 0) return null;
            return (
              <div style={{marginBottom:36}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                  <h3 style={{fontSize:16,fontWeight:700,margin:0}}>Listings without an Auction</h3>
                  <span style={{background:'#f59e0b22',color:'#f59e0b',fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:20,letterSpacing:0.5}}>{unassigned.length} pending</span>
                </div>
                <div style={{display:'grid',gap:12}}>
                  {unassigned.map(l => {
                    const isOpen = auctionForm?.listingId === l.id;
                    return (
                      <div key={l.id} style={{background:'#0d1117',border:`1px solid ${isOpen?'#f59e0b55':'#1e293b'}`,borderRadius:13,padding:'18px 22px',transition:'border-color 0.2s'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{l.year} {l.make} {l.model}</div>
                            <div style={{color:'#64748b',fontSize:12,fontFamily:'system-ui'}}>
                              {l.category} · Starting bid: <span style={{color:'#f59e0b',fontWeight:600}}>€{Number(l.starting_bid).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setAuctionForm(isOpen ? null : { listingId: l.id, start:'', end:'' })}
                            style={{...S.btn,...(isOpen?S.btnGhost:S.btnPrimary),padding:'7px 16px',fontSize:13,flexShrink:0}}
                          >
                            {isOpen ? '✕ Cancel' : '⚡ Setup Auction'}
                          </button>
                        </div>

                        {isOpen && (
                          <div style={{marginTop:18,paddingTop:18,borderTop:'1px solid #1e293b22',display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end'}}>
                            <div>
                              <label style={{...S.label,fontSize:11}}>Start Date &amp; Time</label>
                              <input
                                type="datetime-local"
                                value={auctionForm.start}
                                onChange={e => setAuctionForm(f => ({...f, start: e.target.value}))}
                                style={{...S.input,fontSize:13}}
                              />
                            </div>
                            <div>
                              <label style={{...S.label,fontSize:11}}>End Date &amp; Time</label>
                              <input
                                type="datetime-local"
                                value={auctionForm.end}
                                onChange={e => setAuctionForm(f => ({...f, end: e.target.value}))}
                                style={{...S.input,fontSize:13}}
                              />
                            </div>
                            <button
                              onClick={handleCreateAuction}
                              disabled={auctionCreating}
                              style={{...S.btn,...S.btnSuccess,padding:'10px 20px',fontSize:13,opacity:auctionCreating?0.6:1}}
                            >
                              {auctionCreating ? 'Creating…' : '✓ Create Auction'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Existing auctions table ── */}
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>All Auctions ({auctions.length})</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Vehicle</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Current Bid</th>
                <th style={S.th}>Start</th>
                <th style={S.th}>End</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map(a => {
                const statusColor = {live:'#22c55e', scheduled:'#3b82f6', ended:'#64748b', cancelled:'#ef4444'}[a.status] || '#64748b';
                return (
                  <tr key={a.id}>
                    <td style={{...S.td,fontWeight:600}}>{a.listing?.year} {a.listing?.make} {a.listing?.model}</td>
                    <td style={S.td}><span style={{color:statusColor,fontSize:12,fontWeight:700}}>{a.status?.toUpperCase()}</span></td>
                    <td style={{...S.td,color:'#f59e0b',fontWeight:700,fontFamily:'system-ui'}}>€{Number(a.current_bid||a.listing?.starting_bid||0).toLocaleString()}</td>
                    <td style={{...S.td,color:'#64748b',fontFamily:'system-ui',fontSize:12}}>{new Date(a.start_time).toLocaleString()}</td>
                    <td style={{...S.td,color:'#64748b',fontFamily:'system-ui',fontSize:12}}>{new Date(a.end_time).toLocaleString()}</td>
                    <td style={S.td}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {a.status === 'scheduled' && (
                          <button onClick={async () => {
                            try { await setAuctionStatus(a.id,'live'); setAuctions(prev=>prev.map(x=>x.id===a.id?{...x,status:'live'}:x)); showToast('Auction is now LIVE!','success'); }
                            catch(e) { showToast(e.message,'error'); }
                          }} style={{...S.btn,...S.btnSuccess,padding:'5px 12px',fontSize:12}}>▶ Go Live</button>
                        )}
                        {a.status === 'live' && (
                          <button onClick={async () => {
                            try { await setAuctionStatus(a.id,'ended'); setAuctions(prev=>prev.map(x=>x.id===a.id?{...x,status:'ended'}:x)); showToast('Auction ended.','warning'); }
                            catch(e) { showToast(e.message,'error'); }
                          }} style={{...S.btn,...S.btnDanger,padding:'5px 12px',fontSize:12}}>■ End</button>
                        )}
                        {(a.status === 'scheduled' || a.status === 'live') && (
                          <button onClick={async () => {
                            try { await setAuctionStatus(a.id,'cancelled'); setAuctions(prev=>prev.map(x=>x.id===a.id?{...x,status:'cancelled'}:x)); showToast('Auction cancelled.','warning'); }
                            catch(e) { showToast(e.message,'error'); }
                          }} style={{...S.btn,...S.btnGhost,padding:'5px 12px',fontSize:12}}>✕ Cancel</button>
                        )}
                        {(a.status === 'ended' || a.status === 'cancelled') && (
                          <span style={{color:'#334155',fontSize:12,fontFamily:'system-ui'}}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {auctions.length === 0 && <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'30px 0'}}>No auctions yet. Use the section above to create one.</div>}
        </div>
      )}

      {!loading && tab==='bids' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>Bids by Vehicle</h3>
          <p style={{color:'#64748b',fontFamily:'system-ui',fontSize:13,marginBottom:24}}>
            Bids are grouped by vehicle. End an auction first, then click <strong style={{color:'#f1f5f9'}}>Set Winner</strong> on the highest bid.
          </p>

          {auctions.length === 0 && (
            <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:36,marginBottom:12}}>🏷</div>
              <div>No auctions yet.</div>
            </div>
          )}

          <div style={{display:'grid',gap:16}}>
            {auctions.map(a => {
              const auctionBids = [...bids.filter(b => b.auction === a.id)].sort((x,y) => Number(y.amount) - Number(x.amount));
              const isEnded     = a.status === 'ended';
              const hasWinner   = !!a.winner;
              const isExpanded  = expandedBidAuctions.has(a.id);
              const topBid      = auctionBids[0];
              const statusColor = {live:'#22c55e', scheduled:'#3b82f6', ended:'#64748b', cancelled:'#ef4444'}[a.status] || '#64748b';
              const needsWinner = isEnded && !hasWinner && auctionBids.length > 0;

              return (
                <div key={a.id} style={{background:'#0d1117',border:`1px solid ${needsWinner?'#f59e0b55':'#1e293b'}`,borderRadius:14,overflow:'hidden',transition:'border-color 0.2s'}}>
                  {/* Vehicle header row */}
                  <div
                    onClick={() => toggleBidGroup(a.id)}
                    style={{display:'flex',alignItems:'center',gap:16,padding:'18px 22px',cursor:'pointer',userSelect:'none'}}
                  >
                    {/* Expand chevron */}
                    <span style={{color:'#475569',fontSize:14,transition:'transform 0.2s',display:'inline-block',transform:isExpanded?'rotate(90deg)':'rotate(0deg)'}}>▶</span>

                    {/* Vehicle name */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>
                        {a.listing?.year} {a.listing?.make} {a.listing?.model}
                        {needsWinner && <span style={{marginLeft:10,background:'#f59e0b22',color:'#f59e0b',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,letterSpacing:1}}>NEEDS WINNER</span>}
                        {hasWinner   && <span style={{marginLeft:10,background:'#22c55e22',color:'#22c55e',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,letterSpacing:1}}>WINNER SET ✓</span>}
                      </div>
                      <div style={{color:'#64748b',fontSize:12,fontFamily:'system-ui'}}>
                        Ends: {new Date(a.end_time).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                        &nbsp;·&nbsp;{auctionBids.length} bid{auctionBids.length!==1?'s':''}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{color:statusColor,fontSize:11,fontWeight:700,fontFamily:'system-ui',letterSpacing:1,flexShrink:0}}>
                      {a.status?.toUpperCase()}
                    </span>

                    {/* Highest bid */}
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{color:'#94a3b8',fontSize:10,fontFamily:'system-ui',marginBottom:2}}>HIGHEST BID</div>
                      <div style={{color:'#f59e0b',fontWeight:700,fontSize:17,fontFamily:'system-ui'}}>
                        €{Number(topBid?.amount || a.listing?.starting_bid || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Expanded bid list */}
                  {isExpanded && (
                    <div style={{borderTop:'1px solid #1e293b'}}>
                      {auctionBids.length === 0 ? (
                        <div style={{color:'#475569',fontFamily:'system-ui',fontSize:13,padding:'20px 24px',textAlign:'center'}}>No bids placed yet.</div>
                      ) : (
                        <table style={{...S.table,margin:0,borderRadius:0}}>
                          <thead>
                            <tr>
                              <th style={{...S.th,paddingLeft:24}}>#</th>
                              <th style={S.th}>Bidder</th>
                              <th style={S.th}>Amount</th>
                              <th style={S.th}>Placed</th>
                              <th style={S.th}>Status</th>
                              <th style={S.th}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auctionBids.map((bid, idx) => {
                              const isWinnerBid = bid.status === 'approved' && hasWinner;
                              return (
                                <tr key={bid.id} style={{background:isWinnerBid?'#052e0a':idx===0&&needsWinner?'#1a1400':'transparent'}}>
                                  <td style={{...S.td,paddingLeft:24,color:'#64748b',fontFamily:'system-ui',fontSize:12}}>#{idx+1}</td>
                                  <td style={{...S.td,fontWeight:600}}>@{bid.bidder_name}</td>
                                  <td style={{...S.td,color:'#f59e0b',fontWeight:700,fontFamily:'system-ui',fontSize:15}}>€{Number(bid.amount).toLocaleString()}</td>
                                  <td style={{...S.td,color:'#64748b',fontFamily:'system-ui',fontSize:12}}>{new Date(bid.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                                  <td style={S.td}>
                                    {bid.status === 'rejected' && <span style={{color:'#ef4444',fontSize:12,fontWeight:700}}>REJECTED</span>}
                                    {isWinnerBid                && <span style={{color:'#22c55e',fontSize:12,fontWeight:700}}>WINNER ✓</span>}
                                    {bid.status === 'approved' && !hasWinner && <span style={{color:'#3b82f6',fontSize:12,fontWeight:600}}>ACTIVE</span>}
                                    {bid.status === 'pending'  && <span style={{color:'#64748b',fontSize:12}}>—</span>}
                                  </td>
                                  <td style={S.td}>
                                    {isEnded && !hasWinner && (
                                      <button onClick={() => handleSetWinner(bid.id)} style={{...S.btn,...S.btnSuccess,padding:'5px 14px',fontSize:12}}>
                                        🏆 Set Winner
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {bids.length === 0 && auctions.length > 0 && (
            <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'20px 0'}}>No bids placed yet on any auction.</div>
          )}
        </div>
      )}

      {!loading && tab==='users' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:20}}>User Management ({users.length})</h3>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Username</th><th style={S.th}>Email</th><th style={S.th}>Country</th><th style={S.th}>Role</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{...S.td,fontWeight:600}}>{u.username}</td>
                  <td style={{...S.td,color:'#64748b'}}>{u.email}</td>
                  <td style={{...S.td,color:'#64748b'}}>{u.country}</td>
                  <td style={S.td}><span style={{color:u.role==='admin'?'#f59e0b':'#94a3b8',fontSize:12,fontWeight:700}}>{u.role?.toUpperCase()}</span></td>
                  <td style={S.td}><span style={{color:u.is_blocked?'#ef4444':'#22c55e',fontSize:12,fontWeight:700}}>{u.is_blocked?'BLOCKED':'ACTIVE'}</span></td>
                  <td style={S.td}>
                    <div style={{display:'flex',gap:7}}>
                      <button onClick={()=>handleToggleUser(u.id)} style={{...S.btn,...(u.is_blocked?S.btnSuccess:S.btnDanger),padding:'5px 12px',fontSize:12}}>
                        {u.is_blocked?'Unblock':'Block'}
                      </button>
                      <button onClick={()=>handleSetRole(u.id, u.role)} style={{...S.btn,...(u.role==='admin'?S.btnGhost:S.btnSuccess),padding:'5px 12px',fontSize:12}}>
                        {u.role==='admin'?'Remove Admin':'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab==='inquiries' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>Seller Inquiries</h3>
          <p style={{color:'#64748b',fontFamily:'system-ui',fontSize:13,marginBottom:24}}>Contact requests from the "Get Started" form on the homepage.</p>
          {inquiries.length === 0 ? (
            <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:40,marginBottom:12}}>📭</div>
              <div>No inquiries yet.</div>
            </div>
          ) : (
            <div style={{display:'grid',gap:16}}>
              {inquiries.map(inq => (
                <div key={inq.id} style={{background:'#0d1117',border:`1px solid ${inq.is_read?'#1e293b':'#f59e0b44'}`,borderRadius:13,padding:'20px 24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14,gap:16}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                        <span style={{fontSize:16,fontWeight:700,color:'#f1f5f9'}}>{inq.name}</span>
                        {!inq.is_read && <span style={{background:'#f59e0b22',color:'#f59e0b',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,letterSpacing:1}}>NEW</span>}
                      </div>
                      <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                        <a href={`mailto:${inq.email}`} style={{color:'#3b82f6',fontSize:13,fontFamily:'system-ui',textDecoration:'none'}}>✉ {inq.email}</a>
                        {inq.phone && <span style={{color:'#64748b',fontSize:13,fontFamily:'system-ui'}}>📞 {inq.phone}</span>}
                        {inq.vehicle_info && <span style={{color:'#94a3b8',fontSize:13,fontFamily:'system-ui'}}>🚗 {inq.vehicle_info}</span>}
                      </div>
                    </div>
                    <div style={{color:'#475569',fontSize:12,fontFamily:'system-ui',flexShrink:0}}>
                      {new Date(inq.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                  <div style={{background:'#0a0c14',border:'1px solid #1e293b',borderRadius:9,padding:'14px 16px',color:'#94a3b8',fontFamily:'system-ui',fontSize:14,lineHeight:1.65}}>
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && tab==='messages' && (
        <div className="fade-in" style={{display:'flex',gap:0,height:560,background:'#0d1117',border:'1px solid #1e293b',borderRadius:16,overflow:'hidden'}}>
          {/* Left: conversation list */}
          <div style={{width:240,borderRight:'1px solid #1e293b',display:'flex',flexDirection:'column',flexShrink:0}}>
            <div style={{padding:'16px 18px',borderBottom:'1px solid #1e293b',fontWeight:700,fontSize:14}}>Conversations</div>
            <div style={{flex:1,overflowY:'auto'}}>
              {chatConvos.length===0 && (
                <div style={{color:'#475569',fontFamily:'system-ui',fontSize:13,textAlign:'center',padding:'32px 12px'}}>No conversations yet</div>
              )}
              {chatConvos.map(c => (
                <div key={c.user_id}
                  onClick={() => { setActiveChat(c); fetchActiveChatMsgs(c.user_id); clearInterval(chatPollRef.current); chatPollRef.current = setInterval(() => fetchActiveChatMsgs(c.user_id), 4000); }}
                  style={{padding:'14px 18px',borderBottom:'1px solid #0f172a',cursor:'pointer',background:activeChat?.user_id===c.user_id?'#1e293b':'transparent',transition:'background 0.15s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#1e293b',border:'1px solid #334155',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:'#f59e0b',fontFamily:'system-ui',flexShrink:0}}>
                        {c.username[0].toUpperCase()}
                      </div>
                      <span style={{fontWeight:600,fontSize:13,fontFamily:'system-ui'}}>@{c.username}</span>
                    </div>
                    {c.unread>0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:700,flexShrink:0}}>{c.unread}</span>}
                  </div>
                  <div style={{fontSize:12,color:'#475569',fontFamily:'system-ui',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingLeft:40}}>{c.last_body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: chat thread */}
          <div style={{flex:1,display:'flex',flexDirection:'column'}}>
            {!activeChat ? (
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#334155',fontFamily:'system-ui',fontSize:14}}>Select a conversation</div>
            ) : (
              <>
                {/* Thread header */}
                <div style={{padding:'14px 20px',borderBottom:'1px solid #1e293b',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'#1e293b',border:'1px solid #334155',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'#f59e0b',fontFamily:'system-ui'}}>
                    {activeChat.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>@{activeChat.username}</div>
                    <div style={{fontSize:11,color:'#22c55e',fontFamily:'system-ui',marginTop:1}}>● Live</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:8}}>
                  {chatMsgs.map(msg => {
                    const isAdmin = msg.is_admin;
                    return (
                      <div key={msg.id} style={{display:'flex',justifyContent:isAdmin?'flex-end':'flex-start'}}>
                        <div style={{
                          maxWidth:'72%',
                          background: isAdmin?'#1e3a5f':'#1a2e1a',
                          border: isAdmin?'none':'1px solid #22c55e22',
                          borderRadius: isAdmin?'14px 14px 4px 14px':'14px 14px 14px 4px',
                          padding:'9px 13px',
                          fontSize:13,fontFamily:'system-ui',color:'#cbd5e1',lineHeight:1.55,
                        }}>
                          {!isAdmin && <div style={{fontSize:10,color:'#22c55e',fontWeight:700,marginBottom:3,letterSpacing:0.5}}>@{activeChat.username}</div>}
                          {isAdmin  && <div style={{fontSize:10,color:'#93c5fd',fontWeight:700,marginBottom:3,letterSpacing:0.5}}>YOU (ADMIN)</div>}
                          {msg.body}
                          <div style={{fontSize:10,color:'#475569',marginTop:4,textAlign:isAdmin?'right':'left'}}>
                            {new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <div style={{padding:'12px 16px',borderTop:'1px solid #1e293b',display:'flex',gap:8,alignItems:'flex-end',flexShrink:0}}>
                  <textarea
                    rows={2}
                    style={{...S.input,flex:1,resize:'none',fontSize:13,padding:'9px 12px',borderRadius:12}}
                    placeholder={`Reply to @${activeChat.username}…`}
                    value={chatBody}
                    onChange={e=>setChatBody(e.target.value)}
                    onKeyDown={async e=>{
                      if(e.key==='Enter'&&!e.shiftKey){
                        e.preventDefault();
                        const text=chatBody.trim();
                        if(!text||chatSending)return;
                        setChatSending(true);
                        try{
                          const msg=await adminSendMsg(activeChat.user_id,text);
                          setChatMsgs(p=>[...p,msg]);
                          setChatBody('');
                          setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:'smooth'}),60);
                        }catch(err){showToast(err.message,'error');}
                        finally{setChatSending(false);}
                      }
                    }}
                  />
                  <button
                    disabled={chatSending||!chatBody.trim()}
                    onClick={async()=>{
                      const text=chatBody.trim();
                      if(!text||chatSending)return;
                      setChatSending(true);
                      try{
                        const msg=await adminSendMsg(activeChat.user_id,text);
                        setChatMsgs(p=>[...p,msg]);
                        setChatBody('');
                        setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:'smooth'}),60);
                      }catch(err){showToast(err.message,'error');}
                      finally{setChatSending(false);}
                    }}
                    style={{...S.btn,...S.btnPrimary,width:40,height:40,padding:0,fontSize:17,borderRadius:12,opacity:(!chatBody.trim()||chatSending)?0.4:1,flexShrink:0}}
                  >➤</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && tab==='profile' && (
        <div className="fade-in" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28,alignItems:'start'}}>
          {/* Profile details */}
          <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:14,padding:28}}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:22}}>Edit Profile</h3>
            <div style={{display:'grid',gap:16}}>
              {[['First Name','first_name','text'],['Last Name','last_name','text'],['Email','email','email'],['Phone','phone','tel'],['Country','country','text']].map(([label,key,type]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} type={type} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))} />
                </div>
              ))}
            </div>
            <button onClick={handleSaveProfile} disabled={profileSaving} style={{...S.btn,...S.btnPrimary,marginTop:22,fontSize:14,padding:'11px 28px'}}>
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {/* Change password */}
          <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:14,padding:28}}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:22}}>Change Password</h3>
            <div style={{display:'grid',gap:16}}>
              {[['Current Password','current','Enter current password'],['New Password','new_','New password'],['Confirm Password','confirm','Repeat new password']].map(([label,key,ph]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} type="password" placeholder={ph} value={profilePassword[key]} onChange={e=>setProfilePassword(p=>({...p,[key]:e.target.value}))} />
                </div>
              ))}
            </div>
            <button onClick={handleChangePassword} disabled={profileSaving} style={{...S.btn,...S.btnPrimary,marginTop:22,fontSize:14,padding:'11px 28px'}}>
              {profileSaving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <AddListingPage
          showToast={showToast}
          onClose={() => setShowAddForm(false)}
          onCreated={async () => {
            setShowAddForm(false);
            const [l, a] = await Promise.all([getListings(), getAuctions()]);
            setListings(Array.isArray(l) ? l : l.results || []);
            setAuctions(Array.isArray(a) ? a : a.results || []);
            showToast('Done! Listing added.', 'success');
          }}
        />
      )}

      {editListing && (
        <EditListingPage
          listing={editListing}
          showToast={showToast}
          onClose={() => setEditListing(null)}
          onSaved={async () => {
            setEditListing(null);
            const [l, a] = await Promise.all([getListings(), getAuctions()]);
            setListings(Array.isArray(l) ? l : l.results || []);
            setAuctions(Array.isArray(a) ? a : a.results || []);
          }}
        />
      )}
    </div>
  );
}
