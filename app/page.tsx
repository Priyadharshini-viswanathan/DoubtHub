"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = () => {

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if(email === storedUser.email && password === storedUser.password){

      localStorage.setItem("loggedUser", JSON.stringify(storedUser));
      router.push("/home");

    }else{

      alert("Invalid Login");

    }

  };

  return(

    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"#f4f7fb"
    }}>

      <div style={{
        width:"350px",
        background:"white",
        padding:"40px",
        borderRadius:"10px",
        boxShadow:"0 3px 10px rgba(0,0,0,0.1)"
      }}>

        <h2 style={{textAlign:"center",color:"#0f1f3d"}}>
          DoubtHub Login
        </h2>

        <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={{
          width:"100%",
          padding:"10px",
          marginTop:"20px",
          border:"1px solid #cbd5e1",
          borderRadius:"5px"
        }}
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        style={{
          width:"100%",
          padding:"10px",
          marginTop:"15px",
          border:"1px solid #cbd5e1",
          borderRadius:"5px"
        }}
        />

        <button
        onClick={handleLogin}
        style={{
          width:"100%",
          padding:"10px",
          marginTop:"20px",
          background:"#0f1f3d",
          color:"white",
          border:"none",
          borderRadius:"6px",
          cursor:"pointer"
        }}
        >
        Login
        </button>

        <p style={{marginTop:"15px",textAlign:"center"}}>

        New user? <a href="/signup">Signup</a>

        </p>

      </div>

    </div>

  );

}