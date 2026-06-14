// src/components/PerformanceChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETTE = ["#0d6efd", "#198754", "#dc3545", "#ffc107", "#0dcaf0", "#6610f2", "#fd7e14", "#20c997"];

export default function PerformanceChart({ data, period }) {  

  const groups = {};
  const uniqueAgents = new Set();

  data.forEach(item => {
    let timeLabel = "";
    if (period === "monthly") {
      const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      timeLabel = item._id.month ? `${meses[item._id.month - 1]} ${item._id.year}` : `Año ${item._id.year}`;
    } else if (period === "weekly") {
      timeLabel = `Sem. ${item._id.week} (${item._id.year})`;
    } else {
      timeLabel = `Año ${item._id.year}`;
    }

    let agentName = "Métrica General";
    if (item.agentInfo && item.agentInfo.apellido) {
      agentName = `${item.agentInfo.apellido}, ${item.agentInfo.nombre}`;
    } else if (item._id && item._id.agentId) {
      agentName = `Agente ID: ${item._id.agentId.substring(18)}`;
    }

    uniqueAgents.add(agentName);

    if (!groups[timeLabel]) {
      groups[timeLabel] = { name: timeLabel };
    }

    // Si totalQuantity no viene o es nulo, aseguramos que sea 0 para que no rompa
    groups[timeLabel][agentName] = item.totalQuantity || 0;
  });

  const formattedData = Object.values(groups);
  const agentList = Array.from(uniqueAgents); 

  if (formattedData.length === 0) {
    return (
      <div className="card border-0 shadow-sm p-5 bg-white text-center">
        <p className="text-muted mb-0 py-4">No hay información válida para graficar en este período.</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4 bg-white" style={{ width: "100%", height: 450 }}>
      <div className="mb-3">
        <h5 className="card-title mb-1 text-dark fw-bold">Evolución de Rendimiento Comparativo</h5>
        <span className="text-muted small">Visualización individualizada por color institucional.</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
          <XAxis dataKey="name" stroke="#adb5bd" fontSize={12} tickLine={false} />
          <YAxis stroke="#adb5bd" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            cursor={{ fill: "#f8f9fa" }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: "15px" }} />
          
          {agentList.map((agentName, index) => (
            <Bar 
              key={agentName} 
              dataKey={agentName} 
              name={agentName}
              fill={PALETTE[index % PALETTE.length]} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={35}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}