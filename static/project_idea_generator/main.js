import { createIdeaPrompt, runPrompt, createRoadmapPrompt } from "./ai.js";

// CONSTANTS
const step1 = document.getElementById("step1");
const step1_btn = document.getElementById("step1-btn");
const interest_selects = document.querySelectorAll(".interest-select");
const interest_other = document.getElementById("interest-other");
const step1_error = document.getElementById("step1-error");

const step2 = document.getElementById("step2");
const step2_btn = document.getElementById("step2-btn");
const tech_selects = document.querySelectorAll(".tech-select");
const tech_other = document.getElementById("tech-other");
const step2_error = document.getElementById("step2-error");

const step3 = document.getElementById("step3");
const step3_btn = document.getElementById("step3-btn");
const tech1_dropdown = document.getElementById("tech1");
const tech2_dropdown = document.getElementById("tech2");
const tech3_dropdown = document.getElementById("tech3");
const tech_dropdowns = [tech1_dropdown, tech2_dropdown, tech3_dropdown];
const per_day_select = document.getElementById("per-day-select");
const time_select = document.getElementById("time-select");
const goal_selects = document.querySelectorAll(".goal-select");
const step3_error = document.getElementById("step3-error");

const step4 = document.getElementById("step4");
const step4_restart_btn = document.getElementById("step4-restart-btn");
const step4_regenerate_btn = document.getElementById("step4-regenerate-btn");
const idea_type = document.getElementById("idea-type");
const idea_time = document.getElementById("idea-time");
const idea_title = document.getElementById("idea-title");
const idea_tagline = document.getElementById("idea-tagline");
const idea_concept = document.getElementById("idea-concept");
const idea_tech = document.getElementById("idea-tech");
const get_started_btn = document.getElementById("get-started-btn");

const step5 = document.getElementById("step5");
const roadmap_title = document.getElementById("roadmap-title");
const roadmap_type = document.getElementById("roadmap-type");
const roadmap1_goal = document.getElementById("roadmap-1-goal");
const roadmap2_goal = document.getElementById("roadmap-2-goal");
const roadmap3_goal = document.getElementById("roadmap-3-goal");
const roadmap4_goal = document.getElementById("roadmap-4-goal");
const roadmap1_tasks = document.getElementById("roadmap-1-tasks");
const roadmap2_tasks = document.getElementById("roadmap-2-tasks");
const roadmap3_tasks = document.getElementById("roadmap-3-tasks");
const roadmap4_tasks = document.getElementById("roadmap-4-tasks");
const step5_restart_btn = document.getElementById("step5-restart-btn");
const step5_export_btn = document.getElementById("step5-export-btn");

const loading_screen = document.getElementById("loading-screen");

// SELECTED OPTIONS
let selected_interests = [];
let selected_tech = [];
let selected_goals = [];

// USER INPUT DATA
let interest_list = [];
let tech_list = [];
let experience = {};
let per_day = "";
let time = "";
let goals_list = [];

// NEXT BUTTONS
step1_btn.addEventListener("click", () => {
  if (selected_interests.length < 1 && interest_other.value == "") {
    step1_error.innerText =
      "Please select at least one interest or type into other";
  } else {
    // Collect Data
    for (let i = 0; i < selected_interests.length; i++) {
      interest_list.push(selected_interests[i].value);
    }
    if (interest_other.value != "") {
      let other = interest_other.value.replaceAll("<", "").replaceAll(">", "").replaceAll("/", "");
      interest_list.push(other);
    }

    // Clear Erros
    step1_error.innerText = "";

    // Next Page
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
  }
});

step2_btn.addEventListener("click", () => {
  if (selected_tech.length < 1 && tech_other.value == "") {
    step2_error.innerText =
      "Please select at least one kind of technology or type into other";
  } else {
    // Collect Data
    for (let t = 0; t < selected_tech.length; t++) {
      tech_list.push(selected_tech[t].value);
    }
    if (tech_other.value != "") {
      let other = tech_other.value.replaceAll("<", "").replaceAll(">", "").replaceAll("/", "");
      tech_list.push(other);
    }
    // Clear Error
    step2_error.innerText = "";

    // Customize Step 3 Form
    customizeTech();

    // Next Page
    step2.classList.add("hidden");
    step3.classList.remove("hidden");
  }
});

step3_btn.addEventListener("click", async () => {
  if (
    tech1_dropdown.querySelector("select").value == "" ||
    (tech2_dropdown.querySelector("select").value == "" &&
      tech2_dropdown.classList.contains("hidden") != true) ||
    (tech3_dropdown.querySelector("select").value == "" &&
      tech3_dropdown.classList.contains("hidden") != true) ||
    per_day_select.value == "" ||
    time_select.value == "" ||
    selected_goals.length < 1
  ) {
    step3_error.innerText = "Please complete all fields and select a goal";
  } else {
    // Collect Data
    for (let t = 0; t < tech_list.length; t++) {
      experience[tech_list[t]] =
        tech_dropdowns[t].querySelector("select").value;
    }
    per_day = per_day_select.value;
    time = time_select.value;
    for (let g = 0; g < selected_goals.length; g++) {
      goals_list.push(selected_goals[g].value);
    }

    // Clear Error
    step3_error.innerText = "";

    // Generate ideas
    step3.classList.add("hidden");
    await updateIdea("");

    // Next Page
    step4.classList.remove("hidden");
  }
});

step4_restart_btn.addEventListener("click", () => {
  clearData();

  // Return to Step 1
  step4.classList.add("hidden");
  step1.classList.remove("hidden");
});

