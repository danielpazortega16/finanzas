'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  ShoppingBag, UtensilsCrossed, CarFront, PlugZap, HeartPulse, Package, 
  Banknote, BriefcaseBusiness, TrendingUp, CircleFadingPlus, Trash2, DollarSign
} from 'lucide-react';

export default function Home() {
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // Para leer el deslizamiento del dedo en el cel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const obtenerTransacciones = async () => {
    const { data, error } = await supabase.from('gastos').select('*').order('fecha', { ascending: false });
    if (!error && data) setTransacciones(data);
  };

  useEffect(() => { obtenerTransacciones(); }, []);

  const mostrarMensaje = (texto: string, tipo: string) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

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
      obtenerTransacciones();
    }
    setLoading(false);
  };

  const eliminarTransaccion = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este registro?')) return;
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (error) mostrarMensaje('❌ Error al borrar: ' + error.message, 'error');
    else obtenerTransacciones();
  };

  // 👆 LÓGICA PARA DESLIZAR EL DEDO (SWIPE)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    // Si desliza a la izquierda (cambia a ingreso)
    if (deltaX > 50 && tipo === 'gasto') {
      setTipo('ingreso'); setCategoria('');
    } 
    // Si desliza a la derecha (cambia a gasto)
    else if (deltaX < -50 && tipo === 'ingreso') {
      setTipo('gasto'); setCategoria('');
    }
    setTouchStartX(null);
  };

  const configCategorias: { [key: string]: { icon: React.ReactNode, color: string } } = {
    "Comida/Despensa": { icon: <ShoppingBag size={18} />, color: "bg-amber-500/10 text-amber-400" },
    "Restaurantes/Salidas": { icon: <UtensilsCrossed size={18} />, color: "bg-red-500/10 text-red-400" },
    "Transporte/Gasolina": { icon: <CarFront size={18} />, color: "bg-sky-500/10 text-sky-400" },
    "Parqueo": { icon: <CarFront size={18} />, color: "bg-indigo-500/10 text-indigo-400" },
    "Salud/Medicina": { icon: <HeartPulse size={18} />, color: "bg-rose-500/10 text-rose-400" },
    "Otros Gastos": { icon: <Package size={18} />, color: "bg-zinc-500/10 text-zinc-400" },
    "Salario": { icon: <BriefcaseBusiness size={18} />, color: "bg-emerald-500/10 text-emerald-400" },
    "Negocio/Ventas": { icon: <TrendingUp size={18} />, color: "bg-cyan-500/10 text-cyan-400" },
    "Transferencia recibida": { icon: <Banknote size={18} />, color: "bg-lime-500/10 text-lime-400" },
    "Otros Ingresos": { icon: <CircleFadingPlus size={18} />, color: "bg-teal-500/10 text-teal-400" },
  };
  const iconoPorDefecto = { icon: <DollarSign size={18} />, color: "bg-zinc-500/10 text-zinc-400" };

  const balance = transacciones.reduce((acc, t) => t.tipo === 'ingreso' ? acc + parseFloat(t.monto) : acc - parseFloat(t.monto), 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 p-4 sm:p-6 font-sans pb-24 overflow-x-hidden">
      <div className="max-w-md mx-auto space-y-6 mt-4 sm:mt-8">
        
        {/* Balance */}
        <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl">
          <p className="text-sm text-zinc-500 font-medium mb-1">Balance Disponible</p>
          <h2 className={`text-4xl font-extrabold tracking-tighter ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            Q{balance.toFixed(2)}
          </h2>
        </section>

        {/* Formulario con detección de deslizamiento (Swipe) */}
        <section 
          className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 🔘 INTERRUPTOR DESLIZANTE TIPO iOS */}
          <div className="relative flex bg-zinc-950 p-1 rounded-full mb-6 border border-zinc-800 cursor-pointer h-12 items-center">
            {/* Fondo de color que se desliza mágicamente */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-in-out shadow-md ${
                tipo === 'gasto' ? 'left-1 bg-red-500/90' : 'left-[calc(50%+2px)] bg-emerald-500/90'
              }`}
            />
            {/* Botones invisibles por encima */}
            <button type="button" onClick={() => { setTipo('gasto'); setCategoria(''); }} className={`relative z-10 flex-1 text-xs font-bold uppercase tracking-widest transition-colors ${tipo === 'gasto' ? 'text-white' : 'text-zinc-500'}`}>
              Gasto
            </button>
            <button type="button" onClick={() => { setTipo('ingreso'); setCategoria(''); }} className={`relative z-10 flex-1 text-xs font-bold uppercase tracking-widest transition-colors ${tipo === 'ingreso' ? 'text-white' : 'text-zinc-500'}`}>
              Ingreso
            </button>
          </div>

          <form onSubmit={guardarTransaccion} className="space-y-4">
            <input type="number" step="0.01" inputMode="decimal" placeholder="Q 0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="h-16 bg-zinc-950 text-white px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-3xl font-extrabold transition-all placeholder:text-zinc-700" />
            
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="h-14 bg-zinc-950 text-zinc-300 px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none transition-colors appearance-none text-base">
              <option value="" disabled>Selecciona categoría...</option>
              {tipo === 'gasto' ? (
                <>
                  <option value="Comida/Despensa">🛒 Comida / Despensa</option>
                  <option value="Restaurantes/Salidas">🍔 Restaurantes / Salidas</option>
                  <option value="Transporte/Gasolina">⛽ Transporte / Gasolina</option>
                  <option value="Parqueo">🅿️ Parqueo</option>
                  <option value="Salud/Medicina">🏥 Salud / Medicina</option>
                  <option value="Otros Gastos">📦 Otros Gastos</option>
                </>
              ) : (
                <>
                  <option value="Salario">💰 Salario / Sueldo</option>
                  <option value="Negocio/Ventas">📈 Negocio / Ventas</option>
                  <option value="Transferencia recibida">📩 Transferencia Recibida</option>
                  <option value="Otros Ingresos">➕ Otros Ingresos</option>
                </>
              )}
            </select>
            
            <input type="text" placeholder="Nota u observación (Opcional)" value={nota} onChange={(e) => setNota(e.target.value)} className="h-14 bg-zinc-950 text-white px-5 rounded-2xl border border-zinc-800 w-full focus:outline-none focus:border-zinc-700 transition-colors" />
            
            {mensaje.texto && (
              <div className={`p-3 rounded-xl text-sm font-semibold text-center animate-pulse ${mensaje.tipo === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {mensaje.texto}
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full text-white font-extrabold text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest ${tipo === 'gasto' ? 'bg-red-500/90 hover:bg-red-500 shadow-red-500/20' : 'bg-emerald-500/90 hover:bg-emerald-500 shadow-emerald-500/20'}`}>
              {loading ? 'Procesando...' : `Registrar ${tipo}`}
            </button>
          </form>
        </section>

        {/* Historial */}
        <section className="space-y-3 pb-6">
          <h2 className="text-xs font-semibold text-zinc-600 px-2 uppercase tracking-wider mt-8">Movimientos recientes</h2>
          {transacciones.map((t) => {
            const config = configCategorias[t.categoria] || iconoPorDefecto;
            return (
              <div key={t.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`p-3 rounded-full flex-shrink-0 ${config.color}`}>{config.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-100 truncate text-base">{t.categoria}</p>
                    <p className="text-xs text-zinc-500 truncate">{t.nota || (t.tipo === 'ingreso' ? 'Entrada' : 'Salida')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`font-extrabold text-lg ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-white'}`}>
                      {t.tipo === 'ingreso' ? '+' : '-'}Q{parseFloat(t.monto).toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => eliminarTransaccion(t.id)} className="p-2.5 bg-zinc-950 text-zinc-700 hover:bg-red-500 hover:text-white rounded-xl active:scale-90 border border-zinc-800" title="Borrar">
                    <Trash2 size={16} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
//hola probando el desplieje