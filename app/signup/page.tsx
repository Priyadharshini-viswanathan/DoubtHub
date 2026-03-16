"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup(){

const router = useRouter();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [role,setRole] = useState("student");

const handleSignup = () => {

const user = {
name,
email,
password,
role
};

localStorage.setItem("user", JSON.stringify(user));

alert("Account Created!");
router.push("/");
};

return(

<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>

<div style={{background:"white",padding:"40px",borderRadius:"10px",width:"350px"}}>

<h2>Create Account</h2>

<input
placeholder="Name"
onChange={(e)=>setName(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
/>

<input
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
/>

<input
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
/>

<select
onChange={(e)=>setRole(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
>

<option value="student">Student</option>
<option value="expert">Expert / Staff</option>

</select>

<button
onClick={handleSignup}
style={{width:"100%",padding:"10px",marginTop:"20px",background:"blue",color:"white"}}
>
Signup
</button>

</div>

</div>

);

}