step4_regenerate_btn.addEventListener("click", async () => {
  step4.classList.add("hidden");
  await updateIdea(`${idea_title.innerText}: ${idea_concept.innerText}`);
  step4.classList.remove("hidden");
});

get_started_btn.addEventListener("click", async () => {
  step4.classList.add("hidden");
  await updateRoadmap();
  step5.classList.remove("hidden");
});

step5_restart_btn.addEventListener("click", () => {
  clearData();

  // Return to Step 1
  step5.classList.add("hidden");
  step1.classList.remove("hidden");
});

step5_export_btn.addEventListener("click", () => {
  window.print();
})

// LIMITS
interest_selects.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      selected_interests.push(e.target);
    } else {
      selected_interests = selected_interests.filter(
        (item) => item !== e.target,
      );
    }

    if (
      selected_interests.length > 3 ||
      (selected_interests.length > 2 && interest_other.value != "")
    ) {
      const oldestCheckbox = selected_interests.shift();
      oldestCheckbox.checked = false;
    }
  });
});

tech_selects.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      selected_tech.push(e.target);
    } else {
      selected_tech = selected_tech.filter((item) => item !== e.target);
    }

    if (
      selected_tech.length > 3 ||
      (selected_tech.length > 2 && tech_other.value != "")
    ) {
      const oldestCheckbox = selected_tech.shift();
      oldestCheckbox.checked = false;
    }
  });
});

goal_selects.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      selected_goals.push(e.target);
    } else {
      selected_goals = selected_goals.filter((item) => item !== e.target);
    }

    if (selected_goals.length > 1) {
      const oldestCheckbox = selected_goals.shift();
      oldestCheckbox.checked = false;
    }
  });
});

interest_other.addEventListener("change", () => {
  if (selected_interests.length > 2 && interest_other.value != "") {
    const oldestCheckbox = selected_interests.shift();
    oldestCheckbox.checked = false;
  }
});

tech_other.addEventListener("change", () => {
  if (selected_tech.length > 2 && tech_other.value != "") {
    const oldestCheckbox = selected_tech.shift();
    oldestCheckbox.checked = false;
  }
});

// UPDATE FIELDS
function customizeTech() {
  if (tech_list.length < 3) {
    tech3_dropdown.classList.add("hidden");
  }

  if (tech_list.length < 2) {
    tech2_dropdown.classList.add("hidden");
    tech3_dropdown.classList.add("hidden");
  }

  for (let t = 0; t < tech_list.length; t++) {
    tech_dropdowns[t].querySelector("span").innerText = tech_list[t];
  }
}

function clearData() {
  // Clear Input
  while (selected_interests.length > 0) {
    let box = selected_interests.pop();
    box.checked = false;
  }
  while (selected_tech.length > 0) {
    let box = selected_tech.pop();
    box.checked = false;
  }
  while (selected_goals.length > 0) {
    let box = selected_goals.pop();
    box.checked = false;
  }
  interest_other.value = "";
  tech_other.value = "";

  tech1_dropdown.querySelector("select").value = "";
  tech2_dropdown.querySelector("select").value = "";
  tech3_dropdown.querySelector("select").value = "";
  per_day_select.value = "";
  time_select.value = "";

  roadmap1_tasks.innerHTML = "";
  roadmap2_tasks.innerHTML = "";
  roadmap3_tasks.innerHTML = "";
  roadmap4_tasks.innerHTML = "";

  // Clear User Input Data
  interest_list = [];
  tech_list = [];
  experience = {};
  per_day = "";
  time = "";
  goals_list = [];
}

async function updateIdea(regenerate) {
  loading_screen.classList.remove("hidden");

  let prompt = createIdeaPrompt(
    interest_list,
    tech_list,
    experience,
    per_day,
    time,
    goals_list,
    regenerate,
  );
  let result = await runPrompt(prompt);

  idea_type.innerText = result.type;
  idea_time.innerText = result.time_to_mvp;
  idea_title.innerText = result.title;
  idea_tagline.innerHTML = result.tagline;
  idea_concept.innerText = result.concept;
  idea_tech.innerText = result.tech_stack;

  loading_screen.classList.add("hidden");
}

async function updateRoadmap() {
  loading_screen.classList.remove("hidden");

  let type = idea_type.innerText;
  let time = idea_time.innerText;
  let title = idea_title.innerText;
  let tagline = idea_tagline.innerText;
  let concept = idea_concept.innerText;
  let tech = idea_tech.innerText;

  let prompt = createRoadmapPrompt(type, time, title, tagline, concept, tech);
  let result = await runPrompt(prompt);

  roadmap_title.innerText = title;
  roadmap_type.innerText = type;
  roadmap1_goal.innerText = result.phases[0].main_goal;
  roadmap2_goal.innerText = result.phases[1].main_goal;
  roadmap3_goal.innerText = result.phases[2].main_goal;
  roadmap4_goal.innerText = result.phases[3].main_goal;

  for (let t = 0; t < result.phases[0].tasks.length; t++) {
    roadmap1_tasks.innerHTML += `<li>${result.phases[0].tasks[t].task}</li>`;
  }
  for (let t = 0; t < result.phases[1].tasks.length; t++) {
    roadmap2_tasks.innerHTML += `<li>${result.phases[1].tasks[t].task}</li>`;
  }
  for (let t = 0; t < result.phases[2].tasks.length; t++) {
    roadmap3_tasks.innerHTML += `<li>${result.phases[2].tasks[t].task}</li>`;
  }
  for (let t = 0; t < result.phases[3].tasks.length; t++) {
    roadmap4_tasks.innerHTML += `<li>${result.phases[3].tasks[t].task}</li>`;
  }

  loading_screen.classList.add("hidden");
}
