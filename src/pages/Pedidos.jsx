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
  const audioRef = useRef(null);
  const pedidosPreviosRef = useRef(0);

  // 🔊 inicializar sonido una sola vez
  useEffect(() => {
    audioRef.current = new Audio(ding);
  }, []);

  useEffect(() => {

    const q = query(
      collection(db, "pedidos"),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const lista = [];

      snapshot.forEach((docu) => {
        const data = docu.data();
        if (data.estado === "nuevo") {
          lista.push({ id: docu.id, ...data });
        }
      });

      // 🔊 sonar si aumenta cantidad
      if (
        lista.length > pedidosPreviosRef.current &&
        pedidosPreviosRef.current !== 0
      ) {
        audioRef.current?.play().catch(() => {});
      }

      pedidosPreviosRef.current = lista.length;
      setPedidos(lista);

    });

    return () => unsub();

  }, []);

const marcarListo = async (pedido) => {

  const refPedido = doc(db, "pedidos", pedido.id);

  // cambiar estado
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

  if (snap.exists()) {
    data = snap.data();
  }

  pedido.productos.forEach(prod => {

    const name = prod.name.toLowerCase();

        if (name.includes("12")) {
        data.Boneless_12 = (data.Boneless_12 || 0) + 1;
        }

        if (name.includes("6 pz")) {
        data.Boneless_6 = (data.Boneless_6 || 0) + 1;
        }

        if (name.includes("gajo")) {
        data.Papas_Gajo = (data.Papas_Gajo || 0) + 1;
        }

        if (name.includes("francesa")) {
        data.Papas_Francesa = (data.Papas_Francesa || 0) + 1;
        }

        if (name.includes("queso")) {
        data.Dedos_Queso = (data.Dedos_Queso || 0) + 1;
        }

    });

  data.total_dia = (data.total_dia || 0) + pedido.total;

  await setDoc(refVenta, data);
};

  return (

    <div style={{
  padding:20,
  minHeight:"100%",
  boxSizing:"border-box"
}}>

      <h2>
        Pedidos activos 🔥 ({pedidos.length})
      </h2>

      {pedidos.map((p) => (

        <div key={p.id}
          style={{
            background:"#111",
            color:"white",
            padding:15,
            borderRadius:10,
            marginTop:15
          }}
        >

          <h3>{p.cliente}</h3>
          <p>Tel: {p.telefono}</p>
            <p>
            {p.pago === "efectivo" ? "💵" : "💳"} Pago: {p.pago}
            </p>

            <p>
            💲 Total: ${p.total}
            </p>

          <hr style={{margin:"10px 0"}}/>

        {p.productos.map((prod,i)=>{

        let emoji = "🍗";

        const name = prod.name.toLowerCase();

        if (name.includes("papas")) emoji = "🍟";
        if (name.includes("queso")) emoji = "🧀";

        return (
            <div key={i} style={{fontSize:14}}>
            {emoji} {prod.name}
            {prod.quantity > 1 ? ` x${prod.quantity}` : ""}
            </div>
        );

        })}

          <button
            onClick={()=>marcarListo(p)}
            style={{
              marginTop:10,
              background:"limegreen",
              border:"none",
              padding:"8px 15px",
              color:"white",
              borderRadius:8,
              cursor:"pointer"
            }}
          >
            Marcar listo
          </button>

        </div>

      ))}

    </div>
  );
}

export default Pedidos;