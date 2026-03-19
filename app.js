const fs = require("fs");
const readline = require("readline");

const FILE = "tasks.json";

// Load tasks
function loadTasks() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

// Save tasks
function saveTasks(tasks) {
  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));
}

// Show tasks
function showTasks(tasks) {
  console.log("\n📋 Your Tasks:");
  if (tasks.length === 0) {
    console.log("No tasks yet!");
    return;
  }

  tasks.forEach((task, i) => {
    console.log(
      `${i + 1}. ${task.done ? "✅" : "⬜"} ${task.text} [${task.workspace}]`
    );
  });
}

// CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let tasks = loadTasks();

function menu() {
  console.log(`
===== LifeOS CLI =====
1. Add Task
2. View Tasks
3. Complete Task
4. Exit
`);

  rl.question("Choose option: ", (choice) => {
    if (choice === "1") {
      rl.question("Task name: ", (text) => {
        rl.question("Workspace (Study/Health/etc): ", (ws) => {
          tasks.push({ text, workspace: ws, done: false });
          saveTasks(tasks);
          console.log("✅ Task added!");
          menu();
        });
      });
    }

    else if (choice === "2") {
      showTasks(tasks);
      menu();
    }

    else if (choice === "3") {
      showTasks(tasks);
      rl.question("Enter task number: ", (num) => {
        const index = num - 1;
        if (tasks[index]) {
          tasks[index].done = true;
          saveTasks(tasks);
          console.log("🎉 Task completed!");
        }
        menu();
      });
    }

    else if (choice === "4") {
      console.log("Bye 👋");
      rl.close();
    }

    else {
      console.log("Invalid option");
      menu();
    }
  });
}

menu();