# Porterful Parent Directory — Diagnostic Script Policy

**Date:** 2026-04-30  
**Reason:** Cleanup of untracked diagnostic scripts containing hardcoded Supabase service role keys

---

## Rule

1. **NEVER commit diagnostic scripts** that contain API keys, service role keys, or any secrets.
2. **NEVER hardcode secrets** in `.mjs`, `.js`, `.ts`, or any script file.
3. **Always use `.env.local`** or environment variables for keys.
4. **Always store diagnostics** in a dedicated folder (e.g., `scripts/diagnostics/`) with its own `.gitignore` entry.
5. **Always delete temporary diagnostics** after use. Do not leave them in the parent directory.

## What Happened Today

Eight untracked `.mjs` files were created in the parent directory (`~/Documents/Porterful/`) for Supabase diagnostics. All contained the service role key in plaintext. They have been deleted.

## The Closeout Doc Was Saved

`docs/PORTERFUL_SESSION_CLOSEOUT_2026-04-30.md` contains the valuable diagnostic findings. It has NO secrets.

## If You Need Diagnostics in the Future

```bash
# Create a dedicated folder
mkdir -p scripts/diagnostics

# Add to .gitignore
echo "scripts/diagnostics/" >> .gitignore

# Use .env.local for keys
# Never hardcode keys in scripts
```

---

*Policy note created after cleanup. No secrets remain in parent directory.*
