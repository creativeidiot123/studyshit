# First-run smoke test

1. Open a **new** ChatGPT Project chat under a project whose instructions are copied from [PROJECT-INSTRUCTIONS.txt](PROJECT-INSTRUCTIONS.txt). Confirm GitHub connector can read **and write** this repo.
2. Install/refresh ChatGPT Resilience v1.3.36 or newer in Tampermonkey; open browser developer console and run:
   `ChatGPTResilience.selfTest().filter(x => !x.pass)`
   Expected: an empty array. (This checks internal pure logic; it is NOT a full browser integration test.)
3. In that Project chat, upload a small 2–4-slide PPT with a distinctive slide title, a formula, a table, and a chart. Do not put a second lecture in the same chat.
4. Stage 01 should read the stage prompt from GitHub, save a new lecture's `study.html`, `state.json` and `inputs/source-manifest.json`, re-fetch them, then emit `[[STUDY_STEP_DONE:S01]]` on its final line.
5. Check the GitHub commits **actually exist**. The terminal marker alone is only the model's claim; verification is part of the prompt contract.
6. The userscript should enqueue the GitHub `02-structure.txt` prompt, then move through the workflow. Stages 03, 04 and 05 repeat with `[[STUDY_STEP_MORE:S03]]` etc. until all topics are processed.
7. Final output should be `[[STUDY_FINAL_READY]]` with `state.stage=7` and a browsable `study.html` in the correct subject/lecture folder.

## Failure tests
- Disable GitHub write access and verify the model uses `[[STUDY_WAIT_FOR_HUMAN]]` instead of declaring a saved stage.
- Temporarily block raw.githubusercontent.com and verify the next prompt is **not** sent; use Tampermonkey menu → Retry study next stage when network is restored.
- Test a long slide deck in batches and verify the source IDs stay stable.
- Refresh the chat during a stage and ensure no duplicate stage dispatch occurs.
- Ensure the final HTML has all original source facts, maths, figures and solved questions before treating automation as complete.

## Important limitations
- Client-side userscript runs only while browser session is active. Do not treat it as an always-on remote agent.
- Chat attachment bytes are not automatically uploaded to GitHub by the userscript. The input manifest records provenance. Original binary copies require a separately verified upload mechanism.
- UI selectors can change. Re-test after major ChatGPT interface changes.
- A self-test PASS or terminal marker is not proof of GitHub persistence; confirm commits and actual file contents.
