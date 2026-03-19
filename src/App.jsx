import { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("lifeos")) || [];
    setTasks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lifeos", JSON.stringify(tasks));
  }, [tasks]);

  // 🧠 AUTO DETECTION
  const detectType = (text) => {
    const t = text.toLowerCase();

    if (t.includes("study") || t.includes("exam") || t.includes("revise"))
      return "Study";

    if (t.includes("water") || t.includes("gym") || t.includes("medicine"))
      return "Health";

    if (t.includes("pay") || t.includes("bill") || t.includes("money"))
      return "Finance";

    return "General";
  };

  // ⏱ QUICK TIME SET
  const setQuickTime = (mins) => {
    const future = new Date(Date.now() + mins * 60000);
    const h = future.getHours().toString().padStart(2, "0");
    const m = future.getMinutes().toString().padStart(2, "0");
    setTime(`${h}:${m}`);
  };

  const addTask = () => {
    if (!input || !time || !duration) return;

    const type = detectType(input);

    const [h, m] = time.split(":");
    const start = new Date();
    start.setHours(h);
    start.setMinutes(m);
    start.setSeconds(0);

    if (start < new Date()) start.setDate(start.getDate() + 1);

    const end = new Date(start.getTime() + duration * 60000);

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: input,
        workspace: type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        done: false,
      },
    ]);

    setInput("");
    setTime("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") addTask();
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const getStatus = (task) => {
    const start = new Date(task.startTime).getTime();
    const end = new Date(task.endTime).getTime();

    if (now < start) return "upcoming";
    if (now <= end) return "ongoing";
    return "overdue";
  };

  const getCountdown = (task) => {
    const start = new Date(task.startTime).getTime();
    const end = new Date(task.endTime).getTime();

    if (now < start) {
      const diff = Math.ceil((start - now) / 60000);
      return `⏳ ${diff} min`;
    }

    if (now <= end) {
      const diff = Math.ceil((end - now) / 60000);
      return `🔥 ${diff} min left`;
    }

    const diff = Math.ceil((now - end) / 60000);
    return `⚠️ ${diff} min overdue`;
  };

  // 🧠 SMART PRIORITY (UPGRADED)
  const getScore = (task) => {
    let score = 0;

    const status = getStatus(task);

    if (status === "overdue") score += 100;
    if (status === "ongoing") score += 80;
    if (status === "upcoming") score += 50;

    if (task.workspace === "Health") score += 30;
    if (task.workspace === "Finance") score += 20;
    if (task.workspace === "Study") score += 10;

    return score;
  };

  const getBestTask = () => {
    const active = tasks.filter(t => !t.done);
    if (!active.length) return null;

    return active.sort((a, b) => getScore(b) - getScore(a))[0];
  };

  const bestTask = getBestTask();

  const sections = {
    ongoing: tasks.filter(t => getStatus(t) === "ongoing"),
    upcoming: tasks.filter(t => getStatus(t) === "upcoming"),
    overdue: tasks.filter(t => getStatus(t) === "overdue"),
  };

  return (
    <div style={{ padding: 20, background: "#0f172a", color: "white", minHeight: "100vh" }}>
      <h1>⚡ LifeOS</h1>

      {/* DECISION */}
      {bestTask && (
        <div style={{ background: "#22c55e", padding: 15, borderRadius: 10, marginBottom: 20 }}>
          <h2>👉 Do This Now</h2>
          <p>{bestTask.text}</p>
          <small>{getCountdown(bestTask)}</small>
        </div>
      )}

      {/* INPUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="What do you need to do?"
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={() => setQuickTime(0)}>Now</button>
          <button onClick={() => setQuickTime(30)}>+30 min</button>
          <button onClick={() => setQuickTime(60)}>+1 hour</button>
        </div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <input
          type="number"
          value={duration}
          onChange={(e) => {
            let val = e.target.value;
            if (val.length > 1 && val.startsWith("0")) {
              val = val.replace(/^0+/, "");
            }
            setDuration(val === "" ? "" : Number(val));
          }}
        />

        <button onClick={addTask}>Add</button>
      </div>

      {/* LIST */}
      {["ongoing", "upcoming", "overdue"].map(section => (
        <div key={section}>
          <h2>{section}</h2>

          {sections[section].map(task => (
            <div key={task.id}>
              <span onClick={() => toggleTask(task.id)}>
                {task.done ? "✅" : "⬜"} {task.text}
              </span>
              {" - "}
              {getCountdown(task)} ({task.workspace})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}