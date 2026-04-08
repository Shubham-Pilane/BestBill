import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { PlusCircle, Bed, LayoutGrid, Search, X, Hash, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Lodging = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRoomOpen, setAddRoomOpen] = useState(false);
  const [roomConfigs, setRoomConfigs] = useState([{ floor: 'Floor 1', count: '10' }]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editData, setEditData] = useState({ room_number: '', room_name: '', floor: 'Floor 1', status: 'available' });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const addRoomsBatch = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    
    const loadingToast = toast.loading('Establishing lodging infrastructure...');
    try {
      await api.post('/rooms/batch', { roomConfigs });
      fetchRooms();
      setAddRoomOpen(false);
      toast.success('Rooms added successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Error adding rooms', { id: loadingToast });
    }
  };

  const initiateEditRoom = (e, room) => {
    e.stopPropagation();
    setEditingRoom(room);
    setEditData({ 
        room_number: room.room_number, 
        room_name: room.room_name || room.room_number,
        floor: room.floor || 'Floor 1',
        status: room.status || 'available'
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/rooms/${editingRoom.id}`, editData);
      toast.success('Room details refined');
      setEditModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room');
    }
  };

  const deleteRoom = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room removed');
      fetchRooms();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const groupedRooms = (rooms || []).reduce((acc, room) => {
    const floor = room.floor || 'Floor 1';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const floorOrder = (name) => {
    if (name.startsWith('Floor ')) return parseInt(name.replace('Floor ', '')) || 99;
    return 200;
  };

  const floors = Object.keys(groupedRooms).sort((a, b) => floorOrder(a) - floorOrder(b));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #1e293b', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%', maxWidth: '1440px' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bed style={{ color: '#0ea5e9' }} size={24} />
            Lodging Control
          </h2>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', top: '14px', left: '16px', color: '#475569' }} size={18} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', backgroundColor: '#0f172a', border: '2px solid #1e293b', color: 'white', padding: '12px 16px 12px 48px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 600 }}
            />
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setAddRoomOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0ea5e9', color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', border: 'none', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)' }}
          >
            <PlusCircle size={20} />
            Setup New Rooms
          </button>
        )}
      </div>

      {floors.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', backgroundColor: '#0f172a', borderRadius: '32px', border: '2px dashed #1e293b', textAlign: 'center' }}>
          <Bed size={48} style={{ color: '#1e293b', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '18px', fontWeight: 600 }}>No rooms configured for this hotel.</p>
          <button onClick={() => setAddRoomOpen(true)} style={{ color: '#0ea5e9', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px', fontSize: '16px', textDecoration: 'underline' }}>Setup Lodging Layout</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {floors.map(floor => (
            <div key={floor} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{floor}</h2>
                  <div style={{ flex: 1, height: '2px', backgroundColor: '#1e293b' }}></div>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 800 }}>{groupedRooms[floor].length} ROOMS</span>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                  {groupedRooms[floor].filter(r => r.room_number.includes(searchQuery) || (r.room_name && r.room_name.toLowerCase().includes(searchQuery.toLowerCase()))).map((room) => (
                    <div
                      key={room.id}
                      style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', border: '2px solid rgba(14, 165, 233, 0.2)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>ROOM {room.room_number}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           <button onClick={(e) => initiateEditRoom(e, room)} style={{ color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '11px' }}>RENAME</button>
                           <button onClick={(e) => deleteRoom(e, room.id)} style={{ color: '#f43f5e', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: 0 }}>{room.room_name || room.room_number}</h3>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{room.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Batch Modal */}
      {isAddRoomOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Initialize Lodging</h3>
                <button onClick={() => setAddRoomOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={addRoomsBatch} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 {roomConfigs.map((config, index) => (
                    <div key={index} style={{ padding: '20px', backgroundColor: '#020617', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 900 }}>FLOOR</label>
                          <select 
                            value={config.floor} 
                            onChange={(e) => {
                                const newConfigs = [...roomConfigs];
                                newConfigs[index].floor = e.target.value;
                                setRoomConfigs(newConfigs);
                            }}
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', padding: '12px', borderRadius: '12px' }}
                          >
                             {[...Array(10)].map((_, i) => <option key={i+1} value={`Floor ${i+1}`}>Floor {i+1}</option>)}
                          </select>
                       </div>
                       <div>
                          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 900 }}>ROOM BATCH COUNT</label>
                          <input 
                            type="number" 
                            value={config.count}
                            onChange={(e) => {
                                const newConfigs = [...roomConfigs];
                                newConfigs[index].count = e.target.value;
                                setRoomConfigs(newConfigs);
                            }}
                            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 900 }} 
                          />
                       </div>
                    </div>
                 ))}
                 <button type="submit" style={{ width: '100%', backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>Deploy Rooms</button>
              </form>
           </div>
        </div>
      )}

      {/* Edit/Rename Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
           <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '24px' }}>Rename Room</h3>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Room Name/Label</label>
                    <input 
                      type="text" value={editData.room_name} 
                      onChange={(e) => setEditData({...editData, room_name: e.target.value})}
                      style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '14px', borderRadius: '16px', fontWeight: 800 }}
                    />
                 </div>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setEditModalOpen(false)} style={{ flex: 1, backgroundColor: '#1e293b', color: 'white', padding: '14px', borderRadius: '16px', border: 'none' }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, backgroundColor: '#0ea5e9', color: 'white', padding: '14px', borderRadius: '16px', border: 'none', fontWeight: 800 }}>Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Lodging;
