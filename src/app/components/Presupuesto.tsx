'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Target, Pencil } from 'lucide-react';

interface PresupuestoProps {
  totalGastado: number;
}

export default function Presupuesto({ totalGastado }: PresupuestoProps) {
  const [limite, setLimite] = useState<number>(0);
  const [editando, setEditando] = useState(false);
  const [nuevoLimite, setNuevoLimite] = useState('');

  // Cargar presupuesto desde Supabase al iniciar
  useEffect(() => {
    const cargarPresupuesto = async () => {
      const { data, error } = await supabase.from('presupuesto').select('monto').single();
      if (data && !error) setLimite(data.monto);
    };
    cargarPresupuesto();
  }, []);

  const guardarNuevoLimite = async () => {
    const monto = parseFloat(nuevoLimite);
    if (isNaN(monto) || monto <= 0) return;

    // Guardar en Supabase (asumimos que ya creamos la tabla y la política de inserción/actualización)
    const { error } = await supabase.from('presupuesto').upsert({ id: 1, monto });
    
    if (!error) {
      setLimite(monto);
      setEditando(false);
      setNuevoLimite('');
    } else {
      alert("Error guardando presupuesto: " + error.message);
    }
  };

  const porcentaje = limite > 0 ? Math.min((totalGastado / limite) * 100, 100) : 0;
  
  // Colores dinámicos de la barra
  let colorBarra = "bg-emerald-500"; // Verde
  if (porcentaje >= 80) colorBarra = "bg-amber-500"; // Amarillo
  if (porcentaje >= 100) colorBarra = "bg-red-500"; // Rojo

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <Target className="text-zinc-500" size={20} />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Presupuesto Mensual</h2>
        </div>
        
        {editando ? (
          <div className="flex gap-2">
            <input type="number" value={nuevoLimite} onChange={e => setNuevoLimite(e.target.value)} placeholder="Q 3000" className="w-24 h-8 bg-zinc-950 text-white px-2 rounded-lg border border-zinc-800 text-sm focus:outline-none focus:border-blue-500" />
            <button onClick={guardarNuevoLimite} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg">OK</button>
            <button onClick={() => setEditando(false)} className="text-xs text-zinc-500">X</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">Q{formatearDinero(limite)}</span>
            <button onClick={() => { setEditando(true); setNuevoLimite(limite.toString()); }} className="text-zinc-600 hover:text-zinc-400 p-1"><Pencil size={14} /></button>
          </div>
        )}
      </div>

      {limite > 0 ? (
        <div className="space-y-2">
          {/* Barra de progreso */}
          <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${porcentaje}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-mono tracking-tight">
            <span className="text-zinc-400">Gastado: Q{formatearDinero(totalGastado)}</span>
            <span className={`${totalGastado > limite ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
              {totalGastado > limite ? `Excedido por Q${formatearDinero(totalGastado - limite)}` : `Restan Q${formatearDinero(limite - totalGastado)}`}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-center text-zinc-600 text-xs py-2 border-2 border-dashed border-zinc-800 rounded-xl">Define un presupuesto mensual para empezar el control.</p>
      )}
    </section>
  );
}