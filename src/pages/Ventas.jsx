import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";


function Ventas() {

  const [ventasHoy, setVentasHoy] = useState({});
  const [ventasSemana, setVentasSemana] = useState([]);

  // 📅 OBTENER FECHA HOY
  const hoy = new Date();
  const fechaId =
    hoy.getFullYear() + "-" +
    String(hoy.getMonth()+1).padStart(2,"0") + "-" +
    String(hoy.getDate()).padStart(2,"0");

  // 🔥 VENTAS DEL DÍA EN TIEMPO REAL
  useEffect(() => {

    const ref = doc(db, "ventas", fechaId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setVentasHoy(snap.data());
      } else {
        setVentasHoy({});
      }
    });

    return () => unsub();

  }, []);

  // 📊 VENTAS SEMANA
  useEffect(() => {

    const obtenerSemana = async () => {

      const snapshot = await getDocs(collection(db, "ventas"));

      const datos = [];

      snapshot.forEach((docu) => {
        datos.push({
          fecha: docu.id,
          total: docu.data().total_dia || 0
        });
      });

      datos.sort((a,b) => a.fecha.localeCompare(b.fecha));

      setVentasSemana(datos.slice(-7)); // últimos 7 días
    };

    obtenerSemana();

  }, []);


  // 📊 DATA GRÁFICA DÍA
    const dataHoy = [
        { name: "Boneless 12pz", value: ventasHoy.Boneless_12 || 0 },
        { name: "Boneless 6pz", value: ventasHoy.Boneless_6 || 0 },
        { name: "Dedos queso", value: ventasHoy.Dedos_Queso || 0 },
        { name: "Papas gajo", value: ventasHoy.Papas_Gajo || 0 },
        { name: "Papas francesa", value: ventasHoy.Papas_Francesa || 0 }
    ];

    // 🔥 detectar el producto más vendido
    const maxValue = Math.max(...dataHoy.map(d => d.value));

  // 🏆 PRODUCTO MÁS VENDIDO
  const productoTop =
    dataHoy.sort((a,b)=>b.value-a.value)[0];

  return (

    <div style={{
      padding:30,
      color:"white"
    }}>

      <h1 style={{fontSize:28}}>
        📊 Dashboard de Ventas
      </h1>

      {/* TOTAL DEL DÍA */}
      <div style={{
        marginTop:20,
        background:"#111",
        padding:25,
        borderRadius:15,
        fontSize:26,
        fontWeight:"bold"
      }}>
        💰 Total vendido hoy: ${ventasHoy.total_dia || 0}
      </div>

      {/* PRODUCTO TOP */}
      <div style={{
        marginTop:20,
        background:"#1a1a1a",
        padding:20,
        borderRadius:15
      }}>
        🏆 Producto más vendido hoy: {productoTop?.name || "Ninguno"}
      </div>

      {/* RESUMEN PRODUCTOS HOY */}
        <div style={{
        marginTop:25,
        background:"#111",
        padding:20,
        borderRadius:15
        }}>

        <h2 style={{marginBottom:15}}>
            🍗 Productos vendidos hoy
        </h2>

        <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
            gap:15,
            fontSize:18
        }}>

            <div>🍗 Boneless 12pz: <b>{ventasHoy.Boneless_12 || 0}</b></div>
            <div>🍗 Boneless 6pz: <b>{ventasHoy.Boneless_6 || 0}</b></div>
            <div>🍟 Papas gajo: <b>{ventasHoy.Papas_Gajo || 0}</b></div>
            <div>🍟 Papas francesa: <b>{ventasHoy.Papas_Francesa || 0}</b></div>
            <div>🧀 Dedos queso: <b>{ventasHoy.Dedos_Queso || 0}</b></div>

        </div>

        </div>

      {/* GRÁFICA HOY */}
        <div style={{
            width: "100%",
            overflowX: "auto",
            paddingBottom: 10
            }}>
            <div style={{ width: 430 }}> {/* ancho gráfico */}
                
                <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dataHoy}>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />

                    <XAxis 
                        dataKey="name"
                        stroke="#fff"
                        interval={0}
                        angle={-9}
                        textAnchor="end"
                        height={30}
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis stroke="#fff" allowDecimals={false} />

                    <Tooltip />

                <Bar 
                    dataKey="value"
                    radius={[8,8,0,0]}
                    barSize={35}
                    >
                    {dataHoy.map((entry, index) => (
                        <Cell
                        key={index}
                        fill={
                            entry.value === maxValue && maxValue > 0
                            ? "#22c55e"   // 🟢 ganador
                            : "#ef4444"   // 🔴 normal
                        }
                        />
                    ))}
                </Bar>

                </BarChart>
                </ResponsiveContainer>

            </div>
        </div>

      {/* GRÁFICA SEMANA */}
      <div style={{
        marginTop:30,
        background:"#111",
        padding:20,
        borderRadius:15
      }}>
        <h2>Ventas últimos 7 días</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ventasSemana}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default Ventas;