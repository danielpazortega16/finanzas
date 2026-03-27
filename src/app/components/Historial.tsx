'use client';

import { supabase } from '@/app/lib/supabase';
import { Trash2, DollarSign, CalendarDays, Download } from 'lucide-react';
import { configCategorias } from './Formulario';
import Papa from 'papaparse'; // Librería para Excel (CSV)

interface HistorialProps {
  transacciones: any[];
  onDeleted: () => void;
  filtroMes: string;
  setFiltroMes: (mes: string) => void;
  mostrarMensaje: (texto: string, tipo: string) => void;
}

export default function Historial({ transacciones, onDeleted, filtroMes, setFiltroMes, mostrarMensaje }: HistorialProps) {
  
  const eliminarTransaccion = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este registro?')) return;
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (error) mostrarMensaje('❌ Error al borrar: ' + error.message, 'error');
    else onDeleted();
  };

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 📥 FUNCIÓN PARA EXPORTAR A EXCEL (CSV) MEJORADA
  const exportarExcel = () => {
    if (transacciones.length === 0) {
        mostrarMensaje('⚠️ No hay datos para exportar', 'error');
        return;
    }

    // Preparamos los datos para que se vean bonitos en Excel
    const datosPuros = transacciones.map(t => ({
        Fecha: new Date(t.fecha).toLocaleDateString('es-GT'),
        Tipo: t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
        Categoría: t.categoria,
        Monto: parseFloat(t.monto),
        Nota: t.nota || ''
    }));

    // MAGIA 1: Le decimos que use Punto y Coma (;) para que Excel separe las columnas
    const csv = Papa.unparse(datosPuros, { delimiter: ";" });
    
    // MAGIA 2: Agregamos "\uFEFF" (BOM) para que Excel lea las tildes perfectamente
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finanzas_daniel_${filtroMes}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarMensaje('📊 Archivo Excel descargado con éxito', 'exito');
  };

  // Generar lista de los últimos 6 meses para el filtro
  const generarMeses = () => {
    const meses = [];
    const fechaActual = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
        const valor = d.toISOString().substring(0, 7); // YYYY-MM
        const etiqueta = d.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });
        meses.push({ valor, etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1) });
    }
    return meses;
  };

const iconoPorDefecto = { icon: <DollarSign size={18} />, color: "bg-zinc-500/10 text-zinc-400" };

  return (
    <section className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl flex-1">
      {/* 📅 CABECERA CON FILTROS Y EXCEL */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center mb-6 border-b border-zinc-800 pb-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Movimientos Recientes</h2>
        
        <div className="flex gap-2">
            {/* Selector de Mes */}
            <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="h-10 bg-zinc-950 text-zinc-300 pl-9 pr-4 rounded-xl border border-zinc-800 text-sm focus:outline-none transition-colors appearance-none">
                    {generarMeses().map(m => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
                </select>
            </div>
            
            {/* Botón Excel */}
            <button onClick={exportarExcel} className="h-10 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl text-sm transition-colors border border-zinc-700/50">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
            </button>
        </div>
      </div>
      
      {/* LISTA DE MOVIMIENTOS */}
      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
        {transacciones.length === 0 ? (
          <p className="text-center text-zinc-700 py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-sm">No hay registros para este mes.</p>
        ) : (
          transacciones.map((t) => {
            const config = configCategorias[t.categoria] || iconoPorDefecto;            return (
              <div key={t.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center gap-3 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`p-3 rounded-full flex-shrink-0 ${config.color}`}>{config.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-100 truncate text-base">{t.categoria}</p>
                    <p className="text-xs text-zinc-500 truncate">{t.nota || (t.tipo === 'ingreso' ? 'Entrada' : 'Salida')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className={`font-extrabold text-lg ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-white'}`}>
                      {t.tipo === 'ingreso' ? '+' : '-'}Q{formatearDinero(parseFloat(t.monto))}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                      {new Date(t.fecha).toLocaleDateString('es-GT', {day: '2-digit', month: '2-digit'})}
                    </p>
                  </div>
                  <button onClick={() => eliminarTransaccion(t.id)} className="p-2.5 bg-zinc-950 text-zinc-700 hover:bg-red-500 hover:text-white rounded-xl active:scale-90 border border-zinc-800 transition-colors" title="Borrar">
                    <Trash2 size={16} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}