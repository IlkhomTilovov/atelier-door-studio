import { useState } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, ShoppingBag, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderModal({ open, onClose }: Props) {
  const { state, getSelectedDoor, getSelectedWall } = useShowroom();
  const door = getSelectedDoor();
  const wall = getSelectedWall();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [comment, setComment] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const phoneValid = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone.replace(/\s+/g, ' ').trim());

  const formatPhone = (val: string) => {
    // Keep +998 prefix, only allow digits after
    let digits = val.replace(/[^\\d]/g, '');
    if (!digits.startsWith('998')) digits = '998' + digits.replace(/^998/, '');
    // Format: +998 XX XXX XX XX
    let formatted = '+998';
    const rest = digits.slice(3);
    if (rest.length > 0) formatted += ' ' + rest.slice(0, 2);
    if (rest.length > 2) formatted += ' ' + rest.slice(2, 5);
    if (rest.length > 5) formatted += ' ' + rest.slice(5, 7);
    if (rest.length > 7) formatted += ' ' + rest.slice(7, 9);
    return formatted;
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !phoneValid || cooldown) return;
    setSaving(true);
    try {
      const orderData = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        room_design_id: state.selectedWall || null,
        door_model_id: state.selectedDoor || null,
        panel_count: door?.panelCount || 2,
        comment: comment.trim() || null,
        address: address.trim() || null,
      };

      const { error } = await supabase.from('orders').insert(orderData);
      if (error) throw error;

      // Send telegram notification (fire and forget)
      sendTelegramNotification(orderData);

      setSuccess(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
      
      toast.success('Buyurtma qabul qilindi! ✓');
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const sendTelegramNotification = async (order: any) => {
    try {
      const { data: settings } = await supabase.from('app_settings').select('key, value');
      const token = settings?.find(s => s.key === 'telegram_bot_token')?.value;
      const chatId = settings?.find(s => s.key === 'telegram_chat_id')?.value;
      if (!token || !chatId) return;

      const text = `🆕 <b>YANGI BUYURTMA</b>\n\n👤 Ism: ${order.full_name}\n📞 Telefon: ${order.phone}\n🏠 Xona dizayni: ${wall?.name || '—'}\n🚪 Eshik: ${door?.name || '—'}\n📦 Panel: ${order.panel_count}\n📝 Izoh: ${order.comment || '—'}\n📍 Manzil: ${order.address || '—'}\n🕒 Sana: ${new Date().toLocaleString('uz-UZ')}`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    } catch {
      // Silent fail - order is already saved
    }
  };

  const handleClose = () => {
    if (success) {
      setFullName('');
      setPhone('+998 ');
      setComment('');
      setAddress('');
      setSuccess(false);
    }
    onClose();
  };

  if (!open) return null;

  const inputCls = "w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/30 transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose} />
      <div className="relative w-full max-w-md overflow-hidden animate-scale-in" style={{
        background: 'linear-gradient(135deg, hsl(220 20% 14% / 0.95), hsl(220 18% 12% / 0.98))',
        backdropFilter: 'blur(40px)',
        border: '1px solid hsl(40 60% 55% / 0.15)',
        borderRadius: '16px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px hsl(40 60% 55% / 0.05)',
      }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(40 55% 45%), hsl(40 65% 55%))' }}>
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Buyurtma berish</h2>
              <p className="text-[10px] text-muted-foreground/50 font-body">Ma'lumotlaringizni kiriting</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground/50 hover:text-foreground transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="px-6 pb-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(145 60% 40% / 0.2), hsl(145 60% 40% / 0.05))', border: '2px solid hsl(145 60% 40% / 0.3)' }}>
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Buyurtma qabul qilindi!</h3>
            <p className="text-sm text-muted-foreground/60 font-body">Tez orada siz bilan bog'lanamiz</p>
            <button onClick={handleClose} className="mt-6 px-8 py-2.5 rounded-xl font-body text-sm bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all duration-300">
              Yopish
            </button>
          </div>
        ) : (
          <>
            {/* Auto-filled info */}
            <div className="mx-6 mb-4 rounded-xl p-3 flex gap-4 text-xs font-body" style={{ background: 'hsl(40 60% 55% / 0.06)', border: '1px solid hsl(40 60% 55% / 0.1)' }}>
              <div className="flex-1">
                <span className="text-muted-foreground/40">Xona dizayni</span>
                <p className="text-gold/80 mt-0.5">{wall?.name || 'Tanlanmagan'}</p>
              </div>
              <div className="w-px" style={{ background: 'hsl(40 60% 55% / 0.15)' }} />
              <div className="flex-1">
                <span className="text-muted-foreground/40">Eshik modeli</span>
                <p className="text-gold/80 mt-0.5">{door?.name || 'Tanlanmagan'} · {door?.panelCount || 2}p</p>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-1.5">
                  Ism <span className="text-destructive/60">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="To'liq ismingiz"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-1.5">
                  Telefon <span className="text-destructive/60">*</span>
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="+998 90 123 45 67"
                  className={inputCls}
                  maxLength={17}
                />
                {phone.length > 5 && !phoneValid && (
                  <p className="text-[10px] text-destructive/70 font-body mt-1">To'liq raqam kiriting</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-1.5">Manzil</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Shahar, tuman, ko'cha..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-1.5">Izoh</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Qo'shimcha ma'lumot..."
                  className={inputCls + " resize-none h-16"}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 flex items-center justify-end gap-3">
              <button onClick={handleClose} className="px-5 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200">
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={!fullName.trim() || !phoneValid || saving || cooldown}
                className={`px-6 py-2.5 rounded-xl font-body text-sm tracking-wide transition-all duration-300 ${
                  fullName.trim() && phoneValid && !saving && !cooldown
                    ? 'text-primary-foreground shadow-[0_4px_20px_rgba(180,160,100,0.3)] hover:shadow-[0_6px_28px_rgba(180,160,100,0.4)] hover:-translate-y-0.5'
                    : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                }`}
                style={fullName.trim() && phoneValid && !saving && !cooldown ? {
                  background: 'linear-gradient(135deg, hsl(40 55% 42%), hsl(40 65% 55%))',
                } : undefined}
              >
                {saving ? 'Yuborilmoqda...' : cooldown ? 'Kutib turing...' : 'Buyurtma yuborish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
