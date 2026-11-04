/* Interactive AI tutor added to every study topic; no API keys are read by this page. */
(function () {
  "use strict";
  const current = document.currentScript;
  if (!current || !current.src) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = new URL("./explain-ai.css", current.src).href;
  document.head.appendChild(css);

  const STORE_KEY = "studyshit.ai.workerUrl.v1";
  let savedUrl = "";
  try { savedUrl = localStorage.getItem(STORE_KEY) || ""; } catch (_) {}
  function endpoint() { return String(window.STUDY_AI_ENDPOINT || savedUrl || "").trim().replace(/\/+$/, ""); }
  function setEndpoint(value) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
      throw new Error("Enter an HTTPS Worker URL, without a password or query string.");
    savedUrl = url.href.replace(/\/+$/, "");
    try { localStorage.setItem(STORE_KEY, savedUrl); } catch (_) {}
    return savedUrl;
  }
  const topics = Array.from(document.querySelectorAll('section.topic[id^="topic-"], section[id^="topic-t"]'))
    .filter((section, index, all) => all.indexOf(section) === index);
  const outline = topics.map(t => {
    const h = t.querySelector("h2");
    return (h ? h.textContent.trim() : t.id);
  }).join("\n").slice(0, 2300);

  function contentOf(section) {
    const copy = section.cloneNode(true);
    copy.querySelectorAll("script, style, button, input, select, textarea, .ai-explain-panel, .ai-explain-trigger").forEach(node => node.remove());
    const imageNotes = Array.from(copy.querySelectorAll("img[alt]"))
      .map(img => "Image alt text: " + img.getAttribute("alt")).join("\n");
    const body = (copy.innerText || copy.textContent || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    return (body + (imageNotes ? "\n" + imageNotes : "")).slice(0, 14500);
  }
  function element(tag, cls, txt) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt != null) node.textContent = txt;
    return node;
  }
  function build(section) {
    const heading = Array.from(section.children).find(el => el.tagName === "H2") || section.querySelector("h2");
    if (!heading || !heading.parentNode) return;
    const bar = element("div", "ai-topic-heading");
    heading.parentNode.insertBefore(bar, heading);
    bar.appendChild(heading);
    const trigger = element("button", "ai-explain-trigger", "✦ Explain with AI");
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", "false");
    const panelId = "ai-panel-" + section.id;
    trigger.setAttribute("aria-controls", panelId);
    bar.appendChild(trigger);

    const panel = element("div", "ai-explain-panel");
    panel.id = panelId;
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "AI tutor for " + heading.textContent.trim());
    const intro = element("p", "ai-intro", "A simpler, deeper explanation with fresh examples. Grounded in this topic's lecture notes.");
    panel.appendChild(intro);

    const configure = element("div", "ai-config");
    const cfgLabel = element("label", "", "Your AI service URL");
    const cfgInput = element("input", "ai-config-input");
    cfgInput.type = "url";
    cfgInput.placeholder = "https://studyshit-ai.your-subdomain.workers.dev";
    cfgInput.autocomplete = "url";
    cfgInput.value = endpoint();
    cfgLabel.appendChild(cfgInput);
    const save = element("button", "ai-config-save", "Connect AI service");
    save.type = "button";
    const hint = element("p", "ai-hint", "Paste your deployed Cloudflare Worker URL (not your Gemini API key). Saved only in this browser. Setup: see ai-worker/README.md in the repository.");
    configure.append(cfgLabel, save, hint);
    panel.appendChild(configure);

    const actions = element("div", "ai-explain-actions");
    const choices = [
      ["simple", "Explain simply"],
      ["examples", "More examples"],
      ["deep", "Go deeper"]
    ];
    for (const [mode, label] of choices) {
      const btn = element("button", "ai-mode", label);
      btn.type = "button";
      btn.dataset.aiMode = mode;
      actions.appendChild(btn);
    }
    panel.appendChild(actions);

    const answer = element("div", "ai-explain-answer");
    answer.setAttribute("aria-label", "AI explanation");
    panel.appendChild(answer);
    const status = element("p", "ai-explain-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    panel.appendChild(status);

    const followup = element("form", "ai-followup");
    const qLabel = element("label", "", "Still confused? Ask about this topic");
    const qInput = element("textarea", "ai-question");
    qInput.rows = 2;
    qInput.maxLength = 650;
    qInput.placeholder = "e.g. Why does bond price fall when yield rises?";
    qLabel.appendChild(qInput);
    const askButton = element("button", "ai-ask", "Ask follow-up");
    askButton.type = "submit";
    followup.append(qLabel, askButton);
    panel.appendChild(followup);

    const settings = element("button", "ai-settings-link", "Change AI service URL");
    settings.type = "button";
    panel.appendChild(settings);
    bar.after(panel);

    let busy = false;
    let lastAnswer = "";
    let openedOnce = false;
    function showConfig(open) {
      configure.hidden = !open;
      actions.hidden = open;
      followup.hidden = open;
      settings.hidden = open;
      if (open) cfgInput.value = endpoint();
    }
    function showStatus(message, isError) {
      status.textContent = message;
      status.classList.toggle("ai-error", Boolean(isError));
    }
    async function explain(mode, question) {
      if (busy) return;
      const service = endpoint();
      if (!service) {
        showConfig(true);
        showStatus("Connect your Worker once to enable AI explanations.", false);
        return;
      }
      showConfig(false);
      busy = true;
      trigger.classList.add("ai-loading");
      actions.querySelectorAll("button").forEach(btn => { btn.disabled = true; });
      askButton.disabled = true;
      showStatus("Gemini 3.8 Flash is thinking through your lecture context…", false);
      try {
        const response = await fetch(service + "/explain", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            lecture: document.title,
            topic: heading.textContent.trim(),
            sourceIds: section.dataset.sourceIds || "",
            outline: outline,
            context: contentOf(section),
            mode: mode,
            question: question || "",
            previousAnswer: mode === "question" ? lastAnswer.slice(0, 2000) : ""
          })
        });
        let result;
        try { result = await response.json(); } catch (_) { throw new Error("The AI service returned an invalid response."); }
        if (!response.ok || !result.answer) throw new Error(result.error || "The explanation failed. HTTP " + response.status);
        lastAnswer = String(result.answer);
        answer.textContent = lastAnswer;
        showStatus("Answered by " + (result.model || "Gemini") + " · High thinking · AI-generated, check important calculations against the slides.", false);
      } catch (error) {
        showStatus("Could not get an explanation: " + error.message + " Check the Worker URL, deployment and API quota.", true);
      } finally {
        busy = false;
        trigger.classList.remove("ai-loading");
        actions.querySelectorAll("button").forEach(btn => { btn.disabled = false; });
        askButton.disabled = false;
      }
    }
    trigger.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden && !openedOnce) {
        openedOnce = true;
        if (endpoint()) explain("simple");
        else { showConfig(true); showStatus("First connect your AI Worker. The Gemini key stays in GitHub/Cloudflare secrets.", false); }
      }
    });
    save.addEventListener("click", () => {
      try { setEndpoint(cfgInput.value.trim()); showStatus("AI service saved for this browser.", false); explain("simple"); }
      catch (error) { showStatus(error.message, true); }
    });
    cfgInput.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); save.click(); } });
    settings.addEventListener("click", () => { showConfig(true); showStatus("Change your Worker URL here. Never paste a Gemini key.", false); });
    actions.querySelectorAll("[data-ai-mode]").forEach(btn =>
      btn.addEventListener("click", () => explain(btn.dataset.aiMode)));
    followup.addEventListener("submit", event => {
      event.preventDefault();
      const question = qInput.value.trim();
      if (!question) { showStatus("Write a question first.", true); return; }
      explain("question", question);
    });
    showConfig(!endpoint());
  }
  topics.forEach(build);
})();
