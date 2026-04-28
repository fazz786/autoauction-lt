import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { S } from '../styles/theme';
import { createListing, uploadListingImage } from '../api/auctions';

const BLANK = {
  make:'', model:'', year:'', vin:'', category:'sedan', color:'',
  mileage_km:'', fuel:'petrol', transmission:'automatic',
  condition:'good', damage:'None', description:'', starting_bid:'', status:'active',
};

export default function AddListingPage({ onClose, onCreated, showToast }) {
  const [form,     setForm]     = useState(BLANK);
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [step,     setStep]     = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 10 - images.length);
    setImages(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    if (!form.make.trim())    return 'Make is required.';
    if (!form.model.trim())   return 'Model is required.';
    if (!form.year)           return 'Year is required.';
    if (!form.vin.trim())     return 'VIN is required.';
    if (!form.starting_bid || Number(form.starting_bid) <= 0) return 'Starting bid must be > 0.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { showToast(err, 'error'); return; }
    setSaving(true);
    try {
      const listing = await createListing({
        make: form.make, model: form.model, year: Number(form.year),
        vin: form.vin, category: form.category, color: form.color,
        mileage_km: Number(form.mileage_km) || 0,
        fuel: form.fuel, transmission: form.transmission,
        condition: form.condition, damage: form.damage || 'None',
        description: form.description,
        starting_bid: Number(form.starting_bid),
        status: form.status,
      });
      for (const file of images) {
        try { await uploadListingImage(listing.id, file); } catch (_) {}
      }
      showToast('Listing created! Add an auction from the Auctions tab.', 'success');
      onCreated();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    const err = validate();
    if (err) { showToast(err, 'error'); return; }
    setStep(2);
  };

  const inp = { ...S.input, fontSize: 14, padding: '10px 14px' };

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999, background: '#080a10',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        borderBottom: '1px solid #1e293b', background: '#0d1117', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onClose} style={{ ...S.btn, ...S.btnGhost, padding: '8px 16px', fontSize: 13 }}>← Back</button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add New Listing</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Details', 'Photos'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step === i+1 ? '#f59e0b' : step > i+1 ? '#22c55e' : '#1e293b',
                color: step >= i+1 ? '#000' : '#475569',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'system-ui', flexShrink: 0,
              }}>{step > i+1 ? '✓' : i+1}</div>
              <span style={{ fontSize: 13, fontFamily: 'system-ui', color: step === i+1 ? '#f1f5f9' : '#475569', whiteSpace: 'nowrap' }}>{label}</span>
              {i < 1 && <div style={{ width: 20, height: 1, background: '#1e293b', margin: '0 4px' }} />}
            </div>
          ))}
        </div>
        <button
          onClick={step === 1 ? nextStep : handleSubmit}
          disabled={saving}
          style={{ ...S.btn, ...S.btnPrimary, padding: '10px 28px', fontSize: 14 }}
        >
          {saving ? 'Creating…' : step === 1 ? 'Next →' : '✓ Create Listing'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>

        {/* Step 1: Details */}
        {step === 1 && (
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, padding: '28px 32px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 24 }}>Vehicle Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
              {[
                ['Make',         'make',       'text',   'BMW'],
                ['Model',        'model',      'text',   '5 Series'],
                ['Year',         'year',       'number', '2020'],
                ['VIN',          'vin',        'text',   'WBA53BH0XM7G80001'],
                ['Color',        'color',      'text',   'Jet Black'],
                ['Mileage (km)', 'mileage_km', 'number', '42000'],
              ].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input style={inp} type={type} placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 18 }}>
              {[
                ['fuel',         'Fuel',         ['petrol','diesel','hybrid','electric']],
                ['transmission', 'Transmission', ['manual','automatic','cvt']],
                ['condition',    'Condition',    ['excellent','good','fair','poor']],
                ['category',     'Category',     ['sedan','suv','hatchback','coupe','wagon','truck','motorcycle','other']],
                ['status',       'Status',       ['draft','active','archived']],
              ].map(([key, label, opts]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <select style={inp} value={form[key]} onChange={e => set(key, e.target.value)}>
                    {opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={S.label}>Starting Bid (€)</label>
                <input style={inp} type="number" placeholder="18500" value={form.starting_bid} onChange={e => set('starting_bid', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <label style={S.label}>Damage Notes</label>
              <input style={inp} placeholder="None" value={form.damage} onChange={e => set('damage', e.target.value)} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Description</label>
              <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} placeholder="Vehicle description…" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div>
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', margin: 0 }}>Vehicle Photos</h3>
                <span style={{ fontSize: 13, color: '#475569', fontFamily: 'system-ui' }}>{images.length} / 10</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', fontFamily: 'system-ui', marginBottom: 24 }}>
                First image becomes the cover. You can skip this step.
              </p>
              {images.length < 10 && (
                <div
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `2px dashed ${dragOver ? '#f59e0b' : '#1e293b'}`,
                    borderRadius: 14, padding: '48px 24px', textAlign: 'center',
                    cursor: 'pointer', marginBottom: 28, background: dragOver ? '#f59e0b08' : '#080a10',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop photos here or click to browse</div>
                  <div style={{ fontSize: 13, color: '#475569', fontFamily: 'system-ui' }}>JPG, PNG, WEBP · Up to {10 - images.length} more</div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
                </div>
              )}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#1e293b', boxShadow: i === 0 ? '0 0 0 2px #f59e0b' : 'none' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.8))', padding: '6px 10px' }}>
                          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, fontFamily: 'system-ui', letterSpacing: 1 }}>COVER</span>
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              {previews.length === 0 && (
                <div style={{ color: '#334155', fontFamily: 'system-ui', fontSize: 13, textAlign: 'center' }}>No photos yet — you can skip and create the listing.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 48px', height: 64,
        borderTop: '1px solid #1e293b', background: '#0d1117', flexShrink: 0,
      }}>
        <button onClick={step > 1 ? () => setStep(1) : onClose} style={{ ...S.btn, ...S.btnGhost, padding: '10px 24px' }}>
          {step > 1 ? '← Back' : 'Cancel'}
        </button>
        <div style={{ fontSize: 13, color: '#334155', fontFamily: 'system-ui' }}>Step {step} of 2</div>
        <button
          onClick={step === 1 ? nextStep : handleSubmit}
          disabled={saving}
          style={{ ...S.btn, ...S.btnPrimary, padding: '10px 32px', fontSize: 14 }}
        >
          {saving ? 'Creating…' : step === 1 ? 'Next →' : '✓ Create Listing'}
        </button>
      </div>
    </div>,
    document.body
  );
}
