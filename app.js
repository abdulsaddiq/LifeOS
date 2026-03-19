const fs = require("fs");
const readline = require("readline");

const FILE = "lifeos_data.json";

// Load data
function loadData() {
  if (!fs.existsSync(FILE)) {
    return { tasks: [] };
  }
  return JSON.parse(fs.readFileSync(FILE));
}

// Save data
function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// CLI setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let data = loadData();

// Display tasks
function showTasks() {
  console.log("\n📋 ===== LIFEOS DASHBOARD =====");

  if (data.tasks.length === 0) {
    console.log("No tasks yet 🚀");
    return;
  }

  data.tasks.forEach((task, i) => {
    console.log(
      `${i + 1}. ${task.done ? "✅" : "⬜"} ${task.text}\n   📂 ${
        task.workspace
      } | ⚡ ${task.priority} | 📅 ${task.deadline || "No deadline"}`
    );
  });
}

// Add task
function addTask() {
  rl.question("Task: ", (text) => {
    rl.question("Workspace (Study/Health/etc): ", (workspace) => {
      rl.question("Priority (low/medium/high): ", (priority) => {
        rl.question("Deadline (YYYY-MM-DD or skip): ", (deadline) => {
          data.tasks.push({
            text,
            workspace,
            priority,
            deadline: deadline || null,
            done: false,
            createdAt: new Date(),
          });

          saveData(data);
          console.log("✅ Task added!");
          menu();
        });
      });
    });
  });
}

// Complete task
function completeTask() {
  showTasks();
  rl.question("Enter task number: ", (num) => {
    const index = num - 1;

    if (data.tasks[index]) {
      data.tasks[index].done = true;
      saveData(data);
      console.log("🎉 Task completed!");
    } else {
      console.log("Invalid task");
    }

    menu();
  });
}

// Delete task
function deleteTask() {
  showTasks();
  rl.question("Enter task number to delete: ", (num) => {
    const index = num - 1;

    if (data.tasks[index]) {
      data.tasks.splice(index, 1);
      saveData(data);
      console.log("🗑️ Task deleted!");
    } else {
      console.log("Invalid task");
    }

    menu();
  });
}

// Filter today tasks
function showTodayTasks() {
  console.log("\n📅 ===== TODAY =====");

  const today = new Date().toISOString().split("T")[0];

  const todayTasks = data.tasks.filter(
    (t) => t.deadline === today && !t.done
  );

  if (todayTasks.length === 0) {
    console.log("No tasks for today 🎉");
  } else {
    todayTasks.forEach((t, i) => {
      console.log(`${i + 1}. ⬜ ${t.text} (${t.workspace})`);
    });
  }

  menu();
}

// Menu
function menu() {
  console.log(`
====== LifeOS CLI ======
1. Add Task
2. View All Tasks
3. Complete Task
4. Delete Task
5. Today's Tasks
6. Exit
`);

  rl.question("Choose option: ", (choice) => {
    switch (choice) {
      case "1":
        addTask();
        break;
      case "2":
        showTasks();
        menu();
        break;
      case "3":
        completeTask();
        break;
      case "4":
        deleteTask();
        break;
      case "5":
        showTodayTasks();
        break;
      case "6":
        console.log("Bye 👋");
        rl.close();
        break;
      default:
        console.log("Invalid option");
        menu();
    }
  });
}

// Start app
menu();