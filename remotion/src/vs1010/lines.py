"""Writes lines.json: "ChatGPT vs Claude vs Gemini: What Each One Is Best At" (AI News, 10 Oct 2026).
A feature-and-price comparison from official pages only (VERIFY.md); no hands-on test claims.
Chapters with kind 'host' are Asher on camera (the user lip-syncs them in ElevenLabs); kind 'demo'
is narration over MacBook screens drawn in Remotion. `say` is narration; `show` is the shot plan."""
import json, os
S = []
def seg(key, kind, title, rows): S.append({'key': key, 'kind': kind, 'title': title, 'lines': [{'say': a, 'show': b} for a, b in rows]})

seg('h00', 'host', 'HOOK', [
 ("ChatGPT, Claude and Gemini all cost about twenty dollars a month.", "Asher at the desk, front camera."),
 ("All three can chat, search the web, read your files and do deep research.", "Three logos pop in beside him."),
 ("So which one should you actually use? And which one should you pay for?", "Push in."),
 ("That's what this video is about. No hype, no sponsor. Just what each one is built for, what it costs, and who it's for, straight from their own pages, as of October tenth.", "OCT 10 2026 · official pages chip."),
 ("By the end, you'll know exactly which one fits you.", "Hold on Asher."),
])

seg('h01', 'host', 'THE PLAN', [
 ("Here's the plan.", "Asher, front camera."),
 ("First, a quick look at all three and the models behind them. Then every price, from free to five hundred dollars a month.", "Roadmap appears in the corner."),
 ("Then nine rounds: everyday answers, writing and documents, research, images and video, coding, working with your apps, big files, voice, and privacy.", "Nine round chips."),
 ("In every round, I'll also show you a prompt you can copy and try yourself, in any of the three.", "Prompt card flips."),
 ("And at the end, my pick for you, based on how you work. Let's go.", "Cut to the MacBook."),
])

seg('d02', 'demo', 'MEET THE THREE', [
 ("Let's start with who's who.", "MacBook; three app icons in the dock."),
 ("ChatGPT is made by OpenAI. Three days ago, on October seventh, it moved to GPT six. Paid plans get GPT six Sol, and Free and Go get GPT six Luna.", "ChatGPT window; GPT-6 Sol / Luna chips."),
 ("The headline feature is Intelligent UI. Answers can now mix text with visuals and parts you can tap, like a bill splitter or a map, right in the chat.", "Bill-splitter widget from the last video."),
 ("Claude is made by Anthropic. In the last three weeks it got a whole new family of models. Opus five point five on September twenty-second, Sonnet five point five on September twenty-eighth, and Haiku five point five on October seventh.", "Claude window; three model chips land on a timeline."),
 ("Opus is the most capable. Sonnet is faster and cheaper. Haiku is the smallest and fastest.", "Chips sort by size."),
 ("Gemini is made by Google. Its top model in the app is Gemini three point one Pro, and Google says it handles up to a million tokens of context. That's well over a thousand pages of text at once.", "Gemini window; 1M tokens counter; stack of pages."),
 ("And Gemini lives inside Google's apps, like Gmail, Docs and Drive.", "Gmail, Docs, Drive icons orbit."),
 ("One thing before we compare. These apps change almost every week. Everything you'll see here comes from each company's own pricing and help pages, checked on October tenth. Links are in the description.", "Sources card."),
])

