import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Horario() {
  const [horario, setHorario] = useState({});

  // 🔥 escuchar cambios en tiempo real
  useEffect(() => {
    const ref = doc(db, "config", "horario");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setHorario(snap.data());
      }
    });

    return () => unsub();
  }, []);

  // 🔥 cambiar hora
  const cambiarHora = async (dia, tipo, valor) => {
    const ref = doc(db, "config", "horario");

    await updateDoc(ref, {
      [`${dia}.${tipo}`]: valor
    });
  };

  // 🔥 activar/desactivar día
  const toggleDia = async (dia) => {
    const ref = doc(db, "config", "horario");

    const activoActual =
      horario[dia]?.activo === undefined
        ? true
        : horario[dia]?.activo;

    await updateDoc(ref, {
      [`${dia}.activo`]: !activoActual
    });
  };

  const dias = [
    "lunes","martes","miercoles",
    "jueves","viernes","sabado","domingo"
  ];

  return (
    <div style={{
      padding:20,
      minHeight:"100%",
      boxSizing:"border-box",
      background:"#0b0b0b"
    }}>

      <h2 style={{marginBottom:20}}>
        ⏰ Horario del negocio
      </h2>

      {dias.map((dia) => {

        const activo =
          horario[dia]?.activo === undefined
            ? true
            : horario[dia]?.activo;

        return (
          <div key={dia}
            style={{
              background:"#111",
              padding:16,
              marginBottom:12,
              borderRadius:14,
              color:"white",
              boxShadow:"0 0 10px rgba(0,0,0,0.4)"
            }}
          >

            {/* HEADER DIA */}
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              marginBottom:10
            }}>
              <h3 style={{
                textTransform:"capitalize",
                fontSize:18,
                margin:0
              }}>
                {dia}
              </h3>

              <button
                onClick={()=>toggleDia(dia)}
                style={{
                  background: activo ? "#22c55e" : "#ef4444",
                  border:"none",
                  padding:"7px 14px",
                  borderRadius:10,
                  color:"white",
                  cursor:"pointer",
                  fontWeight:"bold",
                  fontSize:13
                }}
              >
                {activo ? "Abierto" : "Cerrado"}
              </button>
            </div>

            {/* HORAS */}
            <div style={{
              display:"flex",
              gap:12,
              opacity: activo ? 1 : 0.35,
              pointerEvents: activo ? "auto" : "none"
            }}>

              <div style={{flex:1}}>
                <small>Apertura</small><br/>
                <input
                  type="time"
                  value={horario[dia]?.apertura || "18:00"}
                  onChange={(e)=>
                    cambiarHora(dia,"apertura",e.target.value)
                  }
                  style={{
                    width:"100%",
                    padding:8,
                    marginTop:4,
                    borderRadius:8,
                    border:"none",
                    background:"#222",
                    color:"white"
                  }}
                />
              </div>

              <div style={{flex:1}}>
                <small>Cierre</small><br/>
                <input
                  type="time"
                  value={horario[dia]?.cierre || "23:00"}
                  onChange={(e)=>
                    cambiarHora(dia,"cierre",e.target.value)
                  }
                  style={{
                    width:"100%",
                    padding:8,
                    marginTop:4,
                    borderRadius:8,
                    border:"none",
                    background:"#222",
                    color:"white"
                  }}
                />
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}

export default Horario;