"use client"

import { useEffect, useState } from "react"

export default function MyDoubts(){

const [posts,setPosts] = useState<any[]>([])
const [user,setUser] = useState<any>(null)

useEffect(()=>{

const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}")

setUser(loggedUser)

const allQuestions = JSON.parse(localStorage.getItem("questions") || "[]")

/* FILTER USER QUESTIONS */

const myQuestions = allQuestions.filter((q:any)=>q.email === loggedUser.email)

setPosts(myQuestions)

},[])

return(

<div style={{padding:"40px"}}>

<h2>My Doubts</h2>

{posts.map((post,index)=>(

<div key={index}
style={{
background:"white",
padding:"20px",
marginTop:"15px",
borderRadius:"8px",
boxShadow:"0 2px 5px rgba(0,0,0,0.1)"
}}
>

<h4>{post.question}</h4>

{post.image && <img src={post.image} width="200"/>}

{post.audio && <audio controls src={post.audio}></audio>}

<p>Posted: {post.time}</p>

</div>

))}

</div>

)

}