seg('d03', 'demo', 'EVERY PRICE', [
 ("Now the money. All prices are in US dollars, per month. Some countries pay a local price.", "Price table builds: three columns."),
 ("All three have a free plan. We'll come back to those in a second.", "FREE row: $0 $0 $0."),
 ("Then there's a cheap tier. ChatGPT Go is eight dollars. Google AI Plus is four ninety-nine. Claude doesn't have one. It goes straight from free to Pro.", "Cheap row: Go $8, AI Plus $4.99, Claude dash."),
 ("ChatGPT Go gets more messages, uploads, images and voice chats than Free, and a longer memory. But OpenAI says Go may show ads.", "Go card; ADS tag."),
 ("Google AI Plus gets you two times the Free usage, video generation, Gemini inside Gmail, and four hundred gigabytes of Google storage.", "AI Plus card; 400 GB."),
 ("Then the main tier, the one most people pay for. ChatGPT Plus is twenty dollars. Claude Pro is twenty dollars, or seventeen a month if you pay for a year. And Google AI Pro is nineteen ninety-nine.", "Main row: $20, $20 ($17/yr), $19.99."),
 ("So at the main tier, the price is basically the same. The difference is what you get.", "The three $20s line up."),
 ("ChatGPT Plus adds advanced reasoning, more deep research, projects, scheduled tasks, custom GPTs, and more Codex for coding. And Plus is the first ChatGPT plan with no ads.", "Plus card ticks."),
 ("Claude Pro adds Claude Code, Research, the bigger Opus model, Claude in Chrome and Microsoft three sixty-five, and you can hand off and schedule tasks.", "Pro card ticks."),
 ("Google AI Pro adds four times the Free usage, the one-million-token context window, more video, Jules for coding, and five terabytes of storage. It also includes YouTube Premium Lite.", "AI Pro card ticks; 5 TB."),
 ("And then there are the power tiers.", "Power row slides up."),
 ("ChatGPT Pro comes in three sizes: one hundred, two hundred or five hundred dollars a month. Only the five hundred dollar plan gets Ultrafast.", "Pro 100 / 200 / 500."),
 ("Claude Max comes in two: one hundred dollars for five times Pro's usage, or two hundred for twenty times. Both now include the same amount in monthly API credits.", "Max 5x $100, Max 20x $200; API credit chip."),
 ("And Google AI Ultra starts at ninety-nine ninety-nine for five times Pro's usage, or one ninety-nine ninety-nine for twenty times, with first access to Deep Think.", "Ultra $99.99 / $199.99."),
 ("Unless you use AI all day for work, you don't need a power tier. Start free, and upgrade only when you hit a limit.", "Power row dims; arrow back to FREE."),
])

seg('h03', 'host', 'PRICE VERDICT', [
 ("So on price, it's a tie at the top. Twenty dollars buys you the main plan everywhere.", "Asher, side camera."),
 ("The real difference is at the bottom. Google has the cheapest paid plan, at four ninety-nine. And Claude has no cheap plan at all.", "Asher, front camera."),
])

seg('d04', 'demo', 'THE FREE PLANS', [
 ("Most people start free, so let's look closely at what free gets you.", "Three free columns."),
 ("ChatGPT Free now runs on GPT six Luna, and it gets Intelligent UI too. That rollout started on October eighth. It can search the web, make images and do voice chats, with lower limits than paid plans.", "ChatGPT Free column ticks."),
 ("Two catches. Ads may appear on Free. And some new features, like audio uploads, are only on paid plans for now.", "ADS tag; audio upload locked."),
 ("Claude Free gives you Sonnet and Haiku, the faster models, but not Opus. You get web search, memory across conversations, connected apps, and Artifacts, where Claude builds files, documents and small apps you can use.", "Claude Free column ticks."),
 ("You can make up to five projects. But there's no Claude Code and no Research on Free.", "5 projects; two locks."),
 ("Gemini's free plan is the most generous on paper. You get image creation and editing, Gemini Live for voice, Canvas, Gems, and even Deep Research, all for free.", "Gemini Free column; Deep Research ticks."),
 ("Plus fifteen gigabytes of Google storage, which you probably already have.", "15 GB."),
 ("There's no video generation on free Gemini. That starts with AI Plus.", "Video locked."),
])

seg('h04', 'host', 'FREE VERDICT', [
 ("If you're not paying anything, Gemini's free plan gives you the most features, especially Deep Research.", "Asher, front."),
 ("But ChatGPT Free just got a lot better with GPT six. And Claude Free is great for writing and building documents.", "Asher, side."),
 ("Honestly? Use all three for free. They don't cost anything.", "Asher smiles; front."),
])

