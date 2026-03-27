'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { configCategorias } from './Formulario';

interface GraficaGastosProps {
  transacciones: any[];
}

export default function GraficaGastos({ transacciones }: GraficaGastosProps) {
  // Filtrar solo gastos y agrupar por categoría
  const datosGrafica = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((acc: any[], t) => {
      const index = acc.findIndex(item => item.name === t.categoria);
      if (index !== -1) {
        acc[index].value += parseFloat(t.monto);
      } else {
        acc.push({ name: t.categoria, value: parseFloat(t.monto) });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (datosGrafica.length === 0) return null;

  return (
    <section className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl">
      <h2 className="text-xs font-semibold text-zinc-500 px-2 uppercase tracking-wider mb-2">Distribución de Gastos (Mes actual)</h2>
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={datosGrafica} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
              {datosGrafica.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={configCategorias[entry.name]?.hex || "#71717a"} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`Q${formatearDinero(value)}`, 'Monto']}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', padding: '10px' }}
              itemStyle={{ color: '#f4f4f5', fontWeight: 'bold' }}
              cursor={{ fill: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Leyenda simple debajo */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-[10px] text-zinc-400">
            {datosGrafica.slice(0, 5).map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: configCategorias[d.name]?.hex}}></span>
                    {d.name}
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}