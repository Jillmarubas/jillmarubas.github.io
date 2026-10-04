#!/bin/bash
# Installs the fill-suggestion Claude Code mod for this user, so every session
# loads it from ~/.claude/skills/. Self-contained: paste it into a cloud
# environment's setup script, or run it once on any machine. Safe to re-run.
set -e
D="$HOME/.claude/skills/fill-suggestion"
mkdir -p "$D/.claude-plugin" "$D/hooks"

cat > "$D/.claude-plugin/plugin.json" <<'EOF_MOD'
{
  "name": "fill-suggestion",
  "version": "0.1.0",
  "description": "Types Claude's suggested next message into the prompt box for you; press Enter to send it or edit it first"
}
EOF_MOD

cat > "$D/hooks/hooks.json" <<'EOF_MOD'
{ "modules": ["./register.ts"] }
EOF_MOD

cat > "$D/hooks/register.ts" <<'EOF_MOD'
import type { EngineInterface, Register } from 'claude-code'

async function isEnabled($: EngineInterface) {
  return ((await $.store.get('enabled')) ?? true) === true
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'autofill',
      description: 'Turn typing suggested messages into the prompt box on or off',
    })

    return next(e)
  })

  on('command.run', { command: 'autofill' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const isOn = arg === 'on' ? true : arg === 'off' ? false : !(await isEnabled($))
    await $.store.set('enabled', isOn)

    return { text: `Auto-fill suggestions is ${isOn ? 'on' : 'off'}.` }
  })

  // Instead of the dim suggestion that needs Tab, put the text in the box as
  // a real draft: Enter sends it, or edit it first. Never touches a box you
  // have already typed in, and never sends anything by itself.
  on('prompt.suggest', async ($, e, next) => {
    if (e.origin.kind !== 'suggestion' || !(await isEnabled($))) {
      return next(e)
    }
    const box = await $.prompt.read()
    if (box.text.trim() !== '') {
      return next(e)
    }
    const filled = await $.prompt.fill({ text: e.text })

    return filled.isFilled ? { isShown: false } : next(e)
  })
}
EOF_MOD

echo "fill-suggestion mod installed in $D"
