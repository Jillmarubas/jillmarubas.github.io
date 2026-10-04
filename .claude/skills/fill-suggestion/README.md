# fill-suggestion

A Claude Code mod. When Claude Code suggests your next message, this types it
into the prompt box as a normal draft, so you only press Enter (or edit it
first) instead of pressing Tab and then Enter. It never sends anything by itself
and leaves the box alone if you've already started typing.

- `/autofill off`: go back to the grey suggestion
- `/autofill on`: turn it back on
- `/autofill`: switch between the two (remembered across sessions)

## Loading it

It sits in this project's `.claude/skills/` folder, which Claude Code loads
plugins from, so it should load by itself in a session opened on this repo.
If it doesn't, load it by hand from the repo root:

```
claude --plugin-dir .claude/skills/fill-suggestion
```

## Checking it

```
claude plugin validate .claude/skills/fill-suggestion
claude plugin test .claude/skills/fill-suggestion
```
