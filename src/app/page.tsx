'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// IMPORTAMOS NUESTRAS NUEVAS CAJITAS (COMPONENTES)
// IMPORTAMOS NUESTRAS NUEVAS CAJITAS (COMPONENTES)
import Formulario from './components/Formulario';
import GraficaGastos from './components/GraficaGastos';
import Presupuesto from './components/Presupuesto';
import Historial from './components/Historial';

export default function Home() {
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // 🔥 ESTADO PARA EL FILTRO DE MES (Por defecto, mes actual YYYY-MM)
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().substring(0, 7));

  // Función para traer datos desde Supabase filtrados por mes
  const obtenerTransacciones = async () => {
    // Calculamos el primer y último día del mes elegido para el filtro SQL
    const primerDia = `${filtroMes}-01T00:00:00Z`;
    const ultimoDia = `${filtroMes}-31T23:59:59Z`; // SQL es inteligente y ajusta si el mes tiene 28/30 días

    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .gte('fecha', primerDia) // Mayor o igual que el primer día
      .lte('fecha', ultimoDia) // Menor o igual que el último día
      .order('fecha', { ascending: false });

    if (!error && data) setTransacciones(data);
  };

  // Recargar datos cuando entras a la página O cuando cambias el mes en el filtro
  useEffect(() => { 
    obtenerTransacciones(); 
  }, [filtroMes]);

  const mostrarMensaje = (texto: string, tipo: string) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 🧮 CÁLCULOS MATEMÁTICOS (Basados solo en los datos filtrados del mes)
  const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + parseFloat(t.monto), 0);
  const totalGastos = transacciones.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + parseFloat(t.monto), 0);
  const balance = totalIngresos - totalGastos;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 p-4 sm:p-6 font-sans pb-24 overflow-x-hidden relative">
      
      {/* Sistema de notificaciones flotante (NUEVO DISEÑO) */}
      {mensaje.texto && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border text-sm font-bold animate-fade-in ${mensaje.tipo === 'error' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* DISEÑO EN COLUMNAS (Responsive: 1 col en cel, 12 cols en compu) */}
      <div className="max-w-7xl mx-auto mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA (md:col-span-4) - Balance y Formulario */}
        <div className="md:col-span-4 space-y-6">
          <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl relative overflow-hidden">
            {/* Fondo decorativo sutil */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            
            <p className="text-sm text-zinc-500 font-medium mb-1">Balance ({new Date(filtroMes + '-02').toLocaleDateString('es-GT', {month: 'long'})})</p>
            <h2 className={`text-4xl font-extrabold tracking-tighter relative z-10 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Q{formatearDinero(balance)}
            </h2>
          </section>

          {/* CAJITA 1: Formulario (md:col-span-4) */}
          <Formulario onSaved={obtenerTransacciones} mostrarMensaje={mostrarMensaje} />
        </div>

        {/* COLUMNA DERECHA (md:col-span-8) - Gráfica, Presupuesto e Historial */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Fila superior derecha: Gráfica y Presupuesto side-by-side en compu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* CAJITA 2: Gráfica (Se alimenta de las transacciones del mes) */}
            <GraficaGastos transacciones={transacciones} />
            
            {/* CAJITA 3: Presupuesto (Muestra barra de progreso vs total gastado) */}
            <Presupuesto totalGastado={totalGastos} />
          </div>

          {/* CAJITA 4: Historial (md:col-span-8) - Incluye filtros y Excel */}
          <Historial 
            transacciones={transacciones} 
            onDeleted={obtenerTransacciones} 
            filtroMes={filtroMes}
            setFiltroMes={setFiltroMes}
            mostrarMensaje={mostrarMensaje}
          />
        </div>

      </div>
    </main>
  );
}