import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const ORDEN_SALSAS = [
  "BBQ",
  "BBQ_Hot",
  "Bufalo",
  "Mango_Habanero",
  "Ranch",
];

function Salsas() {
  const [salsas, setSalsas] = useState({});

  useEffect(() => {
    const ref = doc(db, "config", "salsas");

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        setSalsas(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSalsa = async (nombre) => {
    const ref = doc(db, "config", "salsas");

    await updateDoc(ref, {
      [nombre]: !salsas[nombre],
    });
  };

  return (
    <div style={{
  padding:20,
  minHeight:"100%",
  boxSizing:"border-box"
}}>
      <h2>Disponibilidad de salsas</h2>

      {ORDEN_SALSAS.map((salsa) => (
        <div
          key={salsa}
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#111",
            color: "white",
            padding: 15,
            marginTop: 10,
            borderRadius: 10,
          }}
        >
          <span>{salsa}</span>

          <button
            onClick={() => toggleSalsa(salsa)}
            style={{
              background: salsas[salsa] ? "limegreen" : "red",
              border: "none",
              padding: "8px 15px",
              color: "white",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {salsas[salsa] ? "Disponible" : "Agotado"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Salsas;