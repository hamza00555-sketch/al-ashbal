# Setup — GPT Image 2 skill

This skill lets Claude Code generate and edit images with OpenAI's GPT Image 2
via Fal AI. It's strongest for images where text must be legible — posters,
social cards, logos, packaging, menus, and Arabic/multilingual designs.

For photoreal or general art, the Higgsfield image generator is usually the
better choice; reach for this skill when correct, crisp lettering matters.

## One-time setup

1. **Create a Fal AI key:** https://fal.ai/dashboard/keys
2. **Provide the key** as `FAL_KEY`. Two options:
   - Preferred (web sessions): set `FAL_KEY` as an environment variable in your
     Claude Code environment configuration. Nothing secret gets committed.
   - Local: copy `.env.example` to `.env` and paste the key. `.env` is
     git-ignored, so it will not be committed.
3. That's it — no SDK or build step. The skill uses a plain HTTPS POST.

## Quick test (once the key is set)

> Generate a poster headline reading "الأشبال" in bold modern Arabic lettering.

## Notes

- Auth header is `Key`, not `Bearer` (Fal-specific) — the skill handles this.
- Default quality is `medium` (~$0.05/image). Use `high` only for finals.
- No true transparent backgrounds — chain a background remover if you need alpha.
