import React from 'react';
import { useClan } from '../context/ClanContext';
import { Lock } from 'lucide-react';

const SessizOda = () => {
    const { canAccess } = useClan();

    // "Sessiz Oda" requires at least 'Part Lead' rank
    const hasAccess = canAccess('Part Lead');

    return (
        <div className="sessiz-oda-container fade-in">
            {!hasAccess ? (
                <div className="locked-state glass-panel">
                    <Lock size={64} className="gold-text mb-4" />
                    <h1 className="page-title">Mühürlü Kapı</h1>
                    <p className="muted-text text-xl">
                        Sadece "Part Lead" ve üzeri rütbeliler Sessiz Oda'ya girebilir.
                        <br /><br />
                        Henüz yeterince sessizleşmedin.
                    </p>
                </div>
            ) : (
                <div className="unlocked-state">
                    <h1 className="page-title text-center mb-8">Sessiz Oda</h1>
                    <div className="glass-panel p-8 text-center">
                        <p className="gold-text" style={{ fontStyle: 'italic', fontSize: '1.2rem', lineHeight: '2' }}>
                            "Burada kelimeler değil, niyetler konuşur. <br />
                            Saklanan sırlar zamanı gelince açığa çıkar."
                        </p>
                        <div className="mt-8 border-t border-gold opacity-30 pt-8" />
                        <p className="muted-text mt-8">
                            [GİZLİ İÇERİK: Planlama Masası] <br />
                            Yakında burası büyük hedeflerin tartışıldığı bir meclise dönüşecek.
                        </p>
                    </div>
                </div>
            )}

            <style>{`
        .sessiz-oda-container {
          min-height: calc(100vh - 4rem);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .locked-state {
          padding: 4rem;
          text-align: center;
          max-width: 600px;
          border: 1px solid var(--color-burgundy);
          box-shadow: 0 0 30px rgba(89, 10, 24, 0.3);
        }

        .locked-state .page-title {
          color: var(--color-burgundy-light);
          margin-bottom: 2rem;
        }

        .unlocked-state {
          width: 100%;
          max-width: 800px;
        }

        .border-gold { border-color: var(--color-gold); }
        .text-center { text-align: center; }
        .text-xl { font-size: 1.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-8 { margin-top: 2rem; }
        .p-8 { padding: 2rem; }
        .pt-8 { padding-top: 2rem; }
        .opacity-30 { opacity: 0.3; }
      `}</style>
        </div>
    );
};

export default SessizOda;
