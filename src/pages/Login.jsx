import { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import logo from "../assets/logo-admin.png"; // 👈 tu logo admin

export default function Login() {

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      setError("Credenciales incorrectas");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"linear-gradient(180deg,#0f0f0f,#050505)",
      color:"white",
      padding:20
    }}>

      {/* CARD */}
      <div style={{
        width:360,
        maxWidth:"100%",
        background:"rgba(255,255,255,0.04)",
        backdropFilter:"blur(20px)",
        border:"1px solid rgba(255,255,255,0.08)",
        padding:35,
        borderRadius:25,
        boxShadow:"0 20px 60px rgba(0,0,0,0.6)"
      }}>

        {/* LOGO */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <img 
            src={logo}
            style={{
              width:90,
              height:90,
              objectFit:"contain",
              borderRadius:18,
              boxShadow:"0 10px 30px rgba(0,0,0,0.6)"
            }}
          />
        </div>

        {/* TITULO */}
        <h2 style={{
          textAlign:"center",
          marginBottom:25,
          fontWeight:"bold",
          fontSize:22,
          letterSpacing:1
        }}>
          Panel Admin
        </h2>

        {/* EMAIL */}
        <input
          placeholder="Correo administrador"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={inputStyle}
        />

        {/* PASSWORD */}
        <input
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={e=>setPass(e.target.value)}
          style={inputStyle}
        />

        {/* ERROR */}
        {error && (
          <div style={{
            background:"rgba(255,0,0,0.15)",
            padding:10,
            borderRadius:10,
            marginBottom:10,
            fontSize:14,
            textAlign:"center",
            border:"1px solid rgba(255,0,0,0.3)"
          }}>
            {error}
          </div>
        )}

        {/* BOTON */}
        <button
          onClick={entrar}
          disabled={loading}
          style={{
            width:"100%",
            padding:14,
            marginTop:10,
            background:"linear-gradient(90deg,#ff7a18,#ff3d00)",
            border:"none",
            borderRadius:14,
            fontWeight:"bold",
            fontSize:16,
            color:"white",
            cursor:"pointer",
            transition:"0.2s",
            boxShadow:"0 10px 25px rgba(255,80,0,0.4)"
          }}
        >
          {loading ? "Entrando..." : "Entrar al panel"}
        </button>

        {/* FOOTER */}
        <div style={{
          marginTop:20,
          fontSize:12,
          opacity:0.5,
          textAlign:"center"
        }}>
          Super Tasty Boneless Admin
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width:"100%",
  padding:14,
  marginBottom:12,
  borderRadius:14,
  border:"1px solid rgba(255,255,255,0.08)",
  background:"rgba(255,255,255,0.05)",
  color:"white",
  outline:"none",
  fontSize:14
};