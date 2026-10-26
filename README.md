# Studyshit: incremental lecture-to-HTML textbook

One uploaded lecture deck (plus optional transcript) becomes one versioned, rigorously checked HTML study chapter.

## Start
1. Install ChatGPT Resilience userscript (version with STUDY markers) from [chatgptuserscript](https://github.com/creativeidiot123/chatgptuserscript).
2. Create a dedicated ChatGPT Project named **Study** and paste [PROJECT-INSTRUCTIONS.txt](PROJECT-INSTRUCTIONS.txt) into its Project instructions.
3. Connect GitHub to ChatGPT with write access to this repository.
4. In a NEW project chat, upload a PPT/PDF and any lecture transcript. ChatGPT bootstraps Stage 01.
5. The userscript detects final study markers and loads the appropriate next prompt from /prompts/, queuing it through the existing durable Resilience queue.

## Stages
01 source inventory + initial HTML; 02 teaching order; 03 one-topic deep teaching; 04 one-topic research/visuals; 05 one-topic exam questions; 06 audit/repair; 07 polish/release.

Prompts are standalone .txt files in [prompts/](prompts/). [00-shared.txt](prompts/00-shared.txt) sets the invariant rules.

## Subject structure
subjects/<subject-slug>/lectures/<lecture-slug>/study.html
subjects/<subject-slug>/lectures/<lecture-slug>/state.json
subjects/<subject-slug>/lectures/<lecture-slug>/inputs/source-manifest.json

**Privacy:** This repository is public. The generated HTML and source manifest will also be public, potentially exposing coursework or personal data. Prefer a separate private repository for lecture outputs if the materials are not intended for public sharing. Original slide or transcript bytes should not be published here by default.

The HTML, state and source manifest are versioned through GitHub. A chat-uploaded PPT is **not automatically** a repository upload: input/ contains the provenance manifest; copying original binary sources requires a verified authenticated binary-safe upload method.

## Protocol
- `[[STUDY_STEP_MORE:S03]]`: same stage must process another topic
- `[[STUDY_STEP_DONE:S03]]`: stage done, load Stage 04
- `[[STUDY_WAIT_FOR_HUMAN]]`: stop automation
- `[[STUDY_FINAL_READY]]`: final committed HTML is ready

The script recognizes these as native terminal states alongside existing CGR markers. Do not append a second CGR_DONE marker. Never emit a success marker until the changed GitHub files have been saved AND re-fetched.

## Fail-closed
If GitHub write/read, source coverage or important verification is blocked, report the issue and WAIT. Do not silently advance with uncommitted HTML.

Note: Updating the userscript on Tampermonkey requires its @version bump and an installed copy that can fetch GitHub raw URLs.
