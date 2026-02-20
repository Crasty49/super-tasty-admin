import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Mensaje() {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const ref = doc(db, "config", "mensaje");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setTexto(snap.data().texto || "");
      }
    });

    return () => unsub();
  }, []);

  const guardar = async () => {
    const ref = doc(db, "config", "mensaje");

    await updateDoc(ref, {
      texto: texto
    });

    alert("Mensaje actualizado");
  };

  return (
    <div style={{
  padding:20,
  minHeight:"100%",
  boxSizing:"border-box"
}}>
      <h2>Mensaje superior de la app</h2>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          borderRadius: 10
        }}
      />

      <button
        onClick={guardar}
        style={{
          marginTop: 15,
          background: "limegreen",
          border: "none",
          padding: "10px 20px",
          color: "white",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        Guardar mensaje
      </button>
    </div>
  );
}

export default Mensaje;