seg('d05', 'demo', 'ROUND 1 · EVERYDAY ANSWERS', [
 ("Round one. Everyday answers. The questions you ask ten times a day.", "Round card 1."),
 ("This is where ChatGPT just jumped ahead. With Intelligent UI, an answer isn't only text any more.", "ChatGPT window."),
 ("Ask it to plan a trip, and the stops can show up on a map. Ask how something works, and you can get a diagram to explore. Ask it to compare two things, and they can come side by side.", "Map, diagram, side-by-side widgets."),
 ("And GPT six can start answering while it's still thinking, so the first words show up sooner.", "Text streams while a thinking chip spins."),
 ("ChatGPT also has voice chat, image creation and memory, all on the free plan, with more on paid plans.", "Voice, image, memory icons."),
 ("Gemini is strong here too, especially on your phone. Gemini Live lets you talk to it, and it's free.", "Gemini Live wave."),
 ("And on September thirtieth, Gemini got skills. Those are saved instructions that run on their own when your prompt matches. Google says Gems will move into skills.", "Skill card; Gem icon morphs into skill."),
 ("Claude gives clean, careful answers, with web search and memory on every plan.", "Claude answer."),
 ("But for quick everyday questions, it doesn't have anything like Intelligent UI.", "Plain text answer."),
 ('Try this in all three. Type: Compare three ways to get from the airport to the city center. Show cost, time and comfort.', 'Prompt typed into ChatGPT.'),
 ("In ChatGPT, you may get a side-by-side comparison you can tap. In the others, you'll usually get a table. Same question, different kind of answer.", 'Three answers side by side (illustration).'),
])

seg('h05', 'host', 'ROUND 1 VERDICT', [
 ("Round one goes to ChatGPT. Intelligent UI makes everyday answers easier to use, and it's on the free plan.", "Asher, front; ChatGPT chip lights."),
])

seg('d06', 'demo', 'ROUND 2 · WRITING AND DOCUMENTS', [
 ("Round two. Writing and documents. Emails, reports, slides, anything you'll send to someone else.", "Round card 2."),
 ("This is Claude's home turf. On September sixteenth, Anthropic added Claude Design, Slides and Docs right inside any conversation.", "Claude window; Design / Slides / Docs tabs."),
 ("So you can ask Claude for a deck or a document, and it builds the real thing, not just text you have to paste somewhere.", "A slide deck builds itself."),
 ("And Artifacts, the files and small apps Claude makes, are now on every plan, including Free.", "Artifact panel; FREE badge."),
 ("Projects let you keep your files and instructions in one place, so Claude remembers the context for each piece of work.", "Project sidebar."),
 ("ChatGPT has projects and custom GPTs on Plus. A custom GPT is a version of ChatGPT you set up once for a task you repeat, like writing in your company's style.", "ChatGPT project + custom GPT."),
 ("Gemini's big advantage is where it lives. With Google AI Plus or higher, Gemini works inside Gmail and Google Vids, and it can pull from your Docs and Drive.", "Gemini side panel inside Gmail."),
 ("If your work is already in Google Docs, that saves a lot of copy and paste.", "Doc slides into Gemini."),
 ("Here's a prompt to try. Type: Turn these notes into a one-page plan with a title, three goals and a timeline. Then paste your notes.", 'Prompt typed into Claude.'),
 ('In Claude, add: Make it a document I can download. And watch it build the file instead of just writing text.', 'Docs artifact appears (illustration).'),
 ("The trick that works in all three is the same: say who it's for, how long it should be, and what format you want.", 'WHO · LENGTH · FORMAT chips.'),
])

seg('h06', 'host', 'ROUND 2 VERDICT', [
 ("Round two goes to Claude. Building real documents, decks and designs in the chat is what it's made for.", "Asher, front."),
 ("But if your whole team lives in Google Docs and Gmail, Gemini might save you more time.", "Asher, side."),
])

