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
    let digits = val.replace(/[^\d]/g, '');
    if (!digits.startsWith('998')) digits = '998' + digits.replace(/^998/, '');
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
      // Silent fail
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

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-body text-sm text-foreground placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[hsl(40,60%,55%)]/40 focus:border-[hsl(40,60%,55%)]/30 transition-all duration-200";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, hsl(220 20% 14% / 0.97), hsl(220 18% 11% / 0.99))',
          backdropFilter: 'blur(40px)',
          border: '1px solid hsl(40 60% 55% / 0.12)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.5), 0 0 0 1px hsl(40 60% 55% / 0.04)',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'hsl(40 30% 50% / 0.3)' }} />
        </div>

        {/* Header — fixed */}
        <div className="flex-shrink-0 px-5 pt-3 sm:pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(40 55% 45%), hsl(40 65% 55%))' }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: 'hsl(220 20% 10%)' }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Buyurtma berish</h2>
              <p className="text-[10px] text-muted-foreground/50 font-body">Ma'lumotlaringizni kiriting</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground/50 hover:text-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 text-center">
            <div
              className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(145 60% 40% / 0.15), hsl(145 60% 40% / 0.05))',
                border: '2px solid hsl(145 60% 40% / 0.3)',
              }}
            >
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Buyurtma qabul qilindi!</h3>
            <p className="text-sm text-muted-foreground/60 font-body mb-6">Tez orada siz bilan bog'lanamiz</p>
            <button
              onClick={handleClose}
              className="px-8 py-2.5 rounded-xl font-body text-sm transition-all duration-300"
              style={{
                background: 'hsl(40 60% 55% / 0.12)',
                color: 'hsl(40 60% 55%)',
                border: '1px solid hsl(40 60% 55% / 0.25)',
              }}
            >
              Yopish
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Auto-filled info */}
              <div
                className="mb-5 rounded-xl p-3.5 flex gap-4 text-xs font-body"
                style={{
                  background: 'hsl(40 60% 55% / 0.05)',
                  border: '1px solid hsl(40 60% 55% / 0.1)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground/40 text-[10px]">Xona dizayni</span>
                  <p className="mt-0.5 truncate" style={{ color: 'hsl(40 60% 65%)' }}>
                    {wall?.name || 'Tanlanmagan'}
                  </p>
                </div>
                <div className="w-px flex-shrink-0" style={{ background: 'hsl(40 60% 55% / 0.15)' }} />
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground/40 text-[10px]">Eshik modeli</span>
                  <p className="mt-0.5 truncate" style={{ color: 'hsl(40 60% 65%)' }}>
                    {door?.name || 'Tanlanmagan'} · {door?.panelCount || 2}p
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-2">
                    Ism <span style={{ color: 'hsl(0 60% 55% / 0.6)' }}>*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="To'liq ismingiz"
                    className={inputCls}
                    autoFocus
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-2">
                    Telefon <span style={{ color: 'hsl(0 60% 55% / 0.6)' }}>*</span>
                  </label>
                  <input
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="+998 90 123 45 67"
                    className={inputCls}
                    maxLength={17}
                    inputMode="tel"
                  />
                  {phone.length > 5 && !phoneValid && (
                    <p className="text-[10px] font-body mt-1.5" style={{ color: 'hsl(0 60% 55% / 0.7)' }}>
                      To'liq raqam kiriting
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-2">
                    Manzil
                  </label>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Shahar, tuman, ko'cha..."
                    className={inputCls}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-body mb-2">
                    Izoh
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Qo'shimcha ma'lumot..."
                    className={inputCls + ' resize-none h-20'}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>

            {/* Footer — fixed */}
            <div
              className="flex-shrink-0 px-5 py-4 flex items-center justify-end gap-3"
              style={{
                borderTop: '1px solid hsl(40 60% 55% / 0.06)',
                background: 'hsl(220 18% 11% / 0.5)',
              }}
            >
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={!fullName.trim() || !phoneValid || saving || cooldown}
                className={`px-6 py-2.5 rounded-xl font-body text-sm tracking-wide transition-all duration-300 ${
                  fullName.trim() && phoneValid && !saving && !cooldown
                    ? 'shadow-[0_4px_20px_rgba(180,160,100,0.3)] hover:shadow-[0_6px_28px_rgba(180,160,100,0.4)] hover:-translate-y-0.5'
                    : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                }`}
                style={
                  fullName.trim() && phoneValid && !saving && !cooldown
                    ? {
                        background: 'linear-gradient(135deg, hsl(40 55% 42%), hsl(40 65% 55%))',
                        color: 'hsl(220 20% 10%)',
                      }
                    : undefined
                }
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
