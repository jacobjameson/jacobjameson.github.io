function courseBasePath() {
  return window.location.pathname.includes("/modules/") ? "../" : "./";
}

async function registerIsolationWorker() {
  if (!("serviceWorker" in navigator) || window.crossOriginIsolated) {
    return;
  }

  const base = courseBasePath();

  try {
    await navigator.serviceWorker.register(`${base}coi-serviceworker.js`, { scope: base });
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller) {
      window.location.reload();
    }
  } catch (error) {
    console.warn("Course service worker registration failed", error);
  }
}

registerIsolationWorker();
