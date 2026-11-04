# Studyshit: Explain with AI (Gemini 3.8 Flash / HIGH)

Every topic in every study chapter gets an **✦ Explain with AI** button on the right of its heading.
The page sends that topic's existing explanations, examples, tables, slide notes and L-source IDs, plus a chapter outline, to a Cloudflare Worker. The Worker asks Google's **`gemini-3.8-flash`** using **`thinkingConfig.thinkingLevel = "HIGH"`**. There are three exploration modes (simpler explanation, more examples, deeper mechanism), plus follow-up questions. Generated text is treated as plain text to prevent script injection.

## Why a Worker?

**GitHub Pages cannot read GitHub Actions secrets at runtime.** Shipping `GEMINI_API_KEY` in JavaScript would expose it to everybody. The workflow securely sends your GitHub secret to a Cloudflare Worker during deployment. The Worker stores it as a server-side secret. This adds a separate Cloudflare deployment, but keeps the key out of the HTML/browser and GitHub repository.

## One-time activation

1. Create a Gemini API key in Google AI Studio and a Cloudflare account with Workers enabled.
2. In your **studyshit GitHub repo → Settings → Secrets and variables → Actions → New repository secret**, add three secrets:
   * `GEMINI_API_KEY`: your Gemini API key.
   * `CLOUDFLARE_API_TOKEN`: a Cloudflare API token permitted to edit Workers on your account.
   * `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
3. In GitHub **Actions → Deploy Study AI Worker → Run workflow**. The workflow can also run automatically when `ai-worker/**` changes. The logs should print a deployment URL like `https://studyshit-ai.<your-workers-subdomain>.workers.dev`. **Do not copy a secret into any page.**
4. Open any published `study.html`, click **✦ Explain with AI**, and paste the *Worker URL* into the one-time setup input. Click **Connect AI service**. The URL is saved in that browser's localStorage and reused across chapters.
5. Test **Explain simply**, **More examples**, **Go deeper** and a follow-up question. If you want to switch the endpoint, use **Change AI service URL** inside the panel.

If you use a custom GitHub Pages domain instead of `https://creativeidiot123.github.io`, change `ALLOWED_ORIGINS` in `ai-worker/wrangler.toml` and deploy again. Comma-separated exact HTTPS origins are allowed.

## API usage and security

* The Gemini key exists only in GitHub Actions secrets and the Worker's server-side secret. Never put it in public HTML, URL parameters, `portal/catalog.json`, or browser storage.
* Requests are sent **only when the user opens the AI panel or clicks a mode/Ask**. Normal notes, quizzes, calculators, printing and offline reading work without this service. Your selected topic's text is sent to Google; don't add private material to a public study chapter.
* The Worker accepts the GitHub Pages origin, caps payload size, limits requests to about **6 per IP per minute per Cloudflare location**, and returns no-store responses. This is **not strong authentication**: Origin can be spoofed outside a browser and Cloudflare's rate limit is approximate. A publicly discoverable endpoint can still consume API quota. Configure Google API quota/budget alerts; for stronger public abuse protection add Cloudflare Turnstile or Access.
* Gemini usage is subject to your Google API quota and pricing. HIGH thinking may cost more or respond more slowly.
* The model can make mistakes. Check assessed facts, calculations, and lecture-specific claims against the original chapter.
* Health check: open `https://studyshit-ai.<your-subdomain>.workers.dev/health`. It reports `gemini-3.8-flash`, but not secret status. A successful deployment and a real topic explanation are the functional tests.

## Integration for future chapters

Each lecture file `subjects/<subject>/lectures/<lecture>/study.html` must contain exactly one:

```html
<script defer src="../../../../portal/explain-ai.js"></script>
```

The script automatically loads `portal/explain-ai.css` and creates the right-aligned button for each `section.topic` with an H2 and a `topic-...` ID. Keep it **outside the core `study-js` block** so the original no-network study interactions stay independent. Edit only the shared files to improve the AI interface in every chapter.
