import React from 'react';
import { Quote } from 'lucide-react';

const BizKimiz = () => {
    return (
        <div className="biz-kimiz-container fade-in">
            <div className="manifesto-card glass-panel">
                <Quote size={48} className="gold-text mb-6 mx-auto opacity-50" />
                <h1 className="page-title text-center mb-8">Biz Kimiz?</h1>

                <div className="manifesto-content">
                    <p>
                        Bizler, sıradanlığın gürültüsünden kaçanlarız. Gündüzleri herkes gibi yürür,
                        geceleri <span className="secret-word gold-text cursor-crosshair" title="Gizli bir geçit olabilir">kendi gerçeğimizi</span> inşa ederiz.
                    </p>

                    <p className="mt-6">
                        Sessizliğin bir güç olduğuna inanır, bilgiyi güçten ziyade bir <strong className="burgundy-text">sorumluluk</strong> olarak görürüz.
                        Cemiyet, bir kaçış değil, uyanıştır.
                    </p>

                    <blockquote className="kural-block glass-panel mt-8">
                        <h3 className="gold-text mb-4">Cemiyetin Üç Temel Sütunu</h3>
                        <ol>
                            <li><strong>Sorgula:</strong> Sana verilen gerçeği asla olduğu gibi kabul etme.</li>
                            <li><strong>Gizle:</strong> Değerli olan şey, herkesin görebileceği yerde durmaz.</li>
                            <li><strong>Paylaş:</strong> Işığı bulan, karanlıkta kalanlara yol göstermelidir.</li>
                        </ol>
                    </blockquote>

                    <div className="signature mt-12 text-right">
                        <p className="gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
                            - Kurucu Konsey
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        .biz-kimiz-container {
          min-height: calc(100vh - 4rem);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .manifesto-card {
          max-width: 800px;
          padding: 4rem;
          position: relative;
        }

        .manifesto-content p {
          font-size: 1.25rem;
          line-height: 1.8;
          text-align: justify;
        }

        .kural-block {
          padding: 2rem;
          border-left: 4px solid var(--color-burgundy);
          background: rgba(15, 23, 42, 0.4);
        }

        .kural-block ol {
          padding-left: 1.2rem;
          line-height: 1.8;
        }

        .kural-block li {
          margin-bottom: 0.5rem;
        }

        .signature {
          border-top: 1px solid rgba(197, 160, 89, 0.2);
          padding-top: 1rem;
          font-size: 1.3rem;
          font-style: italic;
        }

        .secret-word {
          transition: all 0.3s;
        }
        
        .secret-word:hover {
          text-shadow: 0 0 10px rgba(197, 160, 89, 0.8);
        }

        .cursor-crosshair { cursor: crosshair; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .opacity-50 { opacity: 0.5; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .mt-12 { margin-top: 3rem; }
      `}</style>
        </div>
    );
};

export default BizKimiz;
