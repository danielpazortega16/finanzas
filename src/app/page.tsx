'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Formulario from './components/Formulario';
import GraficaGastos from './components/GraficaGastos';
import Presupuesto from './components/Presupuesto';
import Historial from './components/Historial';

export default function Home() {
  const [transaccionesMes, setTransaccionesMes] = useState<any[]>([]);
  const [balanceGlobal, setBalanceGlobal] = useState(0); 
  const [totalGastosMes, setTotalGastosMes] = useState(0);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().substring(0, 7));

  const obtenerDatos = async () => {
    // 1. OBTENER TODO PARA EL BALANCE REAL (Sin filtros de fecha)
    const { data: todos, error: errorGlobal } = await supabase.from('gastos').select('tipo, monto');
    if (!errorGlobal && todos) {
      const total = todos.reduce((acc, t) => t.tipo === 'ingreso' ? acc + parseFloat(t.monto) : acc - parseFloat(t.monto), 0);
      setBalanceGlobal(total);
    }

    // 2. OBTENER SOLO LO DEL MES PARA LA GRÁFICA E HISTORIAL
    const primerDia = `${filtroMes}-01T00:00:00Z`;
    const ultimoDia = `${filtroMes}-31T23:59:59Z`;

    const { data: mes, error: errorMes } = await supabase
      .from('gastos')
      .select('*')
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)
      .order('fecha', { ascending: false });

    if (!errorMes && mes) {
      setTransaccionesMes(mes);
      const gastos = mes.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + parseFloat(t.monto), 0);
      setTotalGastosMes(gastos);
    }
  };

  useEffect(() => { obtenerDatos(); }, [filtroMes]);

  const mostrarMensaje = (texto: string, tipo: string) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 p-4 sm:p-6 font-sans pb-24 overflow-x-hidden relative">
      {mensaje.texto && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border text-sm font-bold animate-fade-in ${mensaje.tipo === 'error' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-4 space-y-6">
          <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center shadow-2xl relative overflow-hidden">
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${balanceGlobal >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-zinc-500 font-medium mb-1">Balance Total (Acumulado)</p>
            <h2 className={`text-4xl font-extrabold tracking-tighter relative z-10 ${balanceGlobal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Q{formatearDinero(balanceGlobal)}
            </h2>
          </section>

          <Formulario onSaved={obtenerDatos} mostrarMensaje={mostrarMensaje} />
        </div>

        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GraficaGastos transacciones={transaccionesMes} />
            <Presupuesto totalGastado={totalGastosMes} />
          </div>

          <Historial 
            transacciones={transaccionesMes} 
            onDeleted={obtenerDatos} 
            filtroMes={filtroMes}
            setFiltroMes={setFiltroMes}
            mostrarMensaje={mostrarMensaje}
          />
        </div>
      </div>
    </main>
  );
}