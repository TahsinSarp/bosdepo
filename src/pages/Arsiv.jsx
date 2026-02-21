import React, { useState, useEffect } from 'react';
import { useClan, API_URL } from '../context/ClanContext';
import { Archive as ArchiveIcon, Lock, Image as ImageIcon, Send, Trash2 } from 'lucide-react';

const Arsiv = () => {
  const { user, canAccess } = useClan();

  const [archives, setArchives] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const canUpload = canAccess('Üstün'); // Only level 5 can upload

  React.useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch(`${API_URL}/archives`);
      const data = await res.json();
      setArchives(data);
    } catch (err) { console.error("Kayıtlar alınırken hata oluştu", err); }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImage) return;

    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('uploader', user.nickname);
    formData.append('archiveImage', newImage);

    try {
      const res = await fetch(`${API_URL}/archives`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newItem = await res.json();
        setArchives(prev => [newItem, ...prev]);
        setNewTitle('');
        setNewImage(null);
        setIsUploading(false);
      }
    } catch (err) { console.error("Arşiv mühürlenemedi", err) }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kaydı silmek istediğine emin misin? Bu işlem geri alınamaz.")) return;
    try {
      const res = await fetch(`${API_URL}/archives/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setArchives(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) { console.error("Kayıt silinemedi", err); }
  };

  return (
    <div className="arsiv-container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title mb-2">Arşiv</h1>
          <p className="muted-text">Geçmişin sessiz tanıkları.</p>
        </div>

        {canUpload ? (
          <button className="submit-btn" onClick={() => setIsUploading(!isUploading)}>
            {isUploading ? 'İptal' : 'Yeni Kayıt Ekle'}
          </button>
        ) : (
          <div className="restricted-badge">
            <Lock size={16} /> Parşömen Mühürlü (Sadece Üstün)
          </div>
        )}
      </div>

      {isUploading && (
        <form className="glass-panel upload-form fade-in mb-8" onSubmit={handleUpload}>
          <h3 className="gold-text mb-4">Yeni Görüntü Mühürle</h3>
          <input
            type="text"
            placeholder="Kayıt Başlığı"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="styled-input mb-4"
          />
          <div className="file-input-wrapper mb-4">
            <input type="file" accept="image/*" id="arsiv-upload" onChange={handleImageChange} />
            <label htmlFor="arsiv-upload" className="file-label">
              <ImageIcon size={20} /> {newImage ? 'Görsel Seçildi' : 'Sırrı Yükle (Görsel)'}
            </label>
          </div>
          {newImage && <p className="gold-text mb-4 text-sm">{newImage.name} seçildi.</p>}

          <button type="submit" className="submit-btn full-width" disabled={!newTitle || !newImage}>
            <Send size={18} className="mr-2" /> Arşive Ekle
          </button>
        </form>
      )}

      {archives.length === 0 ? (
        <div className="empty-state text-center mt-12">
          <ArchiveIcon size={64} className="gold-text opacity-50 mb-4" />
          <h3 className="gold-text">Arşiv Boş</h3>
          <p className="muted-text">Henüz tarihe kazınmış bir anı yok.</p>
        </div>
      ) : (
        <div className="arsiv-grid">
          {archives.map(item => (
            <div key={item.id} className="detail-card glass-panel arsiv-card">
              <div className="arsiv-icon"><ImageIcon size={24} /></div>
              <div className="arsiv-info">
                <div className="flex-between">
                  <h3 className="gold-text mb-2">{item.title}</h3>
                  {canAccess('Admin') && (
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="arsiv-meta mb-4">
                  <span>Ekleyen: {item.uploader}</span>
                  <span>{new Date(item.dateAdded).toLocaleDateString('tr-TR')}</span>
                </div>
                {item.imageUrl && (
                  <div className="arsiv-image-container cursor-pointer" onClick={() => setSelectedImage(item.imageUrl)}>
                    <img src={item.imageUrl} alt={item.title} className="arsiv-image-thumbnail" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="lightbox-overlay fade-in" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content">
            <img src={selectedImage} alt="Full Resolution" className="lightbox-image" />
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>Kapat</button>
          </div>
        </div>
      )}

      <style>{`
        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .restricted-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(255, 0, 0, 0.1);
          color: var(--color-red);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          font-size: 0.9rem;
          border: 1px solid rgba(255, 0, 0, 0.2);
        }

        .upload-form {
          padding: 2rem;
          border-radius: var(--border-radius);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .styled-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(0, 0, 0, 0.3);
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .styled-input:focus {
          outline: none;
          border-color: var(--color-gold);
        }

        .file-input-wrapper {
          width: 100%;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .file-input-wrapper input[type=file] {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem 1rem;
          border-radius: var(--border-radius);
          background-color: var(--color-dark-alt);
          color: var(--color-gold);
          cursor: pointer;
          border: 1px solid var(--color-gold-faded);
          transition: background-color 0.3s, border-color 0.3s;
          width: 100%;
        }

        .file-label:hover {
          background-color: rgba(197, 160, 89, 0.1);
          border-color: var(--color-gold);
        }

        .upload-preview {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.8rem 1.5rem;
          border-radius: var(--border-radius);
          background-color: var(--color-gold);
          color: var(--color-dark);
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }

        .submit-btn:hover {
          background-color: var(--color-gold-dark);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          background-color: var(--color-dark-alt);
          color: var(--color-text-muted);
          cursor: not-allowed;
          transform: none;
        }

        .empty-state {
          color: var(--color-text-muted);
        }

        .arsiv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .arsiv-image-container {
            width: 100%;
            height: 200px;
            overflow: hidden;
            border-radius: var(--border-radius);
            margin-top: 1rem;
            border: 1px solid rgba(197, 160, 89, 0.2);
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .arsiv-image-container:hover {
            transform: scale(1.02);
            box-shadow: 0 0 15px rgba(197, 160, 89, 0.3);
        }

        .arsiv-image-thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .lightbox-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            display: flex;
            align-items: center; justify-content: center;
            padding: 2rem;
            backdrop-filter: blur(5px);
        }

        .lightbox-content {
            max-width: 90vw; max-height: 90vh;
            position: relative;
        }

        .lightbox-image {
            max-width: 100%;
            max-height: 90vh;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0,0,0,0.8);
            border: 1px solid rgba(197, 160, 89, 0.4);
        }

        .lightbox-close {
            position: absolute;
            top: -40px; right: 0;
            background: transparent; color: var(--color-gold);
            border: none; font-size: 1.2rem; cursor: pointer;
            font-family: var(--font-heading);
        }
        .lightbox-close:hover { color: #fff; }

        .delete-btn {
          background: transparent;
          border: none;
          color: var(--color-red);
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 0.2rem;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .doc-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          transition: transform 0.3s;
        }

        .doc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(197, 160, 89, 0.2);
          border-color: rgba(197, 160, 89, 0.4);
        }

        .cursor-pointer { cursor: pointer; }

        .doc-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .doc-info h3 {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .doc-meta {
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          gap: 0.2rem;
        }

        .doc-meta strong { color: var(--color-gold); font-weight: normal; }
      `}</style>
    </div>
  );
};

export default Arsiv;
