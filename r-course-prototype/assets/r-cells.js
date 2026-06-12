let webRPromise;
const loadedFiles = new Set();
const installedPackages = new Set();
const progressKey = "learning-r-progress-v1";

const outputFor = (cell) => cell.querySelector(".cell-output");
const editorFor = (cell) => cell.querySelector("textarea");
const runButtonFor = (cell) => cell.querySelector("[data-run]");
const checkButtonFor = (cell) => cell.querySelector("[data-check]");
const resetButtonFor = (cell) => cell.querySelector("[data-reset]");
const hintButtonFor = (cell) => cell.querySelector("[data-hint-toggle]");
const hintFor = (cell) => cell.querySelector(".cell-hint");

async function getWebR() {
  if (!webRPromise) {
    webRPromise = import("https://webr.r-wasm.org/latest/webr.mjs")
      .then(async ({ WebR }) => {
        const webR = new WebR();
        await webR.init();
        return webR;
      });
  }

  return webRPromise;
}

function splitList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

function setExerciseComplete(cell, isComplete) {
  const id = cell.dataset.exerciseId;

  if (id) {
    const progress = loadProgress();
    progress[id] = isComplete;
    saveProgress(progress);
  }

  cell.classList.toggle("is-complete", isComplete);
  updateProgressDisplay();
}

function updateProgressDisplay() {
  const total = document.querySelectorAll("[data-exercise-id]").length;
  const complete = document.querySelectorAll("[data-exercise-id].is-complete").length;
  const label = document.querySelector("[data-progress-label]");
  const meter = document.querySelector("[data-progress-meter]");

  if (label) {
    label.textContent = `${complete}/${total} checks complete`;
  }

  if (meter) {
    meter.style.width = total ? `${Math.round((complete / total) * 100)}%` : "0%";
  }
}

async function preloadFiles(webR, output) {
  const files = splitList(document.body.dataset.rFiles);

  for (const file of files) {
    if (loadedFiles.has(file)) {
      continue;
    }

    renderMessage(output, `Loading data file: ${file}`);
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Could not load ${file}: HTTP ${response.status}`);
    }

    const data = new Uint8Array(await response.arrayBuffer());
    const filename = file.split("/").pop();
    await webR.FS.writeFile(`/home/web_user/${filename}`, data);
    loadedFiles.add(file);
  }

  if (files.length) {
    await webR.evalR('setwd("/home/web_user")');
  }
}

async function installPackages(webR, cell, output) {
  const packages = splitList(cell.dataset.rPackages);
  const needed = packages.filter((pkg) => !installedPackages.has(pkg));

  if (!needed.length) {
    return;
  }

  renderMessage(output, `Installing package${needed.length > 1 ? "s" : ""}: ${needed.join(", ")}`);
  await webR.installPackages(needed, { quiet: true });
  needed.forEach((pkg) => installedPackages.add(pkg));
}

function renderMessage(output, text, isError = false) {
  output.textContent = text;
  output.classList.toggle("error", isError);
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join("\n");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatCapturedOutput(result) {
  const chunks = [];

  for (const item of result.output) {
    if (item.type === "stdout" || item.type === "stderr") {
      chunks.push(item.data);
    } else if (item.type === "canvas") {
      chunks.push("[plot output created]");
    } else {
      chunks.push(formatValue(item.data));
    }
  }

  return chunks.join("").trim() || "(no printed output)";
}

async function prepareRuntime(cell, output) {
  const webR = await getWebR();
  await preloadFiles(webR, output);
  await installPackages(webR, cell, output);
  return webR;
}

async function captureCode(webR, shelter, code) {
  return shelter.captureR(code, {
    withAutoprint: true,
    captureStreams: true,
    captureConditions: false
  });
}

async function evaluateR(cell, output) {
  const webR = await prepareRuntime(cell, output);
  const shelter = await new webR.Shelter();

  try {
    const result = await captureCode(webR, shelter, editorFor(cell).value);
    return formatCapturedOutput(result);
  } finally {
    shelter.purge();
  }
}

async function evaluateCheck(cell, output) {
  const webR = await prepareRuntime(cell, output);
  const shelter = await new webR.Shelter();

  try {
    const result = await captureCode(webR, shelter, editorFor(cell).value);
    const userOutput = formatCapturedOutput(result);
    const expectedOutput = cell.dataset.checkOutput;
    const checkExpr = cell.dataset.checkExpr;

    if (expectedOutput && userOutput.includes(expectedOutput)) {
      return { ok: true, output: userOutput };
    }

    if (checkExpr) {
      const checkResult = await captureCode(
        webR,
        shelter,
        `if (isTRUE(${checkExpr})) cat("__CHECK_PASS__") else cat("__CHECK_FAIL__")`
      );
      const checkOutput = formatCapturedOutput(checkResult);
      return { ok: checkOutput.includes("__CHECK_PASS__"), output: userOutput };
    }

    return { ok: Boolean(userOutput.trim()), output: userOutput };
  } finally {
    shelter.purge();
  }
}

async function runCell(cell) {
  const output = outputFor(cell);
  const button = runButtonFor(cell);

  button.disabled = true;
  renderMessage(output, "Loading R runtime...");

  try {
    const result = await evaluateR(cell, output);
    renderMessage(output, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    renderMessage(output, `R could not run here.\n\n${message}`, true);
  } finally {
    button.disabled = false;
  }
}

async function checkCell(cell) {
  const output = outputFor(cell);
  const button = checkButtonFor(cell);

  button.disabled = true;
  renderMessage(output, "Running check...");

  try {
    const result = await evaluateCheck(cell, output);

    if (result.ok) {
      setExerciseComplete(cell, true);
      renderMessage(output, `${result.output}\n\nCheck passed.`);
    } else {
      setExerciseComplete(cell, false);
      renderMessage(output, `${result.output}\n\nNot quite yet. Use the hint or adjust your code.`, true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setExerciseComplete(cell, false);
    renderMessage(output, `R could not run this check.\n\n${message}`, true);
  } finally {
    button.disabled = false;
  }
}

function resizeEditor(editor) {
  editor.style.height = "auto";
  editor.style.height = `${Math.max(editor.scrollHeight, 134)}px`;
}

function resetCell(cell) {
  const editor = editorFor(cell);
  editor.value = cell.dataset.starter || "";
  resizeEditor(editor);
  renderMessage(outputFor(cell), "Starter code restored.");
  setExerciseComplete(cell, false);
}

function toggleHint(cell) {
  const hint = hintFor(cell);

  if (!hint) {
    return;
  }

  hint.hidden = !hint.hidden;
}

function initCells() {
  const progress = loadProgress();
  const cells = document.querySelectorAll("[data-r-cell]");

  cells.forEach((cell) => {
    const editor = editorFor(cell);
    const runButton = runButtonFor(cell);
    const checkButton = checkButtonFor(cell);
    const resetButton = resetButtonFor(cell);
    const hintButton = hintButtonFor(cell);
    const id = cell.dataset.exerciseId;

    cell.dataset.starter = editor.value;
    resizeEditor(editor);

    if (id && progress[id]) {
      cell.classList.add("is-complete");
    }

    editor.addEventListener("input", () => resizeEditor(editor));
    runButton?.addEventListener("click", () => runCell(cell));
    checkButton?.addEventListener("click", () => checkCell(cell));
    resetButton?.addEventListener("click", () => resetCell(cell));
    hintButton?.addEventListener("click", () => toggleHint(cell));
  });

  updateProgressDisplay();
}

document.addEventListener("DOMContentLoaded", initCells);
