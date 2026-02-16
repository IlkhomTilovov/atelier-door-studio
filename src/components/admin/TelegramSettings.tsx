import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function TelegramSettings() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('app_settings').select('key, value');
      if (data) {
        data.forEach(r => {
          if (r.key === 'telegram_bot_token') setBotToken(r.value);
          if (r.key === 'telegram_chat_id') setChatId(r.value);
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await supabase.from('app_settings').update({ value: botToken, updated_at: new Date().toISOString() }).eq('key', 'telegram_bot_token');
      await supabase.from('app_settings').update({ value: chatId, updated_at: new Date().toISOString() }).eq('key', 'telegram_chat_id');
      toast.success('Telegram sozlamalari saqlandi');
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const testConnection = async () => {
    if (!botToken || !chatId) {
      toast.error('Bot token va Chat ID kiritilishi kerak');
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Telegram integratsiyasi muvaffaqiyatli ulandi!\n\n🏠 Showroom buyurtma tizimi tayyor.',
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Test xabar yuborildi!');
      } else {
        toast.error(`Xatolik: ${data.description}`);
      }
    } catch (e: any) {
      toast.error(`Ulanish xatosi: ${e.message}`);
    }
    setTesting(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground/50 font-body text-sm">Yuklanmoqda...</div>;
  }

  const inputCls = "w-full bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all duration-200";
  const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-body mb-2";

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center">
          <Send className="w-5 h-5 text-[#0088cc]" />
        </div>
        <div>
          <h2 className="font-display text-xl text-foreground">Telegram integratsiyasi</h2>
          <p className="text-xs text-muted-foreground/60 font-body mt-0.5">Yangi buyurtmalar haqida bildirishnoma olish</p>
        </div>
      </div>

      <div className="space-y-5 bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border/40">
        <div>
          <label className={labelCls}>Bot Token <span className="text-destructive/60">*</span></label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className={inputCls + " pr-10"}
            />
            <button
              onClick={() => setShowToken(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 font-body mt-1.5">@BotFather dan olingan token</p>
        </div>

        <div>
          <label className={labelCls}>Chat ID <span className="text-destructive/60">*</span></label>
          <input
            type="text"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="-1001234567890"
            className={inputCls}
          />
          <p className="text-[10px] text-muted-foreground/40 font-body mt-1.5">Guruh yoki shaxsiy chat ID</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg font-body text-sm tracking-wide transition-all duration-300 ${
              !saving
                ? 'bg-gradient-to-r from-gold-dark to-gold text-primary-foreground shadow-[0_4px_16px_rgba(180,160,100,0.25)] hover:shadow-[0_6px_24px_rgba(180,160,100,0.35)] hover:-translate-y-0.5'
                : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>

          <button
            onClick={testConnection}
            disabled={testing || !botToken || !chatId}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm tracking-wide transition-all duration-300 ${
              !testing && botToken && chatId
                ? 'bg-[#0088cc]/15 text-[#0088cc] border border-[#0088cc]/30 hover:bg-[#0088cc]/25'
                : 'bg-muted/20 text-muted-foreground/40 border border-border/20 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {testing ? 'Tekshirilmoqda...' : 'Test yuborish'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-card/40 rounded-xl p-5 border border-border/30">
        <h3 className="font-display text-sm text-foreground mb-3">Qanday sozlash kerak?</h3>
        <ol className="space-y-2 text-xs text-muted-foreground/60 font-body list-decimal list-inside">
          <li>Telegram'da <span className="text-foreground/80">@BotFather</span> ga yozing</li>
          <li><span className="text-foreground/80">/newbot</span> buyrug'ini yuboring va bot yarating</li>
          <li>Bot token'ni nusxalang va yuqoriga qo'ying</li>
          <li>Botni guruhga qo'shing (buyurtma bildirishnomalari uchun)</li>
          <li><span className="text-foreground/80">@getidsbot</span> yordamida guruh Chat ID'ni oling</li>
          <li>"Test yuborish" tugmasini bosib tekshiring</li>
        </ol>
      </div>
    </div>
  );
}