seg('d07', 'demo', 'ROUND 3 · RESEARCH', [
 ("Round three. Research. When you need a real answer with sources, not a guess.", "Round card 3."),
 ("All three have a deep research mode. You ask a big question, and it searches many sources, reads them, and writes you a report with links.", "Deep research flow: query, sources fan out, report."),
 ("The difference is who gets it.", "Three lock icons."),
 ("Gemini includes Deep Research even on the free plan.", "Gemini lock opens: FREE."),
 ("ChatGPT gives more deep research on Plus, and the most on Pro, together with agent mode.", "ChatGPT: PLUS, PRO max."),
 ("Claude's Research needs Pro or higher. Free users still get normal web search.", "Claude: PRO."),
 ("Gemini also has a big advantage for reading. Its one-million-token context on AI Pro means you can give it a huge pile of documents at once.", "Pile of PDFs drops into Gemini."),
 ("One tip for all three: always click the sources and check the important facts yourself. Research modes can still get things wrong.", "Cursor clicks a source link; CHECK IT tag."),
 ('Try this: Research the best budget laptops for students this year. Compare five, with prices in US dollars, and list your sources.', 'Prompt typed into Gemini Deep Research.'),
 ("Deep research can take several minutes. That's normal. It's reading a lot of pages for you.", 'Progress bar; pages flip.'),
 ('When the report comes back, ask a follow-up, like: Which one has the best battery? Show me where you found that.', 'Follow-up typed.'),
])

seg('h07', 'host', 'ROUND 3 VERDICT', [
 ("Round three goes to Gemini, mainly because Deep Research is free. If you pay, ChatGPT and Claude are both strong too.", "Asher, front."),
])

seg('d08', 'demo', 'ROUND 4 · IMAGES AND VIDEO', [
 ("Round four. Images and video.", "Round card 4."),
 ("Gemini has the most here. Its image model is called Nano Banana. Nano Banana Pro can make images up to four K, keep up to five people looking consistent, and write clear text inside the image.", "Gemini image grid; 4K chip; 5 faces."),
 ("Every image and video Google makes carries an invisible SynthID watermark, and you can even upload an image and ask Gemini if Google AI made it.", "SynthID scan line."),
 ("For video, Google AI Plus and Pro can generate short videos, and Ultra gets the full Veo three point one.", "Video player; Veo 3.1 chip."),
 ("ChatGPT makes images on every plan, with more on Go and Plus, and the most and fastest on Pro.", "ChatGPT image generation."),
 ("And Claude? Claude's plans list designs, slides, documents and Artifacts, but not photo or video generation.", "Claude: design card, no camera icon."),
 ("So if you need pictures, Claude isn't the one to pick.", "Claude chip dims."),
 ('Try this in Gemini or ChatGPT: Make a poster for a bake sale on Saturday. Big title, cupcakes, warm colors, and the text: Bake Sale, Saturday, ten A M', 'Prompt typed; poster appears (illustration).'),
 ("Then check the text in the image. Spelling inside pictures has improved a lot, but it's still worth a look before you print.", 'Zoom on poster text; CHECK tag.'),
])

seg('h08', 'host', 'ROUND 4 VERDICT', [
 ("Round four goes to Gemini. Images, text inside images, and video, all in one app.", "Asher, side."),
])

