'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { ShoppingBag, UtensilsCrossed, CarFront, HeartPulse, Package, Banknote, BriefcaseBusiness, TrendingUp, CircleFadingPlus } from 'lucide-react';

interface FormularioProps {
  onSaved: () => void;
  mostrarMensaje: (texto: string, tipo: string) => void;
}

export const configCategorias: { [key: string]: { icon: React.ReactNode, color: string, hex: string } } = {
  "Comida/Despensa": { icon: <ShoppingBag size={18} />, color: "bg-amber-500/10 text-amber-400", hex: "#f59e0b" },
  "Restaurantes/Salidas": { icon: <UtensilsCrossed size={18} />, color: "bg-red-500/10 text-red-400", hex: "#ef4444" },
  "Transporte/Gasolina": { icon: <CarFront size={18} />, color: "bg-sky-500/10 text-sky-400", hex: "#0ea5e9" },
  "Parqueo": { icon: <CarFront size={18} />, color: "bg-indigo-500/10 text-indigo-400", hex: "#6366f1" },
  "Salud/Medicina": { icon: <HeartPulse size={18} />, color: "bg-rose-500/10 text-rose-400", hex: "#f43f5e" },
  "Otros Gastos": { icon: <Package size={18} />, color: "bg-zinc-500/10 text-zinc-400", hex: "#71717a" },
  "Salario": { icon: <BriefcaseBusiness size={18} />, color: "bg-emerald-500/10 text-emerald-400", hex: "#10b981" },
  "Negocio/Ventas": { icon: <TrendingUp size={18} />, color: "bg-cyan-500/10 text-cyan-400", hex: "#06b6d4" },
  "Transferencia recibida": { icon: <Banknote size={18} />, color: "bg-lime-500/10 text-lime-400", hex: "#84cc16" },
  "Otros Ingresos": { icon: <CircleFadingPlus size={18} />, color: "bg-teal-500/10 text-teal-400", hex: "#14b8a6" },
};

export default function Formulario({ onSaved, mostrarMensaje }: FormularioProps) {
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);

  const guardarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!monto || !categoria) {
      mostrarMensaje('⚠️ Monto y categoría son obligatorios', 'error');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('gastos').insert([{ tipo, monto: parseFloat(monto), categoria, nota }]);
    if (error) {
      mostrarMensaje('❌ Error: ' + error.message, 'error');
    } else {
      mostrarMensaje('✅ ¡Guardado con éxito!', 'exito');
      setMonto(''); setCategoria(''); setNota('');
      onSaved();
    }
    setLoading(false);
  };

  return (
    <section className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl touch-pan-y">
      <div className="relative flex bg-zinc-950 p-1 rounded-full mb-6 border border-zinc-800 cursor-pointer h-12 items-center">
        <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-in-out shadow-md ${tipo === 'gasto' ? 'left-1 bg-red-500/90' : 'left-[calc(50%+2px)] bg-emerald-500/90'}`} />
        <button type="button" onClick={() => { setTipo('gasto'); setCategoria(''); }} className={`relative z-10 flex-1 text-xs font-bold uppercase tracking-widest transition-colors ${tipo === 'gasto' ? 'text-white' : 'text-zinc-500'}`}>Gasto</button>
        <button type="button" onClick={() => { setTipo('ingreso'); setCategoria(''); }} className={`relative z-10 flex-1 text-xs font-bold uppercase tracking-widest transition-colors ${tipo === 'ingreso' ? 'text-white' : 'text-zinc-500'}`}>Ingreso</button>
      </div>

      <form onSubmit={guardarTransaccion} className="space-y-4">
        <input type="number" step="0.01" inputMode="decimal" placeholder="Q 0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="h-16 bg-zinc-950 text-white px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-3xl font-extrabold transition-all placeholder:text-zinc-700" />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="h-14 bg-zinc-950 text-zinc-300 px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none transition-colors appearance-none text-base">
          <option value="" disabled>Selecciona categoría...</option>
          {tipo === 'gasto' ? (
            <>{Object.keys(configCategorias).filter(c => !["Salario", "Negocio/Ventas", "Transferencia recibida", "Otros Ingresos"].includes(c)).map(c => <option key={c} value={c}>{c}</option>)}</>
          ) : (
            <>{Object.keys(configCategorias).filter(c => ["Salario", "Negocio/Ventas", "Transferencia recibida", "Otros Ingresos"].includes(c)).map(c => <option key={c} value={c}>{c}</option>)}</>
          )}
        </select>
        <input type="text" placeholder="Nota u observación (Opcional)" value={nota} onChange={(e) => setNota(e.target.value)} className="h-14 bg-zinc-950 text-white px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none focus:border-zinc-700 transition-colors" />
        <button type="submit" disabled={loading} className={`w-full text-white font-extrabold text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest ${tipo === 'gasto' ? 'bg-red-500/90 hover:bg-red-500 shadow-red-500/20' : 'bg-emerald-500/90 hover:bg-emerald-500 shadow-emerald-500/20'}`}>{loading ? 'Procesando...' : `Registrar ${tipo}`}</button>
      </form>
    </section>
  );
}