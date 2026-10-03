"""Writes lines.json: the user's script with the three fixes in VERIFY.md, one row per line.
`say` is narration; `show` is the shot plan."""
import json, os
S = []
def seg(key, title, rows): S.append({'key': key, 'title': title, 'lines': [{'say': a, 'show': b} for a, b in rows]})

seg('hook', 'HOOK', [
 ("What if you could add your own features to your AI coding assistant just by describing them?", "3D laptop swings in; terminal prompt; words 'your own features' orange."),
 ("Not someday. Today.", "'Not someday.' struck through by a drawn line; 'Today.' slams in with a date chip."),
 ("Claude Code just got mods.", "Claude mark spins in with rings and burst; 'MODS' title."),
 ("In this video, I'll explain what changed, and then I'll show you exactly how to use each new feature, step by step.", "Two cards EXPLAIN / SHOW; step dots."),
])
seg('preview', 'THE PLAN', [
 ("Here's the plan. We'll build your first mod.", "Roadmap line draws; node 1 puzzle piece."),
 ("Then we'll switch between the two new models,", "Node 2: two model chips."),
 ("claim your free cloud credit before it expires,", "Node 3: cloud + credit + clock."),
 ("audit your setup,", "Node 4: clipboard scan."),
 ("and turn on a hidden helper most people don't know exists.", "Node 5: hidden eye revealed."),
 ("By the end, you'll know what's new and how to use all of it.", "All nodes tick; camera pulls back."),
])
seg('p1a', 'PART 1 · MODS', [
 ("Let's start with the biggest change.", "Part card 01 MODS."),
 ("A mod is a small piece of TypeScript code inside a plugin that hooks directly into Claude Code.", "Diagram: mod.ts inside plugin box, hook cable plugs into Claude Code."),
 ("It can pause or rewrite a tool call, draw new interface elements, add a new command, or even replace a built-in feature completely.", "Four capability tiles, each animating."),
 ("And the best part? You don't write the code.", "Code lines dissolve; kinetic line."),
 ("You describe what you want, and Claude writes the mod for you.", "Speech bubble → Claude mark → mod.ts writes itself."),
])
seg('p1b', 'BUILD YOUR FIRST MOD', [
 ("Here's how to do it.", "Camera flies into the laptop."),
 ("Step one. Make sure you're on version two point one point two eight seven or later.", "STEP 1; type `claude --version`; version circled."),
 ("Mods work in both the terminal and the desktop app, but only from that version onward.", "Terminal + desktop chips; version gate."),
 ("Step two. Describe the feature you want in plain English.", "STEP 2; prompt box focus."),
 ("Lydia's example is a perfect first project. She wanted to see her context window without typing slash context every time.", "Lydia name card; /context panel repeating."),
 ("So she asked for this:", "Prompt typed; key words light orange."),
 ("Step three. Let Claude work. It writes the mod and loads it straight into your session.", "STEP 3; Claude writes file, loads mod."),
 ("Step four. Test it. Type slash context bar, and a colored bar appears above your prompt. Type it again to hide it.", "STEP 4; /context-bar toggles stacked bar."),
 ("That's a brand new feature, built in one sentence.", "1 sentence = 1 feature."),
 ("Now think about what you'd want. A shortcut for something you type fifty times a day. A piece of UI you wish existed.", "Idea cards: keycap x50/day; UI wireframe draws."),
 ("If you get stuck, Anthropic has sample mods on GitHub you can copy and change.", "Repo card claude-code-playground/claude-code/mods."),
])
seg('p2', 'PART 2 · WRAP-UP ALLOWANCE', [
 ("Part two is a quick explainer, because there's nothing to set up.", "Part card 02; 'no setup' badge."),
 ("Claude Code has a five-hour usage limit.", "5-hour ring meter fills."),
 ("Before, if you hit it in the middle of a task, Claude stopped right there, sometimes halfway through editing your code.", "Half-written code cut off; LIMIT stamp."),
 ("Now it uses a small, fixed amount from your weekly limit to finish what it was doing.", "Slice moves from weekly bar; task completes."),
 ("On Pro, that happens once a week. On Max and Team Premium, it happens every time you hit the limit.", "Plan rows: Pro 1/week; Max + Team Premium every time."),
 ("No more broken, half-finished changes.", "Code completes, green check."),
])
seg('p3', 'PART 3 · OPUS + SONNET 5.5', [
 ("Next, two new models.", "Part card 03; two chips."),
 ("Opus five point five is now the default.", "Model picker: Opus 5.5 (default)."),
 ("Anthropic says it performs at roughly Fable five point one level on most work,", "Fable 5.1 ≈ Opus 5.5."),
 ("runs more than thirty percent faster than Opus five, and costs forty percent less.", "Speed +30%+, cost -40% bars."),
 ("It also gives shorter replies and sticks closer to what you asked.", "Long reply shrinks; target."),
 ("Sonnet five point five is more than thirty percent faster than Sonnet five and uses far fewer tokens per task.", "Sonnet speed; token stack shrinks."),
 ("It's best for well-defined jobs, like fixing a bug you can already reproduce.", "Bug + repro checklist."),
 ("Here's how to switch. To use Sonnet, type slash model sonnet.", "Terminal /model sonnet."),
 ("My rule of thumb: big, open-ended work stays on Opus. Small, clear tasks go to Sonnet, so you save your usage.", "Task sorting lanes."),
])
seg('p4', 'PART 4 · FREE CREDIT', [
 ("Part four is free credit, and there are deadlines.", "Part card 04; deadline tag."),
 ("Cloud sessions are now out of research preview and included in your plan.", "Preview badge peels; included."),
 ("If you're an existing Pro or Max subscriber, you also get a one-time bonus credit. One hundred dollars on Pro. Two hundred fifty dollars on Max.", "Credit cards $100 / $250."),
 ("Cloud sessions spend this credit first, before your regular usage.", "Credit bucket drains first."),
 ("Here's how to get it. Open Claude Code and type slash claim credit. Do it by October seventh, or it's gone.", "Terminal /claim-credit; Oct 7 calendar."),
 ("There's a second freebie. Five-hour limits went up by twenty percent for everyone, and every Pro, Max, and Team user got one full limit reset.", "Meter +20%; reset arrow."),
 ("To find it, go to Settings, then Usage. Use it by October twenty-second.", "Settings › Usage click path; Oct 22 calendar."),
])
seg('p5', 'PART 5 · PROMPT-AUDIT', [
 ("Part five. With two new models in ten days, some of your old instructions might now be working against you.", "Part card 05; 10-day bracket; old rules pull back."),
 ("That's what prompt-audit is for. Type slash checkup prompt-audit.", "Terminal /checkup prompt-audit."),
 ("Claude reads your CLAUDE.md files, skills, agents, and custom commands.", "Four file cards scanned."),
 ("It flags instructions written for older models, file paths that no longer exist, and rules that contradict each other.", "Three flags."),
 ("Here's what I like about it. It doesn't change anything by itself. It writes a report and a patch file.", "Lock; report.md + changes.patch."),
 ("You read the report, then decide which fixes to apply.", "Checklist toggles."),
 ("If you've been using Claude Code for a while, run this today.", "Kinetic: run it today."),
])
seg('p6', 'PART 6 · YOU SHOULD KNOW', [
 ("Part six is a hidden helper. It's a built-in mod called You should know.", "Part card 06; name revealed."),
 ("Once it's on, a small side agent reads along while Claude works.", "Side agent scans the log."),
 ("When it spots something you or Claude might have missed, it gives you a heads up.", "Heads-up notice pops."),
 ("To turn it on, type this command.", "Terminal /plugin enable …"),
 ("It's also a great mod to study if you want ideas for building your own.", "Magnifier over the mod."),
])
seg('p7', 'PART 7 · EVALS', [
 ("Part seven is for people building apps on the Claude API.", "Part card 07; API badge."),
 ("An eval is a test that gives you a number, so you know if your app is actually getting better.", "Test → score → versions."),
 ("Claude Code can now build one for you. Ask it the question you want answered.", "Terminal build-eval."),
 ("It interviews you, pulls real examples from your tickets and codebase, picks a grader, and runs a baseline once you approve.", "Four-step pipeline."),
 ("Then tell it what to improve.", "Terminal hillclimb."),
 ("It changes your prompts, skills, or model one step at a time, and undoes anything that only helps on the training cases.", "Hill-climb steps; overfit step reverted."),
])
seg('p8', 'PART 8 · PUBLISH', [
 ("Part eight. Once you've built something good, you can now publish it to the Claude directory.", "Part card 08; plugin into directory."),
 ("Anthropic's new developer portal lets you point it at your code repository, watch your plugin go through review, and pick when it goes live.", "Repo → review → live."),
 ("And it reaches everyone using Claude, not just Claude Code users.", "Audience rings expand."),
])
seg('p9', 'PART 9 · PRO TIPS', [
 ("Two quick tips from inside Anthropic.", "Part card 09."),
 ("Doug Safreno got tired of long, vague review lists.", "Doug card; 15 vague items."),
 ("Now he asks Claude for one outstanding item at a time, in rough priority order, ending with a simple A-or-B question. He moves through them much faster.", "One card at a time; A/B buttons."),
 ("Andrew Edstrom's session kept being too cautious.", "Andrew card; tiny steps, stops."),
 ("So he had Claude read a colleague's write-up of a big, bold project. The next morning, he woke up to one hundred thirty-three pull requests.", "Write-up read; night→morning; 133 PRs."),
 ("The lesson: don't just tell Claude to be bold. Show it what bold looks like.", "Tell ✕ / Show ✓."),
])
seg('wrap', 'YOUR TO-DO LIST', [
 ("So here's your to-do list. Build a mod with one sentence. Switch to Sonnet for small tasks. Claim your credit by October seventh. Use your limit reset by October twenty-second. Run prompt-audit. And turn on You should know.", "Checklist ticks per item."),
 ("Claude Code is turning from a tool you use into a tool you shape.", "'use' morphs to 'shape'."),
])
seg('outro', 'OUTRO', [
 ("If this helped, hit like and subscribe for daily AI news, explained and shown step by step.", "Cursor clicks like + subscribe."),
 ("And tell me in the comments: what's the first mod you're going to build? See you in the next one.", "Comment bubble; end card."),
])
json.dump(S, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lines.json'), 'w'), indent=1, ensure_ascii=False)
print(len(S), 'chapters', sum(len(s['lines']) for s in S), 'lines')
