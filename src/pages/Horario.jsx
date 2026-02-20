import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Horario() {
  const [horario, setHorario] = useState({});

  useEffect(() => {
    const ref = doc(db, "config", "horario");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setHorario(snap.data());
      }
    });

    return () => unsub();
  }, []);

  const cambiarHora = async (dia, tipo, valor) => {
    const ref = doc(db, "config", "horario");

    await updateDoc(ref, {
      [`${dia}.${tipo}`]: valor
    });
  };

  const dias = [
    "lunes","martes","miercoles",
    "jueves","viernes","sabado","domingo"
  ];

  return (
    <div style={{ padding: 30 }}>
      <h2>Horario del negocio</h2>

      {dias.map((dia) => (
        <div key={dia}
          style={{
            background:"#111",
            padding:15,
            marginTop:10,
            borderRadius:10,
            color:"white"
          }}
        >

          <h4 style={{textTransform:"capitalize"}}>{dia}</h4>

          <div style={{display:"flex",gap:10,marginTop:10}}>

            <div>
              <small>Apertura</small><br/>
              <input
                type="time"
                value={horario[dia]?.apertura || "00:00"}
                onChange={(e)=>
                  cambiarHora(dia,"apertura",e.target.value)
                }
              />
            </div>

            <div>
              <small>Cierre</small><br/>
              <input
                type="time"
                value={horario[dia]?.cierre || "00:00"}
                onChange={(e)=>
                  cambiarHora(dia,"cierre",e.target.value)
                }
              />
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default Horario;