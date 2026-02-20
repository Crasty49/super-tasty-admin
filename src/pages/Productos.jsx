import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Productos() {
  const [productos, setProductos] = useState({});

  useEffect(() => {
    const ref = doc(db, "config", "productos");

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        setProductos(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleProducto = async (nombre) => {
    const ref = doc(db, "config", "productos");

    await updateDoc(ref, {
      [nombre]: !productos[nombre],
    });
  };

  const ORDEN = [
    { key: "Boneless_12", label: "Boneless (12 pz)" },
    { key: "Boneless_6", label: "Media orden Boneless" },
    { key: "Papas_Gajo", label: "Papas gajo" },
    { key: "Papas_Francesa", label: "Papas francesa" },
    { key: "Dedos_Queso", label: "Dedos de queso" },
  ];

  return (
    <div style={{
  padding:20,
  minHeight:"100%",
  boxSizing:"border-box"
}}>
      <h2>Disponibilidad de productos</h2>

      {ORDEN.map((prod) => (
        <div
          key={prod.key}
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
          <span>{prod.label}</span>

          <button
            onClick={() => toggleProducto(prod.key)}
            style={{
              background: productos[prod.key] ? "limegreen" : "red",
              border: "none",
              padding: "8px 15px",
              color: "white",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {productos[prod.key] ? "Disponible" : "Agotado"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Productos;