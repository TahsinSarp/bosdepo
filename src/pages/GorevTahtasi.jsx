import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

const GorevTahtasi = () => {
    const { addXp, notify } = useClan();

    const tasks = [
        "Bir üyeye anonim övgü bırak.",
        "24 saat boyunca sadece sembollerle konuş.",
        "Felsefi bir cümle yaz ve kaybol.",
        "Teoriler Odasında bir düşünce deneyine katıl.",
        "Bugün en az kullandığın kelimeyi 3 kez kullan."
    ];

    const [currentTask, setCurrentTask] = useState(tasks[0]);
    const [completed, setCompleted] = useState(false);

    const randomizeTask = () => {
        setCompleted(false);
        const randomIndex = Math.floor(Math.random() * tasks.length);
        setCurrentTask(tasks[randomIndex]);
    };

    const handleComplete = () => {
        setCompleted(true);
        addXp(20);
        notify('Görev Tamamlandı. +20 XP');
    };

    return (
        <div className="gorev-container fade-in">
            <div className="gorev-header">
                <h1 className="page-title">Görev Tahtası</h1>
                <p className="muted-text">Kaderini şekillendir.</p>
            </div>

            <div className="task-panel glass-panel">
                <h3 className="gold-text uppercase mb-4 tracking-widest text-sm">Güncel Görev</h3>

                <div className="task-content">
                    <p className={'task-text ' + (completed ? 'completed opacity-50' : '')}>
                        {currentTask}
                    </p>
                </div>

                <div className="task-actions mt-8">
                    <button className="btn-secondary" onClick={randomizeTask} disabled={completed}>
                        <RefreshCw size={16} /> Yeni Yol Seç
                    </button>
                    <button className="btn-primary" onClick={handleComplete} disabled={completed}>
                        <CheckCircle2 size={16} /> Görevi Kabul Et (Tamamla)
                    </button>
                </div>
            </div>

            <style>{`
        .gorev-container {
          min-height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gorev-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .task-panel {
          padding: 3rem;
          text-align: center;
          max-width: 600px;
          width: 100%;
          border: 1px solid rgba(197, 160, 89, 0.3);
          position: relative;
          overflow: hidden;
        }

        .task-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
        }

        .task-text {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          color: var(--color-text);
          line-height: 1.5;
          margin: 2rem 0;
          transition: all 0.3s;
        }

        .task-text.completed {
          text-decoration: line-through;
          color: var(--color-text-muted);
        }

        .task-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--color-text-muted);
          border: 1px solid var(--color-text-muted);
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: var(--color-text);
          color: var(--color-text);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(197, 160, 89, 0.1);
          color: var(--color-gold);
          border: 1px solid var(--color-gold);
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-gold);
          color: var(--color-black);
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .text-sm { font-size: 0.875rem; }
        .opacity-50 { opacity: 0.5; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-8 { margin-top: 2rem; }
      `}</style>
        </div >
    );
};

export default GorevTahtasi;
