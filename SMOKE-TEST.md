# First-run smoke test

1. Open a **new** ChatGPT Project chat under a project whose instructions are copied from [PROJECT-INSTRUCTIONS.txt](PROJECT-INSTRUCTIONS.txt). Confirm GitHub connector can read **and write** this repo.
2. Install/refresh ChatGPT Resilience v1.3.37 or newer in Tampermonkey; open browser developer console and run:
   `ChatGPTResilience.selfTest().filter(x => !x.pass)`
   Expected: an empty array. (This checks internal pure logic; it is NOT a full browser integration test.)
3. In that Project chat, upload a small 2–4-slide PPT with a distinctive slide title, a formula, a table, and a chart. Do not put a second lecture in the same chat.
4. Stage 01 should read the stage prompt from GitHub, save a new lecture's `study.html`, `state.json` and `inputs/source-manifest.json`, re-fetch them, then emit `[[STUDY_STEP_DONE:S01]]` on its final line.
5. Check the GitHub commits **actually exist**. The terminal marker alone is only the model's claim; verification is part of the prompt contract.
6. The userscript should enqueue the independent GitHub `08-verify-stage.txt` prompt with Stage S01 context, NOT Stage S02 directly. Verifier must fetch/inspect HTML and state, then emit `[[STUDY_VERIFY_PASS:S01]]` before the script queues `02-structure.txt`. Repeat for every completed stage. Stages 03, 04 and 05 repeat with `[[STUDY_STEP_MORE:S03]]` etc. until all topics are processed.
7. Stage S07 should emit `[[STUDY_FINAL_READY]]`, then a final independent S07 verifier must emit `[[STUDY_VERIFY_PASS:S07]]` before the chapter is considered accepted. Confirm `state.stage=7` and a browsable `study.html` in the correct subject/lecture folder.

## Verification failure tests
- Falsely claim `STEP_DONE:S01` when only 15/52 slides are extracted: verifier must emit `VERIFY_FAIL:S01`, and userscript must queue SAME S01 for repair, never S02.
- On an incomplete S03 (one topic of six taught), S03 verifier must reject completion and return repair to S03.
- On a genuine PASS for S05, only then queue S06.
- After 3 failed verifications for one stage, script must stop, preserving current repository files and human review.
- An orphan/fake VERIFY_PASS turn with no pending verifier must NOT advance.
- Repeat checks after reload to ensure no duplicate verifier turn for the same completion claim.

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
