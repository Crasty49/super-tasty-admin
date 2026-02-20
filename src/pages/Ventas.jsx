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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Ventas() {

  const [ventasHoy, setVentasHoy] = useState({});
  const [ventasSemana, setVentasSemana] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // 📅 fecha actual
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
      setVentasSemana(datos.slice(-7));
    };

    obtenerSemana();
  }, []);

  // 🔥 EXPORTAR PDF
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

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Super Tasty Boneless", 14, 20);

    doc.setFontSize(12);
    doc.text("Reporte de ventas", 14, 30);
    doc.text(`Del ${fechaInicio} al ${fechaFin}`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [["Producto", "Cantidad"]],
      body: [
        ["Boneless 12pz", resumen.Boneless12],
        ["Boneless 6pz", resumen.Boneless6],
        ["Papas gajo", resumen.PapasGajo],
        ["Papas francesa", resumen.PapasFrancesa],
        ["Dedos queso", resumen.DedosQueso]
      ]
    });

    doc.text(
      `TOTAL VENDIDO: $${resumen.total}`,
      14,
      doc.lastAutoTable.finalY + 15
    );

    doc.save(`Ventas_${fechaInicio}_a_${fechaFin}.pdf`);
  };

  // 📊 DATA HOY
  const dataHoy = [
    { name: "Boneless 12pz", value: ventasHoy.Boneless_12 || 0 },
    { name: "Boneless 6pz", value: ventasHoy.Boneless_6 || 0 },
    { name: "Dedos queso", value: ventasHoy.Dedos_Queso || 0 },
    { name: "Papas gajo", value: ventasHoy.Papas_Gajo || 0 },
    { name: "Papas francesa", value: ventasHoy.Papas_Francesa || 0 }
  ];

  const maxValue = Math.max(...dataHoy.map(d => d.value));
  const productoTop = [...dataHoy].sort((a,b)=>b.value-a.value)[0];

  return (
    <div style={{ padding:30, color:"white" }}>

      <h1 style={{fontSize:28}}>📊 Dashboard de Ventas</h1>

      {/* SELECTOR FECHAS */}
      <div style={{
        marginTop:20,
        background:"#111",
        padding:20,
        borderRadius:15,
        display:"flex",
        gap:10,
        flexWrap:"wrap",
        alignItems:"center"
      }}>
        <input
          type="date"
          value={fechaInicio}
          onChange={e=>setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          value={fechaFin}
          onChange={e=>setFechaFin(e.target.value)}
        />
        <button
          onClick={exportarPDF}
          style={{
            background:"orange",
            border:"none",
            padding:"10px 18px",
            borderRadius:10,
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          Exportar PDF
        </button>
      </div>

      {/* TOTAL HOY */}
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

    </div>
  );
}

export default Ventas;