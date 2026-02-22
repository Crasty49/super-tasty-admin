import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  where,
  Timestamp
} from "firebase/firestore";

import ding from "../assets/ding.mp3";

function Pedidos() {

  const [pedidos, setPedidos] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [vista, setVista] = useState("activos");

  const audioRef = useRef(null);
  const pedidosPreviosRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio(ding);
  }, []);

  // 🔥 FILTRAR SOLO PEDIDOS DEL DÍA ACTUAL
  useEffect(() => {

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate()+1);

    const q = query(
      collection(db, "pedidos"),
      where("fecha", ">=", Timestamp.fromDate(hoy)),
      where("fecha", "<", Timestamp.fromDate(manana)),
      orderBy("fecha","desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const activos = [];
      const listos = [];

      snapshot.forEach((docu) => {
        const data = docu.data();

        if (data.estado === "nuevo") {
          activos.push({ id: docu.id, ...data });
        }

        if (data.estado === "listo") {
          listos.push({ id: docu.id, ...data });
        }
      });

      if (
        activos.length > pedidosPreviosRef.current &&
        pedidosPreviosRef.current !== 0
      ) {
        audioRef.current?.play().catch(()=>{});
      }

      pedidosPreviosRef.current = activos.length;

      setPedidos(activos);
      setPedidosListos(listos);

    });

    return () => unsub();

  }, []);

  const marcarListo = async (pedido) => {

    const refPedido = doc(db, "pedidos", pedido.id);

    await updateDoc(refPedido, {
      estado: "listo"
    });

    const hoy = new Date();
    const fechaId =
      hoy.getFullYear() + "-" +
      String(hoy.getMonth()+1).padStart(2,"0") + "-" +
      String(hoy.getDate()).padStart(2,"0");

    const refVenta = doc(db, "ventas", fechaId);
    const snap = await getDoc(refVenta);

    let data = {};
    if (snap.exists()) data = snap.data();

    pedido.productos.forEach(prod => {
      const name = prod.name.toLowerCase();

      if (name.includes("12")) data.Boneless_12 = (data.Boneless_12 || 0) + 1;
      if (name.includes("6 pz")) data.Boneless_6 = (data.Boneless_6 || 0) + 1;
      if (name.includes("gajo")) data.Papas_Gajo = (data.Papas_Gajo || 0) + 1;
      if (name.includes("francesa")) data.Papas_Francesa = (data.Papas_Francesa || 0) + 1;
      if (name.includes("queso")) data.Dedos_Queso = (data.Dedos_Queso || 0) + 1;
    });

    data.total_dia = (data.total_dia || 0) + pedido.total;

    await setDoc(refVenta, data);
  };

  const PedidoCard = (p, listo=false) => (
    <div key={p.id}
      style={{
        background:"rgba(255,255,255,0.04)",
        backdropFilter:"blur(18px)",
        border:"1px solid rgba(255,255,255,0.08)",
        padding:18,
        borderRadius:18,
        marginTop:16,
        boxShadow:"0 10px 30px rgba(0,0,0,0.5)"
      }}
    >
      <h3 style={{marginBottom:5}}>{p.cliente}</h3>

      <div style={{opacity:0.8,fontSize:14}}>
        Tel: {p.telefono}
      </div>

      <div style={{marginTop:5}}>
        {p.pago === "efectivo" ? "💵" : "💳"} Pago: {p.pago}
      </div>

      <div style={{
        marginTop:5,
        fontWeight:"bold",
        fontSize:18,
        color:"#22c55e"
      }}>
        ${p.total}
      </div>

      <hr style={{margin:"12px 0",opacity:0.15}}/>

      {p.productos.map((prod,i)=>{
        let emoji="🍗";
        const name = prod.name?.toLowerCase() || "";

        if(name.includes("papas")) emoji="🍟";
        if(name.includes("queso")) emoji="🧀";

        const isBoneless = name.includes("boneless");

        return (
          <div key={i} style={{marginBottom:10,opacity:0.95}}>
            <div style={{fontWeight:"bold"}}>
              {emoji} {prod.name}
              {prod.quantity>1?` x${prod.quantity}`:""}
            </div>

            {isBoneless && (
              <>
                {prod.mode && (
                  <div style={{
                    fontSize:13,
                    marginLeft:18,
                    color:"#fb923c",
                    fontWeight:"bold"
                  }}>
                    🔥 {prod.mode === "banados"
                      ? "Bañados"
                      : prod.mode === "naturales_salsa"
                      ? "Naturales + salsa aparte"
                      : "Naturales"}
                  </div>
                )}

                {prod.includedSauces && prod.includedSauces.length > 0 && (
                  <div style={{
                    fontSize:13,
                    marginLeft:18,
                    opacity:0.8
                  }}>
                    🥫 Incluidas: {prod.includedSauces.join(", ")}
                  </div>
                )}

                {prod.extraSauces && prod.extraSauces.length > 0 && (
                  <div style={{
                    fontSize:13,
                    marginLeft:18,
                    color:"#facc15",
                    fontWeight:"bold"
                  }}>
                    ⭐ Extras: {prod.extraSauces.join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {!listo && (
        <button
          onClick={()=>marcarListo(p)}
          style={{
            marginTop:14,
            width:"100%",
            background:"linear-gradient(90deg,#22c55e,#16a34a)",
            border:"none",
            padding:"12px",
            borderRadius:14,
            color:"white",
            fontWeight:"bold",
            cursor:"pointer",
            fontSize:15,
            boxShadow:"0 10px 25px rgba(0,0,0,0.5)"
          }}
        >
          Marcar listo
        </button>
      )}

      {listo && (
        <div style={{
          marginTop:12,
          background:"rgba(34,197,94,0.15)",
          padding:10,
          borderRadius:12,
          textAlign:"center",
          fontWeight:"bold",
          border:"1px solid rgba(34,197,94,0.4)"
        }}>
          Pedido entregado ✅
        </div>
      )}
    </div>
  );

  return (
    <div style={{padding:10}}>

      <h2 style={{fontSize:24,marginBottom:10}}>
        Pedidos
      </h2>

      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={()=>setVista("activos")} style={{
          flex:1,padding:12,borderRadius:14,border:"none",fontWeight:"bold",
          background:vista==="activos"
          ? "linear-gradient(90deg,#ff7a18,#ff3d00)"
          : "#1a1a1a",color:"white"
        }}>
          🔥 Activos ({pedidos.length})
        </button>

        <button onClick={()=>setVista("listos")} style={{
          flex:1,padding:12,borderRadius:14,border:"none",fontWeight:"bold",
          background:vista==="listos"
          ? "linear-gradient(90deg,#22c55e,#16a34a)"
          : "#1a1a1a",color:"white"
        }}>
          ✅ Listos ({pedidosListos.length})
        </button>
      </div>

      {vista==="activos" && pedidos.map(p=>PedidoCard(p,false))}
      {vista==="listos" && pedidosListos.map(p=>PedidoCard(p,true))}

      {vista==="activos" && pedidos.length===0 && (
        <p style={{marginTop:20,opacity:0.5}}>No hay pedidos activos</p>
      )}

      {vista==="listos" && pedidosListos.length===0 && (
        <p style={{marginTop:20,opacity:0.5}}>No hay pedidos listos</p>
      )}

    </div>
  );
}

export default Pedidos;