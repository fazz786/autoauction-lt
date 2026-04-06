import { useState, useEffect } from 'react';
import { S } from '../styles/theme';
import { getListings, deleteListing, createListing } from '../api/auctions';
import { getPendingBids, approveBid, rejectBid } from '../api/bids';
import { getAllUsers, toggleBlockUser } from '../api/auth';
import { getMessages, replyToMessage } from '../api/messages';
import { getAuctions, setAuctionStatus } from '../api/auctions';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard({ showToast }) {
  const [tab,      setTab]      = useState('overview');
  const [listings, setListings] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [bids,     setBids]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListing, setNewListing] = useState({ make:'', model:'', year:'', vin:'', category:'sedan', mileage_km:'', fuel:'petrol', transmission:'automatic', condition:'good', damage:'None', description:'', starting_bid:'' });

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [l, u, b, m, a] = await Promise.all([
          getListings(), getAllUsers(), getPendingBids(), getMessages(), getAuctions()
        ]);
        setListings(Array.isArray(l) ? l : l.results || []);
        setUsers(Array.isArray(u) ? u : u.results || []);
        setBids(Array.isArray(b) ? b : b.results || []);
        setMessages(Array.isArray(m) ? m : m.results || []);
        setAuctions(Array.isArray(a) ? a : a.results || []);
      } catch (err) {
        showToast('Error loading data: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const handleApproveBid = async (id) => {
    try { await approveBid(id); setBids(bs => bs.map(b => b.id===id?{...b,status:'approved'}:b)); showToast('Bid approved!','success'); }
    catch(e) { showToast(e.message,'error'); }
  };
  const handleRejectBid = async (id) => {
    try { await rejectBid(id); setBids(bs => bs.map(b => b.id===id?{...b,status:'rejected'}:b)); showToast('Bid rejected.','warning'); }
    catch(e) { showToast(e.message,'error'); }
  };
  const handleToggleUser = async (id) => {
    try { const r = await toggleBlockUser(id); setUsers(us => us.map(u => u.id===id?{...u,is_blocked:r.is_blocked}:u)); }
    catch(e) { showToast(e.message,'error'); }
  };
  const handleDeleteListing = async (id) => {
    try { await deleteListing(id); setListings(ls => ls.filter(l => l.id!==id)); showToast('Listing deleted.','warning'); }
    catch(e) { showToast(e.message,'error'); }
  };
  const handleCreateListing = async () => {
    try {
      await createListing(newListing);
      showToast('Listing created!','success');
      setShowAddForm(false);
      const l = await getListings();
      setListings(Array.isArray(l)?l:l.results||[]);
    } catch(e) { showToast(e.message,'error'); }
  };

  const pending = bids.filter(b => b.status==='pending').length;

  return (
    <div style={S.page} className="fade-in">
      <div style={{ marginBottom:36, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ color:'#64748b', fontSize:14, fontFamily:'system-ui', marginBottom:4 }}>System Management</div>
          <h1 style={{ ...S.sectionTitle, marginBottom:0 }}>Admin Dashboard</h1>
        </div>
        <button onClick={() => setShowAddForm(true)} style={{ ...S.btn, ...S.btnPrimary }}>+ Add Listing</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:36 }}>
        {[
          ['Live Auctions', auctions.filter(a=>a.status==='live').length, '#22c55e'],
          ['Total Listings', listings.length, '#3b82f6'],
          ['Pending Bids', pending, '#f59e0b'],
          ['Users', users.length, '#a855f7'],
          ['Unread Messages', messages.filter(m=>!m.is_read).length, '#ef4444'],
        ].map(([l,v,c]) => (
          <div key={l} style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:12, padding:'20px 22px' }}>
            <div style={{ fontSize:11, color:'#64748b', fontFamily:'system-ui', fontWeight:700, marginBottom:8, letterSpacing:1 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:30, fontWeight:700, color:c, fontFamily:'system-ui' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', marginBottom:28 }}>
        {['overview','listings','bids','users','messages'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:tab===t?'2px solid #f59e0b':'2px solid transparent', padding:'12px 22px', color:tab===t?'#f59e0b':'#64748b', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'system-ui', letterSpacing:0.5, display:'flex', alignItems:'center', gap:7 }}>
            {t.toUpperCase()}
            {t==='bids' && pending>0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:11}}>{pending}</span>}
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
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Pending Bid Approvals</h3>
            {bids.filter(b=>b.status==='pending').length===0
              ? <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'30px 0'}}>All bids reviewed ✓</div>
              : bids.filter(b=>b.status==='pending').slice(0,4).map(bid => (
                <div key={bid.id} style={{padding:'14px 0',borderBottom:'1px solid #1e293b22'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontFamily:'system-ui',fontWeight:600}}>{bid.auction}</div>
                      <div style={{fontSize:12,color:'#64748b',fontFamily:'system-ui',marginTop:3}}>@{bid.bidder_name} · {new Date(bid.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                    <div style={{fontSize:20,fontWeight:700,color:'#f59e0b',fontFamily:'system-ui'}}>€{Number(bid.amount).toLocaleString()}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>handleApproveBid(bid.id)} style={{...S.btn,...S.btnSuccess,padding:'6px 14px',fontSize:12}}>✓ Approve</button>
                    <button onClick={()=>handleRejectBid(bid.id)} style={{...S.btn,...S.btnDanger,padding:'6px 14px',fontSize:12}}>✕ Reject</button>
                  </div>
                </div>
              ))
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
                  <td style={S.td}><button onClick={()=>handleDeleteListing(l.id)} style={{...S.btn,...S.btnDanger,padding:'5px 12px',fontSize:12}}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab==='bids' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:20}}>Bid Management</h3>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Auction</th><th style={S.th}>Bidder</th><th style={S.th}>Amount</th><th style={S.th}>Time</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>
              {bids.map(bid => (
                <tr key={bid.id}>
                  <td style={{...S.td,fontWeight:600}}>Auction #{bid.auction}</td>
                  <td style={{...S.td,color:'#94a3b8'}}>@{bid.bidder_name}</td>
                  <td style={{...S.td,color:'#f59e0b',fontWeight:700,fontFamily:'system-ui'}}>€{Number(bid.amount).toLocaleString()}</td>
                  <td style={{...S.td,color:'#64748b'}}>{new Date(bid.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                  <td style={S.td}>
                    {bid.status==='pending' && <span style={{color:'#f59e0b',fontSize:12,fontWeight:700}}>PENDING</span>}
                    {bid.status==='approved' && <span style={{color:'#22c55e',fontSize:12,fontWeight:700}}>APPROVED ✓</span>}
                    {bid.status==='rejected' && <span style={{color:'#ef4444',fontSize:12,fontWeight:700}}>REJECTED</span>}
                  </td>
                  <td style={S.td}>
                    {bid.status==='pending' && (
                      <div style={{display:'flex',gap:7}}>
                        <button onClick={()=>handleApproveBid(bid.id)} style={{...S.btn,...S.btnSuccess,padding:'5px 12px',fontSize:12}}>✓ Approve</button>
                        <button onClick={()=>handleRejectBid(bid.id)} style={{...S.btn,...S.btnDanger,padding:'5px 12px',fontSize:12}}>✕ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    <button onClick={()=>handleToggleUser(u.id)} style={{...S.btn,...(u.is_blocked?S.btnSuccess:S.btnDanger),padding:'5px 12px',fontSize:12}}>
                      {u.is_blocked?'Unblock':'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab==='messages' && (
        <div className="fade-in">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:20}}>User Messages ({messages.length})</h3>
          {messages.map((msg,i) => (
            <div key={i} style={{background:'#0d1117',border:msg.is_read?'1px solid #1e293b':'1px solid #f59e0b33',borderRadius:11,padding:'20px 24px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  {!msg.is_read && <div style={{width:8,height:8,borderRadius:'50%',background:'#f59e0b'}}/>}
                  <span style={{fontWeight:700,fontSize:15,fontFamily:'system-ui'}}>@{msg.sender_name}</span>
                  {msg.subject && <span style={{color:'#64748b',fontSize:13,fontFamily:'system-ui'}}>— {msg.subject}</span>}
                </div>
                <span style={{color:'#64748b',fontSize:13,fontFamily:'system-ui'}}>{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{color:'#94a3b8',fontFamily:'system-ui',fontSize:14,marginBottom:14,lineHeight:1.6}}>{msg.body}</div>
              {msg.reply && <div style={{background:'#1e293b',borderRadius:8,padding:'10px 14px',fontSize:13,fontFamily:'system-ui',color:'#94a3b8',marginBottom:12}}>Reply sent: {msg.reply}</div>}
              {!msg.reply && <button onClick={()=>{ const r=prompt('Reply to this message:'); if(r) replyToMessage(msg.id,r).then(()=>showToast('Reply sent!','success')).catch(e=>showToast(e.message,'error')); }} style={{...S.btn,...S.btnGhost,fontSize:12,padding:'6px 16px'}}>Reply</button>}
            </div>
          ))}
          {messages.length===0 && <div style={{color:'#64748b',fontFamily:'system-ui',textAlign:'center',padding:'40px 0'}}>No messages yet</div>}
        </div>
      )}

      {showAddForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
          <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:18,padding:36,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
              <h3 style={{fontSize:20,fontWeight:700}}>Add New Listing</h3>
              <span onClick={()=>setShowAddForm(false)} style={{cursor:'pointer',color:'#64748b',fontSize:22}}>×</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              {[['Make','make','BMW'],['Model','model','5 Series'],['Year','year','2020'],['VIN','vin','WBA...'],['Mileage (km)','mileage_km','42000'],['Starting Bid (€)','starting_bid','18500']].map(([l,k,ph]) => (
                <div key={k}>
                  <label style={S.label}>{l}</label>
                  <input style={S.input} placeholder={ph} value={newListing[k]||''} onChange={e=>setNewListing(p=>({...p,[k]:e.target.value}))} />
                </div>
              ))}
              {[['fuel','Fuel',['petrol','diesel','hybrid','electric']],['transmission','Transmission',['manual','automatic','cvt']],['condition','Condition',['excellent','good','fair','poor']],['category','Category',['sedan','suv','hatchback','coupe','wagon']]].map(([k,l,opts]) => (
                <div key={k}>
                  <label style={S.label}>{l}</label>
                  <select style={S.input} value={newListing[k]} onChange={e=>setNewListing(p=>({...p,[k]:e.target.value}))}>
                    {opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{marginTop:14}}>
              <label style={S.label}>Damage Notes</label>
              <input style={S.input} placeholder="None" value={newListing.damage} onChange={e=>setNewListing(p=>({...p,damage:e.target.value}))} />
            </div>
            <div style={{marginTop:14}}>
              <label style={S.label}>Description</label>
              <textarea style={{...S.input,minHeight:80,resize:'vertical'}} placeholder="Vehicle description..." value={newListing.description} onChange={e=>setNewListing(p=>({...p,description:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:12,marginTop:22}}>
              <button onClick={()=>setShowAddForm(false)} style={{...S.btn,...S.btnGhost,flex:1}}>Cancel</button>
              <button onClick={handleCreateListing} style={{...S.btn,...S.btnPrimary,flex:2}}>Create Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
