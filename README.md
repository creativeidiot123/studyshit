# Studyshit: incremental lecture-to-HTML textbook

One uploaded lecture deck (plus optional transcript) becomes one versioned, rigorously checked HTML study chapter.

## Start
1. Install ChatGPT Resilience userscript (**v1.3.37+** with a stage verification gate) from [chatgptuserscript](https://github.com/creativeidiot123/chatgptuserscript).
2. Create a dedicated ChatGPT Project named **Study** and paste [PROJECT-INSTRUCTIONS.txt](PROJECT-INSTRUCTIONS.txt) into its Project instructions.
3. Connect GitHub to ChatGPT with write access to this repository.
4. In a NEW project chat, upload a PPT/PDF and any lecture transcript. ChatGPT bootstraps Stage 01.
5. The userscript detects final study markers and loads the appropriate next prompt from /prompts/, queuing it through the existing durable Resilience queue. Every completed stage is independently verified once before advancing.

## Stages
01 source inventory + initial HTML; 02 teaching order; 03 simple teaching, one topic per run (350-700 words each, worked example and quick check); 04 at most one example or visual per topic; 05 3-5 practice questions per topic plus a mixed exam set; 06 audit/repair; 07 polish/release.

The read-only independent reviewer is [08-verify-stage.txt](prompts/08-verify-stage.txt). Prompts are standalone .txt files in [prompts/](prompts/). [00-shared.txt](prompts/00-shared.txt) sets the invariant rules.

## Subject structure
subjects/<subject-slug>/lectures/<lecture-slug>/study.html
subjects/<subject-slug>/lectures/<lecture-slug>/state.json
subjects/<subject-slug>/lectures/<lecture-slug>/inputs/source-manifest.json

**Privacy:** This repository is public. The generated HTML and source manifest will also be public, potentially exposing coursework or personal data. Prefer a separate private repository for lecture outputs if the materials are not intended for public sharing. Original slide or transcript bytes should not be published here by default.

The HTML, state and source manifest are versioned through GitHub. A chat-uploaded PPT is **not automatically** a repository upload: input/ contains the provenance manifest; copying original binary sources requires a verified authenticated binary-safe upload method.

## Protocol
- `[[STUDY_STEP_MORE:S03]]`: same stage must process another topic
- `[[STUDY_STEP_DONE:S03]]`: stage claims completion, queue ONE verifier for Stage 03 instead of Stage 04
- `[[STUDY_VERIFY_PASS:S03]]`: read-only check passed; load Stage 04
- `[[STUDY_VERIFY_FAIL:S03]]`: read-only check failed; re-run Stage 03 in repair mode; new completion claim gets checked again
- `[[STUDY_WAIT_FOR_HUMAN]]`: stop automation
- `[[STUDY_FINAL_READY]]`: Stage 07 claims release; trigger independent Stage 07 verification before reporting final acceptance
- `[[STUDY_VERIFY_PASS:S07]]`: independently verified chapter is finally ready

After three failures for the same stage, automation blocks until human review. Incomplete STEP_MORE batches bypass verification, since the stage has not claimed completion yet.

The script recognizes these as native terminal states alongside existing CGR markers. Do not append a second CGR_DONE marker. Never emit a success marker until the changed GitHub files have been saved AND re-fetched.

## Fail-closed
If GitHub write/read, source coverage or important verification is blocked, report the issue and WAIT. Do not silently advance with uncommitted HTML.

Note: Updating the userscript on Tampermonkey requires its @version bump and an installed copy that can fetch GitHub raw URLs.
