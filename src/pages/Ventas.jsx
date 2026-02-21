import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Ventas() {

  const [ventasHoy, setVentasHoy] = useState({});
  const [ventasSemana, setVentasSemana] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const hoy = new Date();
  const fechaId =
    hoy.getFullYear() + "-" +
    String(hoy.getMonth()+1).padStart(2,"0") + "-" +
    String(hoy.getDate()).padStart(2,"0");

  // 🔥 realtime hoy
  useEffect(() => {
    const ref = doc(db, "ventas", fechaId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setVentasHoy(snap.data());
      else setVentasHoy({});
    });

    return () => unsub();
  }, []);

  // 🔥 semana
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

      datos.sort((a,b)=>a.fecha.localeCompare(b.fecha));
      setVentasSemana(datos.slice(-7));
    };

    obtenerSemana();
  }, []);

  // 📄 EXPORTAR PDF
  const exportarPDF = async () => {

    if (!fechaInicio || !fechaFin) {
      alert("Selecciona fechas");
      return;
    }

    const snapshot = await getDocs(collection(db, "ventas"));

    let resumen = {
      Boneless12: 0,
      Boneless6: 0,
      PapasGajo: 0,
      PapasFrancesa: 0,
      DedosQueso: 0,
      total: 0
    };

    snapshot.forEach(docu => {
      const fecha = docu.id;
      const data = docu.data();

      if (fecha >= fechaInicio && fecha <= fechaFin) {
        resumen.Boneless12 += data.Boneless_12 || 0;
        resumen.Boneless6 += data.Boneless_6 || 0;
        resumen.PapasGajo += data.Papas_Gajo || 0;
        resumen.PapasFrancesa += data.Papas_Francesa || 0;
        resumen.DedosQueso += data.Dedos_Queso || 0;
        resumen.total += data.total_dia || 0;
      }
    });

    const docPDF = new jsPDF();

    docPDF.setFontSize(18);
    docPDF.text("Super Tasty Boneless", 14, 20);

    docPDF.setFontSize(12);
    docPDF.text(`Reporte del ${fechaInicio} al ${fechaFin}`, 14, 30);

    autoTable(docPDF, {
      startY: 40,
      head: [["Producto", "Cantidad"]],
      body: [
        ["Boneless 12pz", resumen.Boneless12],
        ["Boneless 6pz", resumen.Boneless6],
        ["Papas gajo", resumen.PapasGajo],
        ["Papas francesa", resumen.PapasFrancesa],
        ["Dedos queso", resumen.DedosQueso]
      ]
    });

    docPDF.text(`TOTAL: $${resumen.total}`, 14, docPDF.lastAutoTable.finalY + 15);

    docPDF.save(`Ventas_${fechaInicio}_${fechaFin}.pdf`);
  };

  const dataHoy = [
    { name: "Boneless 12pz", value: ventasHoy.Boneless_12 || 0 },
    { name: "Boneless 6pz", value: ventasHoy.Boneless_6 || 0 },
    { name: "Dedos queso", value: ventasHoy.Dedos_Queso || 0 },
    { name: "Papas gajo", value: ventasHoy.Papas_Gajo || 0 },
    { name: "Papas francesa", value: ventasHoy.Papas_Francesa || 0 }
  ];

  const maxValue = Math.max(...dataHoy.map(d=>d.value));

  const card = {
    background:"rgba(255,255,255,0.04)",
    backdropFilter:"blur(20px)",
    border:"1px solid rgba(255,255,255,0.08)",
    padding:22,
    borderRadius:20,
    boxShadow:"0 20px 50px rgba(0,0,0,0.6)",
    marginTop:20
  };

  return (
    <div style={{maxWidth:950,margin:"auto",padding:10,color:"white"}}>

      <h1 style={{fontSize:28,fontWeight:"bold",marginBottom:10}}>
        📊 Dashboard de Ventas
      </h1>

      {/* EXPORTAR */}
      <div style={{...card,display:"flex",gap:10,flexWrap:"wrap"}}>
        <input
          type="date"
          value={fechaInicio}
          onChange={e=>setFechaInicio(e.target.value)}
          style={input}
        />
        <input
          type="date"
          value={fechaFin}
          onChange={e=>setFechaFin(e.target.value)}
          style={input}
        />

        <button onClick={exportarPDF} style={btn}>
          Exportar PDF
        </button>
      </div>

      {/* TOTAL */}
      <div style={{...card,fontSize:26,fontWeight:"bold"}}>
        💰 Total vendido hoy: ${ventasHoy.total_dia || 0}
      </div>

      {/* PRODUCTOS */}
      <div style={card}>
        <h3>Productos vendidos hoy</h3>
        <div>Boneless 12pz: {ventasHoy.Boneless_12 || 0}</div>
        <div>Boneless 6pz: {ventasHoy.Boneless_6 || 0}</div>
        <div>Papas gajo: {ventasHoy.Papas_Gajo || 0}</div>
        <div>Papas francesa: {ventasHoy.Papas_Francesa || 0}</div>
        <div>Dedos queso: {ventasHoy.Dedos_Queso || 0}</div>
      </div>

      {/* GRAFICA HOY */}
      <div style={card}>
        <h3>Productos vendidos hoy</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dataHoy}>
            <CartesianGrid stroke="#333"/>
            <XAxis dataKey="name" stroke="#fff" interval={0} angle={-18} textAnchor="end" height={60} tick={{ fontSize: 10 }}/>
            <YAxis stroke="#fff"/>
            <Tooltip/>
            <Bar dataKey="value">
              {dataHoy.map((entry,index)=>(
                <Cell key={index}
                  fill={entry.value===maxValue && maxValue>0 ? "#22c55e":"#ff3d00"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SEMANA */}
      <div style={card}>
        <h3>Ventas últimos 7 días</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ventasSemana}>
            <CartesianGrid stroke="#333"/>
            <XAxis dataKey="fecha" stroke="#fff"/>
            <YAxis stroke="#fff"/>
            <Tooltip/>
            <Bar dataKey="total" fill="#22c55e"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

const btn = {
  background:"linear-gradient(90deg,#ff7a18,#ff3d00)",
  border:"none",
  padding:"12px 18px",
  borderRadius:14,
  color:"white",
  fontWeight:"bold",
  cursor:"pointer",
  boxShadow:"0 10px 25px rgba(255,80,0,0.35)"
};

const input = {
  background:"#111",
  border:"1px solid #333",
  padding:"10px",
  borderRadius:10,
  color:"white"
};

export default Ventas;