seg('d09', 'demo', 'ROUND 5 · CODING', [
 ("Round five. Coding. Even if you're not a developer, this is where AI can build tools for you.", "Round card 5."),
 ("Claude has Claude Code. It works right in your project. It reads your files, makes the changes, and runs the commands, while you watch and approve.", "Terminal: Claude Code editing files."),
 ("It's included from Pro at twenty dollars, but not on Free.", "PRO tag."),
 ("And on October seventh, Anthropic started giving Max and Team plans monthly API credits on top, for people who build their own apps with Claude.", "API credit chip."),
 ("ChatGPT has Codex. It's included in ChatGPT plans, with more on Plus and the most on Pro.", "Codex window."),
 ("And on October ninth, Codex got Composer predictions, in beta for personal Pro users. It suggests your next message, and you press Tab to use it.", "Codex composer; ghost text; Tab."),
 ("Google has Jules, its coding agent, with higher limits on AI Pro, and a coding app called Antigravity.", "Jules + Antigravity icons."),
 ("All three can write and explain code right in the chat, even for free.", "Code block in each app."),
 ("You don't need to be a programmer to try this. Type: Build me a simple tip calculator I can use in my browser. Explain how to open it.", 'Prompt typed.'),
 ('Claude can build it as an Artifact you can click right away. ChatGPT can build it as an interactive answer. Gemini can build it in Canvas.', 'Three small calculators (illustration).'),
])

seg('h09', 'host', 'ROUND 5 VERDICT', [
 ("Round five goes to Claude. Claude Code at twenty dollars is the easiest way to let AI actually build something on your computer.", "Asher, front."),
 ("But if you already pay for ChatGPT, Codex is right there, and it's getting better fast.", "Asher, side."),
])

seg('d10', 'demo', 'ROUND 6 · WORKING WITH YOUR APPS', [
 ("Round six. Working with your apps. This is where these tools stop being chatbots and start doing tasks for you.", "Round card 6."),
 ("Gemini is built into Google. With a paid plan, it's in Gmail and Google Vids. And on September tenth, Google released a Gemini desktop app for Windows that can connect to Gmail and Drive.", "Gemini Windows app; Gmail and Drive connect."),
 ("On AI Pro and Ultra, there's also Chrome auto browse, where Gemini can click through websites for you.", "Chrome window; cursor moves on its own."),
 ("Claude connects to your apps on every plan, even Free. And on Pro, you get Claude in Chrome and in Microsoft three sixty-five, like Word and Excel.", "Claude connectors grid."),
 ("On September sixteenth, Anthropic also brought Cowork into every Claude conversation, rolling out to Pro and Max. That lets Claude take on longer tasks for you.", "Cowork task list ticks."),
 ("ChatGPT has scheduled tasks on Plus, so it can do something every morning, like a news summary. And Pro gets the most agent mode, where ChatGPT uses a browser to finish a task for you.", "Scheduled task at 8:00; agent browser."),
 ("Here's one to try if you have Gmail connected. Ask: Find every email about my order from last week and tell me which ones need a reply.", 'Prompt typed; email list (illustration).'),
 ("Before you connect any app, read what it's allowed to see. You can disconnect it any time in settings.", 'Permissions card.'),
])

seg('h10', 'host', 'ROUND 6 VERDICT', [
 ("Round six depends on where you work. If you live in Google, Gemini. If you use Microsoft three sixty-five, Claude.", "Asher, front."),
 ("And if you want tasks to run on a schedule, ChatGPT makes that easy.", "Asher, side."),
])

seg('d11', 'demo', 'ROUND 7 · BIG FILES AND AUDIO', [
 ("Round seven. Big files and audio. Long PDFs, spreadsheets, meeting recordings.", "Round card 7."),
 ("Gemini can hold the most at once. A million tokens of context on AI Pro, so a whole book or a big folder of reports fits in one chat.", "Book slides into Gemini; 1M meter fills."),
 ("And Google AI Pro comes with five terabytes of storage for all those files.", "5 TB."),
 ("ChatGPT got audio uploads on October sixth. On paid plans, you can upload a recording up to five hundred and twelve megabytes and get a transcript, a summary, and answers to your questions.", "Audio file uploads; transcript."),
 ("OpenAI says transcripts can have mistakes, so check names and numbers.", "CHECK tag on a number."),
 ("Claude can read your files on every plan, and it can create files and run code to work with your data, even on Free.", "Spreadsheet in Claude; chart appears."),
 ("For a long report you need to really understand, Claude's careful writing is a big plus.", "Claude summary card."),
 ('Try this with any long PDF: Summarize this in ten bullet points. Then list anything that looks like a deadline, a cost or a risk.', 'PDF drop; prompt typed.'),
 ('And then ask: Where in the document does it say that? A good answer will point you to the exact section.', 'Highlight jumps to page.'),
])

