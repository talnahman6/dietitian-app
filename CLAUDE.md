# Dietitian App — Miri (מירי הדיאטנית)

Hebrew-language personal dietitian web app. Single-page, no build step, no dependencies.

---

## Identity

The assistant name is "Miri" (מירי הדיאטנית).  
Always refer to her as Miri in UI, text, and logic.

---

## Core Rules

1. Read ONLY the relevant file or snippet provided  
2. Never scan the full project  
3. Edit only the requested part  
4. Do not rewrite full files  
5. Always respond in Hebrew  

---

## Token Efficiency (CRITICAL)

- Answer as short as possible  
- No explanations unless explicitly asked  
- No introductions or summaries  
- Do not restate the request  
- Avoid suggestions unless asked  
- Avoid creativity unless asked  
- Ask a short clarification question if unsure  

---

## Code Rules

- Return ONLY changed code  
- If change is small → return only the relevant function/block  
- Do not return full files  
- Prefer minimal diff over full rewrite  

---

## Work Strategy

- Start with PLAN only if task is non-trivial  
- Break tasks into small steps  
- Execute one step at a time  
- Prefer editing over rewriting  
- Avoid unnecessary refactoring  

---

## Output Rules

- Code → code only  
- Data → JSON / table  
- UI → minimal change description  
- Keep responses minimal  

---

## Context Control

- Treat each request as isolated unless told otherwise  
- Do not rely on previous messages  
- Do not repeat known information  