import { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const entrar = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"#0a0a0a",
      color:"white"
    }}>

      <div style={{
        background:"#111",
        padding:40,
        borderRadius:15,
        width:320
      }}>

        <h2 style={{marginBottom:20}}>
          Panel Admin 🔐
        </h2>

        <input
          placeholder="Correo"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={{
            width:"100%",
            padding:10,
            marginBottom:10,
            borderRadius:8,
            border:"none"
          }}
        />

        <input
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={e=>setPass(e.target.value)}
          style={{
            width:"100%",
            padding:10,
            marginBottom:10,
            borderRadius:8,
            border:"none"
          }}
        />

        {error && (
          <p style={{color:"red"}}>{error}</p>
        )}

        <button
          onClick={entrar}
          style={{
            width:"100%",
            padding:12,
            background:"orange",
            border:"none",
            borderRadius:10,
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          Entrar
        </button>

      </div>
    </div>
  );
}