seg('h11', 'host', 'ROUND 7 VERDICT', [
 ("Round seven goes to Gemini for sheer size. But for recordings, ChatGPT's new audio uploads are the easiest.", "Asher, front."),
])

seg('d11b', 'demo', 'ROUND 8 · VOICE AND YOUR PHONE', [
 ("Round eight. Voice. Talking to AI instead of typing, usually on your phone.", "Round card 8; phone mockup."),
 ("ChatGPT Voice runs on new voice models. Paid plans get GPT Live one, and Free gets a smaller version, GPT Live one mini, with limited use.", "ChatGPT voice orb; LIVE-1 / mini chips."),
 ("Video and screen sharing are in ChatGPT's Advanced voice on the phone apps, for eligible subscribers.", "Phone camera view; PAID tag."),
 ("Gemini Live is free, and on Android and iPhone you can turn on your camera or share your screen and ask about what you see.", "Gemini Live; camera view; FREE tag."),
 ("Claude has voice mode on every plan, on your phone, the desktop app and the web. It's in beta, and on Free it uses Haiku.", "Claude voice wave; BETA tag."),
 ("Try this on your phone. Open voice mode and say: I'm cooking dinner for four with chicken, rice and spinach. Walk me through it one step at a time, and wait for me to say next.", "Kitchen, phone on the counter (illustration)."),
 ("Voice is perfect when your hands are busy.", "Hands chopping; voice wave."),
])

seg('h11b', 'host', 'ROUND 8 VERDICT', [
 ("Round eight goes to Gemini. Live with your camera, for free, is hard to beat.", "Asher, side."),
])

seg('d11c', 'demo', 'ROUND 9 · PRIVACY AND MEMORY', [
 ("Round nine. Privacy and memory. The round nobody talks about, but you should.", "Round card 9; lock icon."),
 ("All three can remember things about you between chats. That's handy, but you should know where the switches are.", "Memory cards in all three."),
 ("In ChatGPT, memory and training are two separate switches. A setting called Improve the model for everyone decides whether your chats can help train OpenAI's models. You can turn it off in Data controls, and your history stays.", "ChatGPT Data controls toggle."),
 ("ChatGPT also has Temporary chat. Those chats don't go in your history, don't create memories, and aren't used for training.", "Temporary chat badge."),
 ("Claude only uses your chats for training if you choose to allow it, or if a chat is flagged for a safety review. If you opt in, Anthropic says it may keep that data, de-identified, for up to five years.", "Claude privacy toggle; 5 YEARS note."),
 ("Claude has Incognito chats too. They're not saved to your history or memory, and they're not used for training.", "Incognito badge."),
 ("Gemini has a setting called Keep Activity. With it on, Google says a sample of chats is reviewed by people to improve its services, and reviewed chats can be kept for up to three years, even if you delete your activity.", "Gemini Keep Activity toggle; reviewer icon; 3 YEARS note."),
 ("Gemini's temporary chats and chats with Keep Activity off aren't used to improve Google AI. They're kept for seventy-two hours.", "Temporary chat; 72 HOURS."),
 ("Google's own advice is simple: don't type anything confidential into Gemini. Honestly, that's good advice for all three.", "Warning card."),
 ("And if you use these at work, check your company's plan. Business plans usually have different rules about training.", "Work badge."),
])

seg('h11c', 'host', 'ROUND 9 VERDICT', [
 ("Round nine goes to Claude. It only trains on your chats if you choose to allow it. With the others, it's worth checking that switch yourself.", "Asher, front."),
 ("Whichever one you use, take two minutes today and check those settings.", "Asher, side."),
])

