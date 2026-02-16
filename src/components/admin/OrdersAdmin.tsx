import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShowroom } from '@/context/ShowroomContext';
import { toast } from 'sonner';
import { Phone, Trash2, AlertTriangle, Package, Clock, MapPin, MessageSquare } from 'lucide-react';

interface Order {
  id: string;
  full_name: string;
  phone: string;
  room_design_id: string | null;
  door_model_id: string | null;
  panel_count: number;
  comment: string | null;
  address: string | null;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: 'Yangi',
  contacted: "Bog'lanildi",
  in_progress: 'Jarayonda',
  completed: 'Tugallandi',
  cancelled: 'Bekor qilindi',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  in_progress: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const allStatuses = ['new', 'contacted', 'in_progress', 'completed', 'cancelled'];

export default function OrdersAdmin() {
  const { allWalls: walls, allDoors: doors } = useShowroom();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else toast.success(`Status: ${statusLabels[status]}`);
  };

  const deleteOrder = async () => {
    if (!deleteTarget) return;
    await supabase.from('orders').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Buyurtma o'chirildi");
  };

  const getWallName = (id: string | null) => walls.find(w => w.id === id)?.name || '—';
  const getDoorName = (id: string | null) => doors.find(d => d.id === id)?.name || '—';

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (loading) return <div className="text-center py-12 text-muted-foreground/50 font-body text-sm">Yuklanmoqda...</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl text-foreground">Buyurtmalar</h2>
          <span className="text-xs text-muted-foreground/50 bg-muted/20 px-2.5 py-1 rounded-full font-mono">{orders.length}</span>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-2 rounded-lg font-body text-xs transition-all duration-300 ${
            filterStatus === 'all' ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card/40 text-muted-foreground border border-border/30 hover:bg-card/60'
          }`}
        >
          Barchasi ({orders.length})
        </button>
        {allStatuses.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 rounded-lg font-body text-xs transition-all duration-300 ${
                filterStatus === s ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card/40 text-muted-foreground border border-border/30 hover:bg-card/60'
              }`}
            >
              {statusLabels[s]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/50 font-body">Buyurtmalar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="group bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-border/40 transition-all duration-300 hover:bg-card/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-body text-sm text-foreground font-medium">{order.full_name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.12em] font-body font-medium border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground/70 font-body">
                    <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#0088cc] transition-colors">
                      <Phone className="w-3 h-3" /> {order.phone}
                    </a>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString('uz-UZ')}
                    </span>
                    <span>🏠 {getWallName(order.room_design_id)}</span>
                    <span>🚪 {getDoorName(order.door_model_id)} · {order.panel_count} panel</span>
                    {order.address && (
                      <span className="inline-flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3 h-3" /> {order.address}
                      </span>
                    )}
                    {order.comment && (
                      <span className="inline-flex items-center gap-1.5 col-span-2">
                        <MessageSquare className="w-3 h-3" /> {order.comment}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/20">
                <div className="flex flex-wrap gap-1.5">
                  {allStatuses.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.id, s)}
                      disabled={order.status === s}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-body transition-all duration-200 ${
                        order.status === s
                          ? 'bg-gold/15 text-gold border border-gold/30'
                          : 'bg-card/40 text-muted-foreground/50 border border-border/20 hover:bg-card/60 hover:text-foreground/70'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setDeleteTarget(order)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-scale-in p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-display text-lg text-foreground mb-2">Buyurtmani o'chirish</h3>
            <p className="text-sm text-muted-foreground mb-6"><span className="text-foreground font-medium">"{deleteTarget.full_name}"</span> buyurtmasini o'chirmoqchimisiz?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">Bekor qilish</button>
              <button onClick={deleteOrder} className="px-5 py-2.5 rounded-lg font-body text-sm bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all duration-200">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
