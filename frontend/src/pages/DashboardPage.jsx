import { useState, useEffect } from 'react';
import { S } from '../styles/theme';
import { getAuctions } from '../api/auctions';
import { getMe, updateMe } from '../api/auth';
import CarCard from '../components/CarCard';

export default function DashboardPage({ user, setPage, setSelectedCar, showToast }) {
  const [tab,     setTab]     = useState('overview');
  const [auctions, setAuctions] = useState([]);
  const [profile,  setProfile]  = useState({ first_name:'', last_name:'', email:'', phone:'', country:'Lithuania' });
  const [pwFields, setPwFields]  = useState({ current:'', new_:'', confirm:'' });
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getAuctions().then(d => setAuctions(d.results || [])).catch(() => {});
    getMe().then(me => setProfile({ first_name:me.first_name||'', last_name:me.last_name||'', email:me.email||'', phone:me.phone||'', country:me.country||'Lithuania' })).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try { await updateMe(profile); showToast('Profile updated!', 'success'); }
    catch(e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwFields.current) { showToast('Enter your current password.', 'error'); return; }
    if (!pwFields.new_)    { showToast('New password cannot be empty.', 'error'); return; }
    if (pwFields.new_ !== pwFields.confirm) { showToast('Passwords do not match.', 'error'); return; }
    setSaving(true);
    try {
      await updateMe({ current_password: pwFields.current, password: pwFields.new_ });
      setPwFields({ current:'', new_:'', confirm:'' });
      showToast('Password changed!', 'success');
    } catch(e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={S.page} className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:36 }}>
        <div>
          <div style={{ color:'#64748b', fontSize:14, fontFamily:'system-ui', marginBottom:4 }}>Welcome back,</div>
          <h1 style={{ ...S.sectionTitle, marginBottom:0 }}>{user.username || user.name}</h1>
        </div>
        <button onClick={() => setPage('auctions')} style={{ ...S.btn, ...S.btnOutline }}>Browse Auctions →</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:36 }}>
        {[['Active Bids','—','#f59e0b'],['Auctions Won','—','#22c55e'],['Total Spent','—','#3b82f6'],['Watchlist','—','#a855f7']].map(([label,value,color]) => (
          <div key={label} style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:13, padding:'24px 26px' }}>
            <div style={{ fontSize:11, color:'#64748b', fontFamily:'system-ui', fontWeight:700, marginBottom:10, letterSpacing:1 }}>{label.toUpperCase()}</div>
            <div style={{ fontSize:34, fontWeight:700, color, fontFamily:'system-ui' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', marginBottom:28 }}>
        {['overview','bids','profile'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', borderBottom:tab===t?'2px solid #f59e0b':'2px solid transparent', padding:'12px 22px', color:tab===t?'#f59e0b':'#64748b', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'system-ui', letterSpacing:0.5 }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <div className="fade-in">
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:18 }}>Recommended for You</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:18 }}>
            {auctions.filter(a => a.status==='live').slice(0,3).map(car => (
              <CarCard key={car.id} car={car} compact onClick={() => { setSelectedCar(car); setPage('carDetail'); }} />
            ))}
            {auctions.filter(a => a.status==='live').length===0 && (
              <div style={{ color:'#64748b', fontFamily:'system-ui', fontSize:14 }}>No live auctions at the moment.</div>
            )}
          </div>
        </div>
      )}

      {/* Bids */}
      {tab==='bids' && (
        <div className="fade-in">
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:18 }}>Bid History</h3>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Vehicle</th><th style={S.th}>Your Bid</th><th style={S.th}>Current Bid</th><th style={S.th}>Status</th>
            </tr></thead>
            <tbody>
              <tr><td colSpan={4} style={{ ...S.td, color:'#64748b', textAlign:'center' }}>No bid history yet.</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Profile */}
      {tab==='profile' && (
        <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}>
          <div style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:14, padding:28 }}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:22 }}>Edit Profile</h3>
            <div style={{ display:'grid', gap:16 }}>
              {[['First Name','first_name','text'],['Last Name','last_name','text'],['Email','email','email'],['Phone','phone','tel'],['Country','country','text']].map(([label,key,type]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} type={type} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]:e.target.value }))} />
                </div>
              ))}
            </div>
            <button onClick={handleSaveProfile} disabled={saving} style={{ ...S.btn, ...S.btnPrimary, marginTop:22, fontSize:14, padding:'11px 28px' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
          <div style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:14, padding:28 }}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:22 }}>Change Password</h3>
            <div style={{ display:'grid', gap:16 }}>
              {[['Current Password','current','Enter current password'],['New Password','new_','New password'],['Confirm Password','confirm','Repeat new password']].map(([label,key,ph]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} type="password" placeholder={ph} value={pwFields[key]} onChange={e => setPwFields(p => ({ ...p, [key]:e.target.value }))} />
                </div>
              ))}
            </div>
            <button onClick={handleChangePassword} disabled={saving} style={{ ...S.btn, ...S.btnPrimary, marginTop:22, fontSize:14, padding:'11px 28px' }}>
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
