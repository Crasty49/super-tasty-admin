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
  setDoc
} from "firebase/firestore";

import ding from "../assets/ding.mp3";

function Pedidos() {

  const [pedidos, setPedidos] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [vista, setVista] = useState("activos"); // activos | listos

  const audioRef = useRef(null);
  const pedidosPreviosRef = useRef(0);

  // 🔊 sonido
  useEffect(() => {
    audioRef.current = new Audio(ding);
  }, []);

  // 🔥 ESCUCHAR PEDIDOS
  useEffect(() => {

    const q = query(
      collection(db, "pedidos"),
      orderBy("fecha", "desc")
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

      // 🔊 sonido si llegan nuevos
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

  // 🔥 MARCAR LISTO
  const marcarListo = async (pedido) => {

    const refPedido = doc(db, "pedidos", pedido.id);

    await updateDoc(refPedido, {
      estado: "listo"
    });

    // 🔥 GUARDAR EN VENTAS
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

  // 🎨 CARD PEDIDO
  const PedidoCard = (p, listo=false) => (
    <div key={p.id}
      style={{
        background:"#111",
        color:"white",
        padding:15,
        borderRadius:12,
        marginTop:15
      }}
    >
      <h3>{p.cliente}</h3>
      <p>Tel: {p.telefono}</p>
      <p>{p.pago === "efectivo" ? "💵" : "💳"} Pago: {p.pago}</p>
      <p>💲 Total: ${p.total}</p>

      <hr style={{margin:"10px 0"}}/>

      {p.productos.map((prod,i)=>{
        let emoji="🍗";
        const name = prod.name.toLowerCase();
        if(name.includes("papas")) emoji="🍟";
        if(name.includes("queso")) emoji="🧀";

        return (
          <div key={i}>
            {emoji} {prod.name}
            {prod.quantity>1?` x${prod.quantity}`:""}
          </div>
        );
      })}

      {!listo && (
        <button
          onClick={()=>marcarListo(p)}
          style={{
            marginTop:10,
            background:"limegreen",
            border:"none",
            padding:"8px 15px",
            color:"white",
            borderRadius:8,
            cursor:"pointer",
            fontWeight:"bold"
          }}
        >
          Marcar listo
        </button>
      )}

      {listo && (
        <div style={{
          marginTop:10,
          background:"#16a34a",
          padding:8,
          borderRadius:8,
          textAlign:"center",
          fontWeight:"bold"
        }}>
          Pedido entregado ✅
        </div>
      )}

    </div>
  );

  return (
    <div style={{padding:20,minHeight:"100%",boxSizing:"border-box"}}>

      <h2>Pedidos 🔥</h2>

      {/* BOTONES */}
      <div style={{
        display:"flex",
        gap:10,
        marginTop:15
      }}>
        <button
          onClick={()=>setVista("activos")}
          style={{
            flex:1,
            background: vista==="activos" ? "red" : "#222",
            color:"white",
            border:"none",
            padding:"12px",
            borderRadius:10,
            fontWeight:"bold"
          }}
        >
          🔥 Activos ({pedidos.length})
        </button>

        <button
          onClick={()=>setVista("listos")}
          style={{
            flex:1,
            background: vista==="listos" ? "#16a34a" : "#222",
            color:"white",
            border:"none",
            padding:"12px",
            borderRadius:10,
            fontWeight:"bold"
          }}
        >
          ✅ Listos ({pedidosListos.length})
        </button>
      </div>

      {/* LISTA */}
      {vista==="activos" &&
        pedidos.map(p=>PedidoCard(p,false))
      }

      {vista==="listos" &&
        pedidosListos.map(p=>PedidoCard(p,true))
      }

      {vista==="activos" && pedidos.length===0 && (
        <p style={{marginTop:20,opacity:0.6}}>
          No hay pedidos activos
        </p>
      )}

      {vista==="listos" && pedidosListos.length===0 && (
        <p style={{marginTop:20,opacity:0.6}}>
          No hay pedidos listos
        </p>
      )}

    </div>
  );
}

export default Pedidos;