seg('d11d', 'demo', 'FIVE PROMPTS THAT WORK IN ALL THREE', [
 ("Before the final verdict, here are five prompts that work great in all three. They're also in the description, so you can copy them.", "Five prompt cards fan out."),
 ("One. Explain this like I'm new to it, then give me one example from everyday life. This is the fastest way to learn anything.", "Card 1 flips."),
 ("Two. Ask me five questions first, then write it. Use this for anything personal, like a cover letter or a speech. The questions make the answer fit you.", "Card 2 flips; question list."),
 ("Three. Give me three versions: short, medium and detailed. Then you pick, instead of rewriting.", "Card 3; three lengths."),
 ("Four. What's wrong with this, and how would you fix it? Paste your own writing, plan or code, and get honest feedback.", "Card 4; red marks."),
 ("Five. Check your answer. What might be wrong or missing? This one catches a lot of mistakes, in every app.", "Card 5; checkmark."),
 ("Use the same prompt in two apps and compare the answers. That's the best way to find the one you like.", "Same card goes into two windows."),
])

seg('d11e', 'demo', 'MISTAKES TO AVOID', [
 ("And three mistakes I see all the time.", "Three warning cards."),
 ("Mistake one. Paying before you need to. All three free plans are good. Upgrade when you hit a limit you keep running into, not before.", "Card 1: $ crossed out."),
 ("Mistake two. Trusting numbers, names and dates without checking. All three can be confidently wrong. If it matters, click the source or check it yourself.", "Card 2: CHECK tag on a date."),
 ("Mistake three. Writing one-line prompts. Tell it who you are, what you need, who it's for, and what format you want. Four extra seconds, and the answer gets much better.", "Card 3: short prompt grows into a full prompt."),
])

seg('d11f', 'demo', 'PRO TIPS · CHATGPT', [
 ("Now, whichever one you pick, here are tips to get more out of it. Starting with ChatGPT.", "ChatGPT window; TIPS tab."),
 ("Tip one. Use projects. Put your files and instructions for one piece of work in a project, and every chat inside it starts with that context.", "Project sidebar; files pinned."),
 ("Tip two. If Intelligent UI shows you more visuals than you want, you can switch to a simpler layout in Personalization.", "Settings: Layout and Visuals › Simple."),
 ("Tip three. Use Temporary chat for anything you don't want remembered, like a gift idea or a private question.", "Temporary chat toggle."),
 ("Tip four. On Plus, set up a scheduled task. For example: Every weekday at eight, give me a two-minute summary of AI news, with links.", "Scheduled task card at 8:00."),
 ("And tip five. Check what ChatGPT remembers about you. You can review, correct or delete any memory.", "Memory list; delete icon."),
])

seg('d11g', 'demo', 'PRO TIPS · CLAUDE', [
 ("Next, Claude.", "Claude window; TIPS tab."),
 ("Tip one. Ask for the real file. Say: Make this a document, a slide deck or a design. Claude builds it as an Artifact or with the new Docs, Slides and Design, instead of a wall of text.", "Slides artifact builds."),
 ("Tip two. Use projects for ongoing work, and keep your files and instructions there. On Free you get up to five.", "Project list; 5 badge."),
 ("Tip three. If you want one chat without memory, but still want to find it later, turn off Memory in the plus menu before your first message. If you don't want it saved at all, use an Incognito chat.", "Plus menu: Memory toggle; Incognito icon."),
 ("Tip four. Connect the apps you already use. Even on Free, Claude can work with connected tools, so it can read the files and messages you allow it to.", "Connectors grid."),
 ("And tip five. On Pro, try voice mode on your phone for thinking out loud. It's a great way to plan something while you walk.", "Phone voice wave."),
])

