import { useState, useEffect } from 'react';
import api from '../services/api';
import OrderModal from '../components/OrderModal';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { PlusCircle, Table as TableIcon, LayoutGrid, Search, X, Hash, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [isAddTableOpen, setAddTableOpen] = useState(false);
  const [tableCount, setTableCount] = useState('5');
  const [loading, setLoading] = useState(true);

  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load tables');
      setTables([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const openTable = (table) => {
    if (!table) return;
    setSelectedTable(table);
    setOrderModalOpen(true);
  };

  const initiateDeleteTable = (e, table) => {
    e.stopPropagation();
    if (!isOwner) return;
    setTableToDelete(table);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      await api.delete(`/tables/${tableToDelete.id}`);
      fetchTables();
      toast.success('Table removed successfully');
      setDeleteConfirmOpen(false);
      setTableToDelete(null);
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const addTables = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    const count = parseInt(tableCount);
    if (isNaN(count) || count <= 0) return toast.error('Enter valid count');
    
    const loadingToast = toast.loading('Calculating sequence holes...');
    try {
      const existingNums = new Set(tables.map(t => parseInt(t.table_number)).filter(n => !isNaN(n)));
      
      const newTableNumbers = [];
      let currentCheck = 1;
      
      while (newTableNumbers.length < count) {
        if (!existingNums.has(currentCheck)) {
          newTableNumbers.push(currentCheck.toString());
        }
        currentCheck++;
      }
      
      await api.post('/tables/batch', { tableNumbers: newTableNumbers });
      fetchTables();
      setAddTableOpen(false);
      toast.success(`${count} tables added (gaps filled first)!`, { id: loadingToast });
    } catch (err) {
      toast.error('Error adding tables', { id: loadingToast });
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #1e293b', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%', maxWidth: '1440px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutGrid style={{ color: '#0ea5e9' }} size={24} />
            Live Table Management
          </h2>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', top: '14px', left: '16px', color: '#475569' }} size={18} />
            <input
              type="text"
              placeholder="Search tables..."
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                border: '2px solid #1e293b',
                color: 'white',
                padding: '12px 16px 12px 48px',
                borderRadius: '16px',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setAddTableOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            <PlusCircle size={20} />
            Create New Tables
          </button>
        )}
      </div>

      {(tables || []).length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0f172a',
          borderRadius: '32px',
          border: '2px dashed #1e293b',
          textAlign: 'center'
        }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#1e293b', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <TableIcon size={40} style={{ color: '#334155' }} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 600, margin: 0 }}>No tables found in this hotel.</p>
          <button 
            onClick={() => setAddTableOpen(true)}
            style={{ color: '#0ea5e9', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px', fontSize: '16px', textDecoration: 'underline' }}>
            Setup Initial Floor Plan
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {tables.map((table) => {
            const tableNum = parseInt(table.table_number) || 0;
            return (
              <div
                key={table.id}
                onClick={() => openTable(table)}
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '32px',
                  padding: '32px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: table.active_order_id ? '2px solid rgba(244, 63, 94, 0.2)' : '2px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.backgroundColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#0f172a';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TABLE {tableNum}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     {isOwner && (
                        <button 
                          onClick={(e) => initiateDeleteTable(e, table)} 
                          style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                        >
                           <Trash2 size={14} />
                        </button>
                     )}
                     <div style={{
                       width: '12px',
                       height: '12px',
                       borderRadius: '50%',
                       backgroundColor: table.active_order_id ? '#f43f5e' : '#10b981',
                       boxShadow: table.active_order_id ? '0 0 12px #f43f5e' : '0 0 12px #10b981'
                     }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '48px', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.05em' }}>{table.table_number}</h3>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: table.active_order_id ? '#f43f5e' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {table.active_order_id ? 'OCCUPIED' : 'AVAILABLE'}
                  </span>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   {table.active_order_id ? (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, fontStyle: 'italic' }}>Ongoing Order</span>
                   ) : (
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Ready to serve</span>
                   )}
                   <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                      <PlusCircle size={18} style={{ color: '#475569' }} />
                   </div>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: table.active_order_id ? 'rgba(244, 63, 94, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                  filter: 'blur(30px)'
                }}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
           <div style={{
             width: '100%',
             maxWidth: '400px',
             backgroundColor: '#0f172a',
             borderRadius: '32px',
             border: '1px solid rgba(255, 255, 255, 0.1)',
             padding: '40px',
             boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 1)'
           }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>Add New Tables</h3>
                <button onClick={() => setAddTableOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={addTables} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Table Count</label>
                    <div style={{ position: 'relative' }}>
                       <Hash style={{ position: 'absolute', top: '15px', left: '16px', color: '#475569' }} size={18} />
                       <input 
                         type="number"
                         autoFocus
                         value={tableCount}
                         onChange={(e) => setTableCount(e.target.value)}
                         style={{ width: '100%', backgroundColor: '#020617', border: '2px solid #1e293b', color: 'white', padding: '14px 16px 14px 48px', borderRadius: '16px', outline: 'none', fontWeight: 900, fontSize: '18px' }}
                       />
                    </div>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0 4px', fontWeight: 600 }}>System will fill gaps in sequence first.</p>
                 </div>
                 <button type="submit" style={{ width: '100%', backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)' }}>
                    Add Sequential Tables
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Remove Position?"
        message={`Are you sure you want to permanently decommission Table ${tableToDelete?.table_number}? This record will be archived.`}
        onConfirm={confirmDeleteTable}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {isOrderModalOpen && (
        <OrderModal
          table={selectedTable}
          onClose={() => {
            setOrderModalOpen(false);
            fetchTables();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
