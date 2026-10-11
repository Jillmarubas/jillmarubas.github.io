"""Writes lines.json: the user's script (Cowork research doc, 10 Oct 2026) with the one fix in
VERIFY.md (#15), one row per line. `say` is narration; `show` is the shot plan."""
import json, os
S = []
def seg(key, title, rows): S.append({'key': key, 'title': title, 'lines': [{'say': a, 'show': b} for a, b in rows]})

seg('hook', 'HOOK', [
 ("ChatGPT just stopped answering only in text.", "Laptop swings in; a text-only answer collapses."),
 ("Ask it to split a dinner bill, and it can build a working bill splitter inside the chat.", "Bill splitter widget builds itself in the chat."),
 ("This started rolling out on October seventh, and Free users are included.", "Date chip OCT 7; FREE badge."),
 ("Today I'll explain what changed. Then I'll show you how to use it, step by step.", "EXPLAIN / SHOW cards."),
])
seg('preview', 'THE PLAN', [
 ("Here's the plan. Part one is GPT six and a feature called Intelligent UI.", "Roadmap node 1."),
 ("Part two is a speed change, where answers start before the thinking ends.", "Node 2."),
 ("Part three is audio uploads, for meetings and lectures.", "Node 3."),
 ("Part four is a quick one for Codex users.", "Node 4."),
])
seg('p1a', 'PART 1 · INTELLIGENT UI', [
 ("On October seventh, OpenAI brought GPT six to the Chat tab in ChatGPT. With it comes Intelligent UI.", "Part card; Chat tab lights; GPT-6 chip."),
 ("Until now, almost every answer was text. Now ChatGPT can mix text, visuals and interactive parts in one answer. OpenAI lists graphics, tappable buttons, forms and charts.", "Text answer morphs; four building blocks."),
 ("ChatGPT picks the format based on your question. Comparing two phones? You may get them side by side. Asking how something works? You may get a diagram to explore. Simple question? You still get plain text.", "Three question → format pairs."),
 ("Who gets it? The rollout started on October seventh for Plus, Pro, Business and Enterprise. OpenAI said Free and Go would follow, starting October eighth. It is a rollout, so it may not be on your account yet.", "Plan timeline Oct 7 / Oct 8."),
 ("Plus, Pro, Business and Enterprise use GPT six Sol. Free and Go use GPT six Luna.", "Two model cards Sol / Luna."),
 ("Why does this matter? Some answers are easier to see than to read. A plan is easier to follow when you can see how it fits together.", "Wall of text vs a visual plan."),
])
seg('p1b', 'TRY INTELLIGENT UI', [
 ("Here's how to try it.", "Fly into the laptop: ChatGPT in the browser."),
 ("Step one. Open ChatGPT and make sure you are in the Chat tab.", "STEP 1; Chat tab clicked."),
 ("Step two. Ask for a tool, not an essay. A bill splitter is a good first test.", "STEP 2; prompt typed."),
 ("Step three. Use what it builds. If ChatGPT gives you a tool, change the numbers and see what happens.", "STEP 3; cursor changes friends 5→6; amount updates."),
 ("Step four. Now try a learning question. OpenAI's own example explains a seven-speed bike as a diagram you can explore.", "STEP 4; bike diagram with tabs to explore."),
 ("Step five. Try a plan. OpenAI says road trip stops can appear on a map.", "STEP 5; map with stops."),
 ("Two tips. First, ChatGPT chooses the format. If you get plain text, it may have judged text to be the best answer. Or the rollout hasn't reached you yet.", "Tip 1 card."),
 ("Second, Intelligent UI works from Instant up to Extra High reasoning. The Pro reasoning option does not support it. So if you use Pro reasoning, switch levels first.", "Reasoning picker; Pro crossed."),
])
seg('p2a', 'PART 2 · ANSWERS START SOONER', [
 ("Part two is about waiting.", "Part card; spinner."),
 ("With reasoning models, you had to wait for the thinking to finish before you saw an answer.", "Old: long thinking bar, then answer."),
 ("GPT six doesn't make you wait like that. It starts writing while it is still thinking or using tools. More findings get added as it goes, and you don't have to ask again. So you can read the first part early.", "New: answer streams beside thinking."),
 ("OpenAI gives one number, for questions that need a web search. On average, the first words arrive forty-four percent sooner with GPT six Instant than with GPT five point six Instant. That is OpenAI's own measurement.", "Bar race: 44% sooner; source label."),
])
seg('p2b', 'SEE IT YOURSELF', [
 ("Step one. Ask a question that needs fresh information.", "STEP 1; Penang prompt typed."),
 ("Step two. Watch the top of the answer. The first lines may appear while ChatGPT is still working.", "STEP 2; first lines appear while searching."),
 ("Step three. Keep reading as more arrives. You don't need to send a second prompt. Let it finish.", "STEP 3; more sections append."),
])
seg('p3a', 'PART 3 · AUDIO UPLOADS', [
 ("Part three landed on October sixth. You can now upload audio files to ChatGPT.", "Part card; audio file flies into chat."),
 ("It can write a transcript, summarize the recording, and answer questions about it. Think meetings, interviews and lectures.", "Three outputs; three use cases."),
 ("This one is for paid ChatGPT subscriptions and workspaces. It is not on the Free plan right now.", "Paid ✓ / Free ✕."),
 ("Files can be up to five hundred twelve megabytes. It accepts common formats like MP3, WAV, M4A and FLAC. Files identified as video are not supported, so use an audio-only file.", "512 MB gauge; format chips; video ✕."),
])
seg('p3b', 'RECORDING TO NOTES', [
 ("Step one. Start a new chat and attach your audio file.", "STEP 1; attach file."),
 ("Step two. Say what you want.", "STEP 2; prompt."),
 ("Step three. Ask a follow-up question about the recording.", "STEP 3; follow-up."),
 ("Step four. Turn it into something you can send.", "STEP 4; email draft."),
 ("Step five. Check it. OpenAI warns that transcripts can have mistakes, and accuracy can vary by language. Check names, numbers and dates against the recording.", "STEP 5; checklist over transcript."),
])
seg('p4a', 'PART 4 · CODEX PREDICTIONS', [
 ("Part four is a small one for Codex users.", "Part card."),
 ("On October ninth, OpenAI added Composer predictions, in beta. After Codex replies, it may suggest your next message in the message box.", "Codex reply, ghost suggestion."),
 ("It is for personal ChatGPT Pro users aged eighteen and older, in the latest Codex desktop app. It works in local and SSH threads using GPT six Astra or GPT six point one Sol.", "Eligibility checklist."),
 ("While it is in beta, the suggestions themselves are free. They don't use your Codex limits or credits. Anything you send still counts as normal.", "Free suggestions vs metered sends."),
])
seg('p4b', 'USE IT OR SWITCH IT OFF', [
 ("Step one. Update the Codex desktop app to the latest version.", "STEP 1; update."),
 ("Step two. Send a message and wait for the reply. A suggestion may appear in the message box.", "STEP 2; ghost text."),
 ("Step three. Press Tab to accept it. Accepting does not send it. Read it, edit it, then send.", "STEP 3; Tab keycap; text fills; edit."),
 ("Step four. Don't want it? It is on by default, so turn it off in settings.", "STEP 4; Settings › General › Composer toggle off."),
])
seg('wrap', 'YOUR TO-DO LIST', [
 ("So here's your to-do list. One. Ask ChatGPT for a tool, like a bill splitter. Two. Ask it to explain something with parts you can tap. Three. If you are on a paid plan, upload one recording and ask for notes. Four. Check every transcript against the audio. Five. Codex users on Pro, press Tab on a prediction, or switch it off.", "Checklist ticks."),
 ("ChatGPT is moving from writing answers to building them.", "'writing' morphs to 'building'."),
])
seg('outro', 'OUTRO', [
 ("If this helped, like and subscribe for AI news, explained and shown step by step.", "Like + subscribe clicks."),
 ("And tell me in the comments: what is the first tool you will ask ChatGPT to build? See you in the next one.", "Comment bubble; end card."),
])
json.dump(S, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lines.json'), 'w'), indent=1, ensure_ascii=False)
print(len(S), 'chapters', sum(len(s['lines']) for s in S), 'lines')
