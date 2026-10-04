# fill-suggestion

A Claude Code mod. When Claude Code suggests your next message, this types it
into the prompt box as a normal draft, so you only press Enter (or edit it
first) instead of pressing Tab and then Enter. It never sends anything by itself
and leaves the box alone if you've already started typing.

- `/autofill off`: go back to the grey suggestion
- `/autofill on`: turn it back on
- `/autofill`: switch between the two (remembered across sessions)

## Installing it everywhere

`install.sh` is self-contained: it writes the mod into `~/.claude/skills/fill-suggestion/`,
and Claude Code loads plugins from that folder in every session, in any repo.

- **Claude Code on the web / phone:** paste the whole of `install.sh` into your cloud
  environment's **Setup script** (the environment menu in the session's title bar,
  then Edit). Every new session in that environment then has the mod.
- **Your own computer:** run `bash claude-mods/fill-suggestion/install.sh` once.

It is kept here, outside `.claude/skills/`, so a session on this repo doesn't load a
second copy next to the installed one. After changing `hooks/register.ts`, rebuild
`install.sh` so it carries the new code.

## Checking it

```
claude plugin validate claude-mods/fill-suggestion
claude plugin test claude-mods/fill-suggestion
```
