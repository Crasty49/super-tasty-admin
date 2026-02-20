import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Ventas() {

  const [ventasHoy, setVentasHoy] = useState({});
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // 📅 fecha hoy
  const hoy = new Date();
  const fechaId =
    hoy.getFullYear() + "-" +
    String(hoy.getMonth()+1).padStart(2,"0") + "-" +
    String(hoy.getDate()).padStart(2,"0");

  // 🔥 ventas hoy realtime
  useEffect(() => {
    const ref = doc(db, "ventas", fechaId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setVentasHoy(snap.data());
      else setVentasHoy({});
    });

    return () => unsub();
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

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Super Tasty Boneless", 14, 20);

    doc.setFontSize(12);
    doc.text(`Reporte del ${fechaInicio} al ${fechaFin}`, 14, 30);

    autoTable(doc, {
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

    doc.text(`TOTAL: $${resumen.total}`, 14, doc.lastAutoTable.finalY + 15);

    doc.save(`Ventas_${fechaInicio}_${fechaFin}.pdf`);
  };

  return (
    <div style={{padding:30,color:"white"}}>

      <h1 style={{fontSize:28}}>📊 Ventas</h1>

      {/* SELECTOR PDF */}
      <div style={{
        marginTop:20,
        background:"#111",
        padding:20,
        borderRadius:15,
        display:"flex",
        gap:10,
        flexWrap:"wrap"
      }}>
        <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} />

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
        fontSize:24,
        fontWeight:"bold"
      }}>
        💰 Total vendido hoy: ${ventasHoy.total_dia || 0}
      </div>

    </div>
  );
}

export default Ventas;