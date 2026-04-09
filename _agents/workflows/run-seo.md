---
description: Run the complete SEO Domination System on the local workspace
---

# Local SEO Engine Workflow

When the user triggers this `/run-seo` workflow, you are acting as the autonomous Local SEO Execution Engine. Your job is to read their local project files and update them strictly based on SEO best practices.

## Phase 1: Reconnaissance
Use your `list_dir` or `grep_search` tools to locate the primary interface files of the website (e.g., `index.html`, `page.tsx`, `Layout.jsx` or similar routing files). Find the core templates where the page copy and `<head>` metadata live.

## Phase 2: SEO Audit (The Content Gap)
For the main pages you discovered:
1. First, use `view_file` to read your exact agent instructions from `c:\Users\dusti\OneDrive\Desktop\SEO_AUTOMATION_SYSTEM\agents\seo_audit_agent.json`.
2. Following those instructions, read the current text and structure of the client files.
3. Identify missing sections (warranties, FAQs) and audit the `<title>`, `<h1>`, and meta descriptions.

## Phase 3: The SEO Rewrite 
Use your file editing tools (`replace_file_content` or `multi_replace_file_content`) to actively optimize the code:
1. Use `view_file` to read your exact agent instructions from `c:\Users\dusti\OneDrive\Desktop\SEO_AUTOMATION_SYSTEM\agents\seo_rewrite_agent.json` and `c:\Users\dusti\OneDrive\Desktop\SEO_AUTOMATION_SYSTEM\agents\onpage_agent.json`.
2. Inject or replace optimized `<title>` and `<meta name="description">` tags.
3. Format the headings hierarchy correctly (`H1` -> `H2` -> `H3`).
4. Add any necessary structural HTML tags.

## Phase 4: Schema Injection
1. Use `view_file` to read you exact agent instructions from `c:\Users\dusti\OneDrive\Desktop\SEO_AUTOMATION_SYSTEM\agents\schema_agent.json`.
2. Find the appropriate root file (like an `index.html` or `_app.tsx` / `RootLayout`) and inject standard Local Business or Professional Service JSON-LD Schema markup into the `<head>` to build entity authority.

## Phase 5: Verification & Walkthrough
Once you have modified the files, generate a concise summary reporting:
- Which files were edited.
- The new Title/Meta Description pairs.
- Any Schema.org updates that were added.
