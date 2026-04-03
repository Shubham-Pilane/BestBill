import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Plus, Utensils, Tag, IndianRupee, Layers, ListChecks, Trash2, Edit2, X, Save } from 'lucide-react';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemData, setEditItemData] = useState({});

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category_id: '',
    description: ''
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchData = async () => {
    try {
      const [catRes, itemsRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items')
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    } catch (err) {
      console.error('Menu load error:', err);
      toast.error('Failed to load menu');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/categories', { name: newCatName });
      setNewCatName('');
      fetchData();
      toast.success('Category successfully added!');
    } catch (err) {
      toast.error('Could not add category');
    }
  };

  const deleteCategory = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge Group?',
      message: 'This will permanently delete this group and all its menu items. This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/menu/categories/${id}`);
          fetchData();
          toast.success('Group purged');
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          toast.error('Purge failed');
        }
      }
    });
  };

  const saveCategoryUpdate = async (id) => {
    try {
      await api.put(`/menu/categories/${id}`, { name: editCatName });
      setEditingCatId(null);
      fetchData();
      toast.success('Category updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.category_id) return toast.error('Please assign a category');
    try {
      await api.post('/menu/items', newItem);
      setNewItem({ name: '', price: '', category_id: '', description: '' });
      fetchData();
      toast.success('Menu item successfully added!');
    } catch (err) {
      toast.error('Could not create item');
    }
  };

  const deleteItem = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Discard Dish?',
      message: 'Are you sure you want to remove this dish from your active menu?',
      onConfirm: async () => {
        try {
          await api.delete(`/menu/items/${id}`);
          fetchData();
          toast.success('Dish removed');
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) {
          toast.error('Removal failed');
        }
      }
    });
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditItemData(item);
  };

  const saveItemUpdate = async (id) => {
    try {
      await api.put(`/menu/items/${id}`, editItemData);
      setEditingItemId(null);
      fetchData();
      toast.success('Item details updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px', width: '100%', maxWidth: '1400px' }}>
      
      {/* Category Management Column */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Layers size={22} style={{ color: '#818cf8', margin: 'auto' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Groups</h2>
          </div>

          <form onSubmit={addCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Category Title</label>
              <div style={{ position: 'relative' }}>
                <Tag style={{ position: 'absolute', top: '14px', left: '16px', color: '#475569' }} size={16} />
                <input
                  type="text"
                  style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '12px 16px 12px 40px', borderRadius: '14px', outline: 'none', fontSize: '14px', fontWeight: 600 }}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Plus size={18} strokeWidth={3} /> Add
            </button>
          </form>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 950, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>Active Groups</h3>
            {(categories || []).map(cat => (
              <div key={cat.id} style={{ padding: '14px 16px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingCatId === cat.id ? (
                  <input
                    autoFocus
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveCategoryUpdate(cat.id)}
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', width: '100%' }}
                  />
                ) : (
                  <span style={{ textTransform: 'uppercase' }}>{cat.name}</span>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                   {editingCatId === cat.id ? (
                      <button onClick={() => saveCategoryUpdate(cat.id)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}><Save size={16} /></button>
                   ) : (
                      <button onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); }} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                   )}
                   <button onClick={() => deleteCategory(cat.id)} style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Management Column */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Utensils size={22} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Add To Live Menu</h2>
          </div>

          <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Dish Name</label>
              <input
                type="text"
                style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '14px 16px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 700 }}
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Price (₹)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee style={{ position: 'absolute', top: '15px', left: '16px', color: '#475569' }} size={16} />
                <input
                  type="number"
                  style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: '#10b981', padding: '14px 16px 14px 40px', borderRadius: '16px', outline: 'none', fontSize: '18px', fontWeight: 900 }}
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Category</label>
              <select
                style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '14px 16px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 700 }}
                value={newItem.category_id}
                onChange={(e) => setNewItem({...newItem, category_id: e.target.value})}
              >
                <option value="">Choose Alignment</option>
                {(categories || []).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Description</label>
              <input
                type="text"
                style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: '#94a3b8', padding: '14px 16px', borderRadius: '16px', outline: 'none', fontSize: '14px' }}
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              />
            </div>
            <button type="submit" style={{ gridColumn: 'span 2', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '18px', borderRadius: '20px', fontSize: '16px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Plus size={22} strokeWidth={4} /> Publish To Menu
            </button>
          </form>
        </div>

        {/* Master Menu View with Edit Capability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <ListChecks size={20} style={{ color: '#64748b' }} />
             <h3 style={{ fontSize: '14px', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Current Master Menu</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {(items || []).map(item => (
              <div key={item.id} style={{ backgroundColor: '#0f172a', border: editingItemId === item.id ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ flex: 1 }}>
                      {editingItemId === item.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <input value={editItemData.name} onChange={(e) => setEditItemData({...editItemData, name: e.target.value})} style={{ background: '#020617', border: '1px solid #1e293b', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '16px', fontWeight: 900 }} />
                           <input type="number" value={editItemData.price} onChange={(e) => setEditItemData({...editItemData, price: e.target.value})} style={{ background: '#020617', border: '1px solid #1e293b', color: '#10b981', padding: '4px 8px', borderRadius: '8px', fontSize: '16px', fontWeight: 900 }} />
                           <textarea value={editItemData.description} onChange={(e) => setEditItemData({...editItemData, description: e.target.value})} style={{ background: '#020617', border: '1px solid #1e293b', color: '#94a3b8', padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }} />
                        </div>
                      ) : (
                        <>
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>{item.category_name}</span>
                          <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '8px 0 4px', textTransform: 'uppercase' }}>{item.name}</h4>
                          <p style={{ color: '#475569', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>{item.description}</p>
                        </>
                      )}
                   </div>
                   {!editingItemId && <span style={{ fontSize: '20px', fontWeight: 1000, color: 'white' }}>₹{item.price}</span>}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
                   {editingItemId === item.id ? (
                      <>
                        <button onClick={() => setEditingItemId(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}><X size={16} /> Cancel</button>
                        <button onClick={() => saveItemUpdate(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}><Save size={16} /> Save Changes</button>
                      </>
                   ) : (
                      <>
                        <button onClick={() => startEditItem(item)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}><Edit2 size={18} /></button>
                        <button onClick={() => deleteItem(item.id)} style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}><Trash2 size={18} /></button>
                      </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default MenuManagement;