seg('d11h', 'demo', 'PRO TIPS · GEMINI', [
 ("And Gemini.", "Gemini window; TIPS tab."),
 ("Tip one. Turn your repeat tasks into skills. If you always ask for the same kind of thing, like a weekly meal plan or a meeting summary, save it as a skill, and Gemini can run it automatically when your prompt matches.", "Skill builder; trigger match."),
 ("Tip two. Use Deep Research for big decisions, even on the free plan. Ask it to compare, list sources and show prices in your currency.", "Deep Research report."),
 ("Tip three. Use Canvas when you're writing or building something you'll keep editing, so the draft stays open next to the chat.", "Canvas panel beside chat."),
 ("Tip four. On a computer, try the Gemini app for Windows. One keyboard shortcut opens it on top of whatever you're doing.", "Windows desktop; shortcut keys."),
 ("And tip five. Remember Google's own warning, and keep confidential things out of your chats, or use a temporary chat.", "Temporary chat; warning card."),
])

seg('d12', 'demo', 'WHICH ONE SHOULD YOU PAY FOR?', [
 ("So here's the scoreboard.", "Scoreboard builds."),
 ("ChatGPT won everyday answers. Claude won writing and documents, coding, and privacy. Gemini won research, images and video, big files, and voice. And working with your apps depends on what you use.", "Round chips fly to each column."),
 ("On points, that's Gemini four, Claude three, ChatGPT one. But points aren't the whole story.", "Tally: 4 · 3 · 1."),
 ("And you don't need a winner. You need the one that fits how you work. So let me make it simple.", "Scoreboard clears."),
 ("If you're a student, start with Gemini free. Deep Research, Canvas and image creation cost nothing. And in the US, Google has offered eligible college students a free year of a Google AI plan.", "Student card: Gemini Free."),
 ("If you want one app for everything, and you'll use it every day, get ChatGPT Plus. Intelligent UI, voice, images, deep research and Codex, with no ads.", "Everyday card: ChatGPT Plus."),
 ("If you write a lot, make documents and decks, or want AI to build things for you, get Claude Pro. Claude Code and the new Design, Slides and Docs are worth the twenty dollars.", "Builder card: Claude Pro."),
 ("If your life is in Gmail, Docs and Drive, or you make images and video, get Google AI Pro. You also get five terabytes of storage, which you might be paying for already.", "Google card: AI Pro."),
 ("And if money is tight, Google AI Plus at four ninety-nine is the cheapest way to pay for any of them.", "Budget card: AI Plus."),
 ("One more tip. Don't pay for two of these at once until you've used one for a full month. Most people only need one.", "Two cards; one fades."),
])

seg('h13', 'host', 'FINAL VERDICT', [
 ("If you made me pick just one for most people, I'd say this.", "Asher, front; push in."),
 ("Start with Gemini and ChatGPT for free. Use them for a week.", "Asher, side."),
 ("Then pay for the one you keep opening without thinking about it. That's the one that fits you.", "Asher, front."),
 ("And remember, these apps change almost every week. ChatGPT got GPT six three days ago, and Claude got three new models in three weeks. What's true today might change next month, and I'll keep you updated.", "Asher, front."),
])

seg('h14', 'host', 'OUTRO', [
 ("If this helped, like the video and subscribe. It really helps the channel.", "Asher, front."),
 ("And tell me in the comments: which one do you use, and why?", "Comment box types."),
 ("See you in the next one.", "Asher nods; end card."),
])

if __name__ == "__main__":
    D = os.path.dirname(os.path.abspath(__file__))
    json.dump(S, open(os.path.join(D, 'lines.json'), 'w'), indent=1, ensure_ascii=False)
    words = {s['key']: sum(len(l['say'].split()) for l in s['lines']) for s in S}
    for s in S: print(s['key'], s['kind'], words[s['key']])
    tot = sum(words.values()); host = sum(w for s in S for k, w in words.items() if k == s['key'] and s['kind'] == 'host')
    print('total', tot, 'host', host, '≈ min', round(tot / 152, 1))
