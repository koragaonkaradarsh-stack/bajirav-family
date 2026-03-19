import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzm831FbM_I_2SbV35A-nsND108-mEEN0",
  authDomain: "bajirav-family.firebaseapp.com",
  projectId: "bajirav-family",
  storageBucket: "bajirav-family.firebasestorage.app",
  messagingSenderId: "259102055396",
  appId: "1:259102055396:web:f2262e044a3eb4434a85f1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');`;

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --cream: #FDF6EC; --warm-white: #FFFAF4; --amber: #D4863A; --amber-light: #F5C07A; --brown: #5C3D2E; --brown-light: #8B6347; --rose: #C9747A; --sage: #7A9E7E; --shadow: rgba(92,61,46,0.18); --paper: #FEF9F0; }
  body { background-color: var(--cream); font-family: 'Lato', sans-serif; color: var(--brown); min-height: 100vh; }
  .app { min-height: 100vh; background: var(--cream); }
  .header { background: var(--brown); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px var(--shadow); position: sticky; top: 0; z-index: 100; }
  .header-logo { font-family: 'Caveat', cursive; font-size: 2rem; font-weight: 700; color: var(--amber-light); }
  .header-sub { font-size: 0.72rem; color: rgba(245,192,122,0.65); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .member-badge { background: rgba(245,192,122,0.15); border: 1px solid rgba(245,192,122,0.35); border-radius: 40px; padding: 6px 16px; color: var(--amber-light); font-family: 'Caveat', cursive; font-size: 1rem; }
  .welcome-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .welcome-card { background: var(--paper); border-radius: 24px; padding: 52px 48px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px var(--shadow); text-align: center; border: 1px solid rgba(212,134,58,0.12); position: relative; overflow: hidden; }
  .welcome-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--amber), var(--rose), var(--sage)); }
  .welcome-emoji { font-size: 4rem; margin-bottom: 16px; display: block; }
  .welcome-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--brown); margin-bottom: 8px; }
  .welcome-desc { color: var(--brown-light); font-size: 0.95rem; line-height: 1.6; margin-bottom: 32px; }
  .name-input { width: 100%; padding: 14px 20px; border: 2px solid rgba(212,134,58,0.25); border-radius: 12px; font-size: 1rem; background: var(--warm-white); color: var(--brown); outline: none; transition: border-color 0.2s; margin-bottom: 16px; font-family: 'Lato', sans-serif; }
  .name-input:focus { border-color: var(--amber); }
  .name-input::placeholder { color: rgba(92,61,46,0.35); }
  .btn-primary { width: 100%; padding: 14px; background: var(--amber); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: 'Lato', sans-serif; }
  .btn-primary:disabled { opacity: 0.5; }
  .main { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
  .upload-section { background: var(--paper); border-radius: 20px; padding: 28px 32px; margin-bottom: 36px; border: 1px solid rgba(212,134,58,0.12); box-shadow: 0 4px 20px rgba(92,61,46,0.07); }
  .section-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--brown); margin-bottom: 20px; }
  .drop-zone { border: 2.5px dashed rgba(212,134,58,0.4); border-radius: 16px; padding: 40px 24px; text-align: center; cursor: pointer; background: rgba(245,192,122,0.05); position: relative; }
  .drop-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .drop-icon { font-size: 2.5rem; margin-bottom: 12px; display: block; }
  .drop-text { color: var(--brown); font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
  .drop-sub { color: var(--brown-light); font-size: 0.82rem; }
  .preview-strip { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
  .preview-item { position: relative; width: 90px; height: 90px; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px var(--shadow); border: 3px solid white; }
  .preview-item img { width: 100%; height: 100%; object-fit: cover; }
  .preview-remove { position: absolute; top: 3px; right: 3px; background: rgba(92,61,46,0.85); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; }
  .caption-input { width: 100%; padding: 12px 16px; border: 2px solid rgba(212,134,58,0.2); border-radius: 10px; font-size: 0.9rem; color: var(--brown); background: var(--warm-white); outline: none; margin-top: 16px; resize: none; font-family: 'Lato', sans-serif; }
  .upload-btn { margin-top: 16px; padding: 12px 32px; background: var(--amber); color: white; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: 'Lato', sans-serif; }
  .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .gallery-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .gallery-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--brown); }
  .photo-count { background: var(--amber); color: white; border-radius: 20px; padding: 4px 14px; font-size: 0.82rem; font-weight: 700; }
  .photo-grid { columns: 3; column-gap: 20px; }
  @media (max-width: 700px) { .photo-grid { columns: 2; } }
  @media (max-width: 440px) { .photo-grid { columns: 1; } }
  .polaroid { background: white; border-radius: 4px; padding: 10px 10px 40px; box-shadow: 0 6px 24px rgba(92,61,46,0.14); margin-bottom: 20px; break-inside: avoid; cursor: pointer; transition: transform 0.25s; }
  .polaroid:nth-child(odd) { transform: rotate(-1.2deg); }
  .polaroid:nth-child(even) { transform: rotate(0.8deg); }
  .polaroid:hover { transform: rotate(0deg) scale(1.03); }
  .polaroid img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .polaroid-bottom { padding: 8px 4px 0; text-align: center; }
  .polaroid-caption { font-family: 'Caveat', cursive; font-size: 1.05rem; color: var(--brown); }
  .polaroid-by { font-family: 'Caveat', cursive; font-size: 0.95rem; color: var(--rose); font-weight: 600; }
  .polaroid-meta { font-size: 0.7rem; color: var(--brown-light); opacity: 0.7; }
  .empty-state { text-align: center; padding: 60px 24px; color: var(--brown-light); }
  .empty-icon { font-size: 3.5rem; margin-bottom: 16px; display: block; opacity: 0.5; }
  .empty-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 8px; }
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--brown); color: var(--amber-light); padding: 14px 22px; border-radius: 12px; font-family: 'Caveat', cursive; font-size: 1.1rem; box-shadow: 0 8px 24px var(--shadow); z-index: 9999; }
  .lightbox { position: fixed; inset: 0; background: rgba(30,18,10,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .lightbox-inner { background: white; border-radius: 12px; padding: 16px 16px 28px; max-width: 600px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; position: relative; }
  .lightbox-img { width: 100%; max-height: 70vh; object-fit: contain; border-radius: 6px; }
  .lightbox-close { position: absolute; top: -16px; right: -16px; background: var(--brown); color: var(--amber-light); border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 18px; cursor: pointer; }
  .lightbox-info { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(212,134,58,0.15); }
  .loading-spinner { text-align: center; padding: 40px; color: var(--brown-light); font-family: 'Caveat', cursive; font-size: 1.3rem; }
  .footer { text-align: center; padding: 32px 0 16px; opacity: 0.55; }
  .live-dot { width: 7px; height: 7px; background: var(--sage); border-radius: 50%; animation: pulse 1.5s infinite; display: inline-block; margin-right: 4px; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
`;

async function compressImage(file: File, maxWidth = 600, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function timeAgo(ts: any) {
  if (!ts) return 'just now';
  const diff = (Date.now() - ts.toMillis()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

interface Photo { id: string; src: string; caption: string; uploader: string; ts: any; }

export default function App() {
  const [memberName, setMemberName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previews, setPreviews] = useState<{id: number; src: string}[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const q = query(collection(db, 'bajirav-photos'), orderBy('ts', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      setPhotos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bajirav-member-name');
    if (saved) setMemberName(saved);
  }, []);

  const handleJoin = () => {
    if (!nameInput.trim()) return;
    localStorage.setItem('bajirav-member-name', nameInput.trim());
    setMemberName(nameInput.trim());
  };

  const handleFiles = async (files: File[]) => {
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const compressed = await compressImage(f);
      setPreviews(p => [...p, { id: Date.now() + Math.random(), src: compressed }]);
    }
  };

  const handleUpload = async () => {
    if (!previews.length) return;
    setUploading(true);
    try {
      for (const preview of previews) {
        await addDoc(collection(db, 'bajirav-photos'), {
          src: preview.src,
          caption: caption.trim(),
          uploader: memberName,
          ts: serverTimestamp()
        });
      }
      setPreviews([]); setCaption('');
      showToast(`✨ ${previews.length} photo${previews.length > 1 ? 's' : ''} shared with family!`);
    } catch {
      showToast('❌ Upload failed. Try smaller images.');
    }
    setUploading(false);
  };

  if (!memberName) return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app welcome-screen">
        <div className="welcome-card">
          <span className="welcome-emoji">👨‍👩‍👧‍👦</span>
          <h1 className="welcome-title">Bajirav Family</h1>
          <p className="welcome-desc">A shared album for the Bajirav family. Upload photos and everyone can see them instantly!</p>
          <input className="name-input" placeholder="Your name (e.g. Mom, Arjun, Dadi...)" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <button className="btn-primary" onClick={handleJoin} disabled={!nameInput.trim()}>Open Family Album →</button>
          <div style={{marginTop:24,fontSize:'0.75rem',opacity:0.5,letterSpacing:1,textTransform:'uppercase'}}>Created by Adarsh C Koragaonkar</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-logo">📷 Bajirav Family</div>
            <div className="header-sub">Created by Adarsh C Koragaonkar</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span><span className="live-dot"></span>LIVE</span>
            <div className="member-badge">👤 {memberName}</div>
          </div>
        </div>

        <div className="main">
          <div className="upload-section">
            <div className="section-title">📤 Share a Memory</div>
            <div className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFiles(Array.from(e.dataTransfer.files));}}>
              <input type="file" accept="image/*" multiple ref={fileRef} onChange={e=>handleFiles(Array.from(e.target.files||[]))} />
              <span className="drop-icon">🖼️</span>
              <div className="drop-text">Tap or drag photos here</div>
              <div className="drop-sub">Supports JPG, PNG • Multiple photos okay</div>
            </div>
            {previews.length > 0 && (
              <>
                <div className="preview-strip">
                  {previews.map(p => (
                    <div className="preview-item" key={p.id}>
                      <img src={p.src} alt="" />
                      <button className="preview-remove" onClick={()=>setPreviews(ps=>ps.filter(x=>x.id!==p.id))}>✕</button>
                    </div>
                  ))}
                </div>
                <textarea className="caption-input" placeholder="Add a caption... (optional)" rows={2} value={caption} onChange={e=>setCaption(e.target.value)} />
                <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
                  {uploading ? '⏳ Saving...' : `📤 Share ${previews.length} Photo${previews.length>1?'s':''} with Family`}
                </button>
              </>
            )}
          </div>

          <div className="gallery-header">
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="gallery-title">Bajirav Album</div>
              {photos.length > 0 && <span className="photo-count">{photos.length} photos</span>}
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading family memories... 💛</div>
          ) : photos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📷</span>
              <div className="empty-title">No photos yet!</div>
              <div>Be the first to share a memory 💛</div>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map(p => (
                <div className="polaroid" key={p.id} onClick={()=>setLightbox(p)}>
                  <img src={p.src} alt={p.caption} loading="lazy" />
                  <div className="polaroid-bottom">
                    {p.caption && <div className="polaroid-caption">{p.caption}</div>}
                    <div className="polaroid-by">— {p.uploader}</div>
                    <div className="polaroid-meta">{timeAgo(p.ts)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="footer">
            <div style={{fontFamily:"'Caveat',cursive",fontSize:'1.05rem',color:'var(--brown)'}}>💛 Made with love for the Bajirav Family</div>
            <div style={{fontSize:'0.75rem',color:'var(--brown-light)',marginTop:4,letterSpacing:1,textTransform:'uppercase'}}>Created by Adarsh C Koragaonkar</div>
          </div>
        </div>

        {lightbox && (
          <div className="lightbox" onClick={()=>setLightbox(null)}>
            <div className="lightbox-inner" onClick={e=>e.stopPropagation()}>
              <button className="lightbox-close" onClick={()=>setLightbox(null)}>✕</button>
              <img className="lightbox-img" src={lightbox.src} alt={lightbox.caption} />
              <div className="lightbox-info">
                {lightbox.caption && <div style={{fontFamily:"'Caveat',cursive",fontSize:'1.3rem',color:'var(--brown)',marginBottom:4}}>{lightbox.caption}</div>}
                <div style={{fontFamily:"'Caveat',cursive",fontSize:'1rem',color:'var(--rose)'}}>Shared by {lightbox.uploader} · {timeAgo(lightbox.ts)}</div>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}