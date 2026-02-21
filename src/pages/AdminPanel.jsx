import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { ShieldAlert, Edit, Save, Trash2, Award, X as XIcon } from 'lucide-react';

const AdminPanel = () => {
    const { user, users, canAccess, updateUserAsAdmin, deleteUserAsAdmin, clearAllMessages, notify, customRanks, addCustomRank } = useClan();

    const [editingUserId, setEditingUserId] = useState(null);
    const [editData, setEditData] = useState({ xp: '', rank: '', badges: [] });
    const [newBadge, setNewBadge] = useState('');
    const [newRankName, setNewRankName] = useState('');

    if (!canAccess('Admin')) {
        return (
            <div className="admin-container fade-in text-center mt-12">
                <ShieldAlert size={64} className="burgundy-text mx-auto mb-4" />
                <h1 className="page-title text-red-500">Erişim Reddedildi</h1>
                <p className="muted-text">Bu karanlık bölgeye girmeye yetkin yok.</p>
            </div>
        );
    }

    const allUsersList = Object.values(users);

    const handleEdit = (u) => {
        setEditingUserId(u.nickname);
        setEditData({ xp: u.xp, rank: u.rank, badges: [...u.badges] });
        setNewBadge('');
    };

    const handleSave = (nickname) => {
        updateUserAsAdmin(nickname, {
            xp: parseInt(editData.xp) || 0,
            rank: editData.rank,
            badges: editData.badges
        });
        setEditingUserId(null);
        notify(`${nickname} için kayıtlar başarıyla güncellendi.`);
    };

    const handleClearChat = () => {
        if (window.confirm("Ana Salon'daki tüm geçmişi silmek istediğinize emin misiniz?")) {
            clearAllMessages();
            notify("Ana Salon geçmişi küle çevrildi.");
        }
    };

    const handleBanish = (nickname) => {
        if (window.confirm(`${nickname} cemiyetten kalıcı olarak aforoz edilsin mi?`)) {
            deleteUserAsAdmin(nickname);
        }
    };

    const handleAddBadge = () => {
        if (newBadge.trim() && !editData.badges.includes(newBadge.trim())) {
            setEditData(prev => ({ ...prev, badges: [...prev.badges, newBadge.trim()] }));
            setNewBadge('');
        }
    };

    const handleRemoveBadge = (badgeToRemove) => {
        setEditData(prev => ({ ...prev, badges: prev.badges.filter(b => b !== badgeToRemove) }));
    };

    const handleAddRank = async () => {
        if (newRankName.trim()) {
            const success = await addCustomRank(newRankName.trim());
            if (success) setNewRankName('');
        }
    };

    const RANKS = customRanks;

    return (
        <div className="admin-container fade-in">
            <div className="flex-between mb-8 pb-4 border-b">
                <div>
                    <h1 className="page-title mb-2 text-red-500"><Award className="inline mr-2" />Yönetim Meclisi</h1>
                    <p className="muted-text">Kaderleri tayin etme yetkisi.</p>
                </div>
                <button className="action-btn text-red-500 border border-red-500 px-4 py-2" onClick={handleClearChat}>
                    <Trash2 size={16} className="mr-2" /> Salon Geçmişini Sil
                </button>
            </div>

            <div className="glass-panel text-sm mb-4 flex-between">
                <p className="muted-text">Not: Değişiklikler Socket.io üzerinden tüm bağlantılara eş zamanlı dağıtılır.</p>
                {user.nickname === 'Excer' && (
                    <div className="flex-align gap-2">
                        <input
                            type="text"
                            className="styled-input"
                            placeholder="Yeni Rütbe Adı"
                            value={newRankName}
                            onChange={(e) => setNewRankName(e.target.value)}
                        />
                        <button className="action-btn gold-text border border-gold px-3" onClick={handleAddRank}>Rütbe Yarat</button>
                    </div>
                )}
            </div>

            <div className="glass-panel">
                <div className="table-responsive">
                    <table className="admin-table w-full">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Mevcut Rank</th>
                                <th>XP</th>
                                <th>Rozetler</th>
                                <th className="text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsersList.map(u => (
                                <tr key={u.nickname}>
                                    <td className="font-bold gold-text">
                                        <div className="flex-align">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt="avatar" className="tiny-avatar mr-2 rounded-full" />
                                            ) : (
                                                <div className="tiny-avatar-placeholder mr-2 rounded-full">{u.nickname.charAt(0)}</div>
                                            )}
                                            {u.nickname}
                                        </div>
                                    </td>
                                    <td>
                                        {editingUserId === u.nickname ? (
                                            <select
                                                className="styled-select"
                                                value={editData.rank}
                                                onChange={(e) => setEditData({ ...editData, rank: e.target.value })}
                                            >
                                                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`rank-badge rank-${u.rank.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {u.rank}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {editingUserId === u.nickname ? (
                                            <input
                                                type="number"
                                                className="styled-input w-24"
                                                value={editData.xp}
                                                onChange={(e) => setEditData({ ...editData, xp: e.target.value })}
                                            />
                                        ) : (
                                            <span>{u.xp}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingUserId === u.nickname ? (
                                            <div className="badge-editor">
                                                <div className="flex mb-2">
                                                    <input
                                                        type="text"
                                                        className="styled-input w-24 mr-2"
                                                        placeholder="Yeni Rozet"
                                                        value={newBadge}
                                                        onChange={(e) => setNewBadge(e.target.value)}
                                                    />
                                                    <button className="action-btn gold-text text-xs" onClick={handleAddBadge}>Ekle</button>
                                                </div>
                                                <div className="badges-list text-xs flex-wrap">
                                                    {editData.badges.map(b => (
                                                        <span key={b} className="badge inline-flex items-center gap-1">
                                                            {b} <XIcon size={12} className="cursor-pointer text-red-400" onClick={() => handleRemoveBadge(b)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="badges-list text-xs">
                                                {u.badges.map((b, idx) => <span key={idx} className="badge">{b}</span>)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        {editingUserId === u.nickname ? (
                                            <button className="action-btn text-green-400" onClick={() => handleSave(u.nickname)}>
                                                <Save size={18} />
                                            </button>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button className="action-btn gold-text" onClick={() => handleEdit(u)} title="Düzenle">
                                                    <Edit size={18} />
                                                </button>
                                                {u.nickname !== 'Excer' && u.nickname !== user.nickname && (
                                                    <button className="action-btn text-red-500" onClick={() => handleBanish(u.nickname)} title="Cemiyetten At">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .admin-container { max-width: 1000px; margin: 0 auto; }
                .text-red-500 { color: #ef4444; }
                .text-green-400 { color: #4ade80; }
                .border-b { border-bottom: 1px solid rgba(197, 160, 89, 0.2); }
                .w-full { width: 100%; }
                .w-24 { width: 6rem; }
                .text-right { text-align: right; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .rounded-full { border-radius: 9999px; }
                .flex-align { display: flex; align-items: center; }
                .flex { display: flex; }
                .flex-wrap { flex-wrap: wrap; }
                .mr-2 { margin-right: 0.5rem; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                .text-xs { font-size: 0.75rem; }
                .cursor-pointer { cursor: pointer; }
                .text-red-400 { color: #f87171; }
                .gap-1 { gap: 0.25rem; }
                .gap-2 { gap: 0.5rem; }

                .admin-table {
                    border-collapse: collapse;
                }
                
                .admin-table th, .admin-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .admin-table th {
                    color: var(--color-text-muted);
                    font-family: var(--font-heading);
                    font-weight: normal;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                }

                .admin-table tbody tr:hover {
                    background-color: rgba(197, 160, 89, 0.05);
                }

                .tiny-avatar, .tiny-avatar-placeholder {
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(197, 160, 89, 0.2);
                    border: 1px solid var(--color-gold);
                    font-size: 10px;
                    color: var(--color-gold);
                    object-fit: cover;
                }

                .styled-input, .styled-select {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(197, 160, 89, 0.3);
                    color: var(--color-text);
                    padding: 0.4rem 0.6rem;
                    border-radius: 4px;
                    outline: none;
                    font-family: var(--font-body);
                }

                .styled-input:focus, .styled-select:focus {
                    border-color: var(--color-gold);
                }
                
                .styled-select option {
                    background: var(--color-black);
                    color: var(--color-text);
                }

                .action-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: background 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;
