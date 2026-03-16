"use client";

import { useState, useEffect, useRef } from "react";

// --- WHITEBOARD COMPONENT ---
const Whiteboard = ({ onSave }: { onSave: (dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 3;
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL()); 
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave("");
    }
  };

  return (
    <div style={{ marginTop: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>Interactive Whiteboard</span>
        <button onClick={clear} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={250}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: "1px solid #cbd5e1", background: "#fafafa", cursor: "crosshair", width: "100%", borderRadius: "4px" }}
      />
    </div>
  );
};

// --- MAIN APP ---
export default function Home() {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeAnswer, setActiveAnswer] = useState<number | null>(null);
  const [page, setPage] = useState("dashboard");

  // Answer states
  const [answerText, setAnswerText] = useState("");
  const [answerImage, setAnswerImage] = useState<any>(null);
  const [answerAudio, setAnswerAudio] = useState<any>(null);
  const [answerDrawing, setAnswerDrawing] = useState<string | null>(null);

  const mediaRecorderRef = useRef<any>(null);
  const audioChunks = useRef<any[]>([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
    if (!loggedUser.points) loggedUser.points = 0;
    setUser(loggedUser);

    const savedQuestions = JSON.parse(localStorage.getItem("questions") || "[]");
    setPosts(savedQuestions);
  }, []);

  const getLeaderboard = () => {
    const counts: any = {};
    posts.forEach((post) => {
      post.answers?.forEach((ans: any) => {
        if (!counts[ans.email]) {
          counts[ans.email] = { name: ans.name, role: ans.role, answers: 0 };
        }
        counts[ans.email].answers += 1;
      });
    });
    return Object.values(counts).sort((a: any, b: any) => b.answers - a.answers).slice(0, 5);
  };

  const leaderboard = getLeaderboard();

  // Audio Recording Logic
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorderRef.current.start();
    mediaRecorderRef.current.ondataavailable = (event: any) => audioChunks.current.push(event.data);
  };

  const stopRecordingQuestion = () => {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/mp3" });
      setAudio(URL.createObjectURL(blob));
    };
  };

  const stopRecordingAnswer = () => {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/mp3" });
      setAnswerAudio(URL.createObjectURL(blob));
    };
  };

  const postQuestion = () => {
    if (!question && !image && !audio) return alert("Enter content");
    const newPost = {
      name: user?.name || "User",
      email: user?.email,
      role: user?.role || "student",
      question,
      image,
      audio,
      time: new Date().toLocaleString(),
      answers: [],
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("questions", JSON.stringify(updated));
    setQuestion(""); setImage(null); setAudio(null);
  };

  const postAnswer = (index: number) => {
    if (!answerText && !answerImage && !answerAudio && !answerDrawing) return alert("Enter answer");
    const newAnswer = {
      name: user?.name,
      email: user?.email,
      role: user?.role,
      text: answerText,
      image: answerImage,
      audio: answerAudio,
      drawing: answerDrawing,
      time: new Date().toLocaleString(),
      likes: 0, dislikes: 0, likedUsers: [], dislikedUsers: []
    };
    const updatedPosts = [...posts];
    updatedPosts[index].answers.push(newAnswer);
    setPosts(updatedPosts);
    localStorage.setItem("questions", JSON.stringify(updatedPosts));

    const updatedUser = { ...user, points: (user.points || 0) + 5 };
    setUser(updatedUser);
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));

    setAnswerText(""); setAnswerImage(null); setAnswerAudio(null); setAnswerDrawing(null); setActiveAnswer(null);
  };

  const likeAnswer = (pIdx: number, aIdx: number, type: string) => {
    const updated = [...posts];
    const ans = updated[pIdx].answers[aIdx];
    const email = user?.email;
    if (type === "like" && !ans.likedUsers.includes(email)) {
      ans.likes++; ans.likedUsers.push(email);
      if (email === ans.email) {
        const u = { ...user, points: user.points + 2 };
        setUser(u); localStorage.setItem("loggedUser", JSON.stringify(u));
      }
    } else if (type === "dislike" && !ans.dislikedUsers.includes(email)) {
      ans.dislikes++; ans.dislikedUsers.push(email);
    }
    setPosts(updated);
    localStorage.setItem("questions", JSON.stringify(updated));
  };

  const myDoubts = posts.filter((p) => p.email === user?.email);

  return (
    <div style={{ display: "flex", fontFamily: "system-ui, sans-serif", color: "#1e293b" }}>
      {/* SIDEBAR */}
      <div style={{ width: "230px", background: "#0f1f3d", color: "white", minHeight: "100vh", padding: "25px" }}>
        <h2 style={{ borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>DoubtHub</h2>
        <nav style={{ marginTop: "30px" }}>
          <p style={{ cursor: "pointer", fontWeight: page === "dashboard" ? "bold" : "normal" }} onClick={() => setPage("dashboard")}>🏠 Dashboard</p>
          <p style={{ cursor: "pointer", fontWeight: page === "mydoubts" ? "bold" : "normal" }} onClick={() => setPage("mydoubts")}>❓ My Doubts</p>
          <p style={{ cursor: "pointer", fontWeight: page === "profile" ? "bold" : "normal" }} onClick={() => setPage("profile")}>👤 Profile</p>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "40px", background: "#f8fafc" }}>
        
        {page === "profile" && (
          <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "350px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
              <h2 style={{ marginTop: 0 }}>My Stats</h2>
              <p><b>Name:</b> {user?.name}</p>
              <p><b>Email:</b> {user?.email}</p>
              <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "8px", textAlign: "center", marginTop: "20px" }}>
                <h3 style={{ margin: 0 }}>Score</h3>
                <h1 style={{ fontSize: "48px", margin: "10px 0", color: "#2563eb" }}>{user?.points || 0}</h1>
              </div>
            </div>

            <div style={{ background: "#ecfdf5", padding: "25px", borderRadius: "12px", flex: 1, minWidth: "350px", border: "1px solid #10b981" }}>
              <h3 style={{ marginTop: 0 }}>🏆 Global Leaderboard</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                <thead style={{ background: "#10b981", color: "white" }}>
                  <tr>
                    <th style={{ padding: "10px" }}>Rank</th>
                    <th style={{ padding: "10px" }}>Name</th>
                    <th style={{ padding: "10px" }}>Role</th>
                    <th style={{ padding: "10px" }}>Solutions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u: any, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #d1fae5", textAlign: "center" }}>
                      <td style={{ padding: "12px" }}>#{i + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td><b>{u.answers}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === "dashboard" && (
          <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
            <h2 style={{ marginTop: 0 }}>Ask a Question</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are you stuck on?"
              style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={startRecording} style={{ padding: "8px 12px" }}>🎤 Start Audio</button>
              <button onClick={stopRecordingQuestion} style={{ padding: "8px 12px" }}>🛑 Stop</button>
              {audio && <audio src={audio} controls style={{ height: "30px" }} />}
              <button onClick={postQuestion} style={{ marginLeft: "auto", background: "#2563eb", color: "white", padding: "10px 25px", border: "none", borderRadius: "6px", cursor: "pointer" }}>Post Doubt</button>
            </div>
          </div>
        )}

        {/* FEED */}
        <div style={{ marginTop: "30px" }}>
          {(page === "dashboard" ? posts : myDoubts).map((post, index) => (
            <div key={index} style={{ background: "white", padding: "25px", marginBottom: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold", color: "#2563eb" }}>{post.name} ({post.role})</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{post.time}</span>
              </div>
              <p style={{ fontSize: "18px", margin: "15px 0" }}>{post.question}</p>
              {post.audio && <audio src={post.audio} controls style={{ marginBottom: "15px" }} />}

              <button onClick={() => setActiveAnswer(activeAnswer === index ? null : index)} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}>
                {activeAnswer === index ? "Cancel" : "✍️ Write a Solution"}
              </button>

              {activeAnswer === index && (
                <div style={{ marginTop: "20px", padding: "20px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #2563eb" }}>
                  <textarea
                    placeholder="Provide your step-by-step solution..."
                    style={{ width: "100%", height: "100px", padding: "10px" }}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                  
                  {/* WHITEBOARD COMPONENT */}
                  <Whiteboard onSave={(data) => setAnswerDrawing(data)} />

                  <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                    <button onClick={startRecording}>🎤 Record Voice</button>
                    <button onClick={stopRecordingAnswer}>🛑 Stop</button>
                    <button onClick={() => postAnswer(index)} style={{ marginLeft: "auto", background: "#059669", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px" }}>Submit Answer</button>
                  </div>
                  {answerAudio && <audio src={answerAudio} controls style={{ marginTop: "10px" }} />}
                </div>
              )}

              {/* ANSWERS LIST */}
              {post.answers.map((ans: any, i: number) => (
                <div key={i} style={{ marginTop: "20px", padding: "15px", background: "#f1f5f9", borderRadius: "8px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>✅ {ans.name} says:</div>
                  <p>{ans.text}</p>
                  {ans.drawing && (
                    <div style={{ background: "white", padding: "10px", borderRadius: "5px", border: "1px solid #e2e8f0", marginTop: "10px" }}>
                      <img src={ans.drawing} alt="Solution Drawing" style={{ maxWidth: "100%" }} />
                    </div>
                  )}
                  {ans.audio && <audio src={ans.audio} controls style={{ marginTop: "10px" }} />}
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => likeAnswer(index, i, "like")}>👍 {ans.likes}</button>
                    <button onClick={() => likeAnswer(index, i, "dislike")}>👎 {ans.dislikes}</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}