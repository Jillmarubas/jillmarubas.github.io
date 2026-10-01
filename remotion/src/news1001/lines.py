"""Writes lines.json: the approved script (user's words + verified fixes), one row per scene."""
import json, os
S = []
def seg(key, title, rows): S.append({'key': key, 'title': title, 'lines': [{'say': a, 'show': b} for a, b in rows]})

seg('hook', 'HOOK', [
 ("Washington just launched an investigation into OpenAI and Anthropic,", "3D Capitol-area street: the FTC Apex Building at dusk; a paper subpoena slides out; 3D OpenAI + Anthropic logos under a magnifier."),
 ("six AI giants signed a safety pact with the White House,", "3D White House (north facade, fountain, elms). Six 3D logos land in a row on a signed paper accord."),
 ("Google says it's got a model that beats GPT,", "3D Google G vs OpenAI mark on a balance scale; scale tips to Google."),
 ("and OpenAI is reportedly trying to raise thirty billion dollars while quietly delaying its IPO.", "Stacks of 3D banknote bricks rising to 30B; a stock-exchange bell with a paper 'POSTPONED' tag."),
 ("It has been a wild forty-eight hours in AI, and I'm going to walk you through every bit of it. Let's get into it.", "A paper desk calendar flips Sept 29 → 30 → Oct 1; seven folders fan out."),
])
seg('preview', 'TODAY', [
 ("Here's what we're covering today: Google's surprise Gemini 4 \"Argon\" launch,", "Folder 1 opens: 3D Google G + an argon gas tube glowing."),
 ("a new federal investigation into the biggest AI labs,", "Folder 2: FTC seal on a document."),
 ("a voluntary safety accord signed by six tech CEOs at the White House,", "Folder 3: six photo cut-outs of the CEOs pinned in a row."),
 ("a messy public fight between OpenAI and a Chinese AI company called Moonshot,", "Folder 4: OpenAI mark vs Moonshot/Kimi mark, red thread between them."),
 ("a tax story about Meta that is honestly kind of wild,", "Folder 5: 3D Meta logo on a tax form."),
 ("OpenAI's huge new funding round and IPO delay,", "Folder 6: money bricks + IPO bell."),
 ("and DoorDash's new AI agent that lets you order food by just texting it.", "Folder 7: phone with a Messages thread, 3D DoorDash logo."),
 ("Seven stories, all confirmed by multiple outlets, no rumors, no leaks. Let's start with the model launch.", "Seven folders stamped 'CONFIRMED' one by one."),
])
seg('s1', 'GEMINI 4 ARGON', [
 ("So Google just dropped Gemini 4, codenamed \"Argon,\" and the way they rolled it out is interesting.", "3D Gemini sparkle mark rotating; a periodic-table tile 'Ar 18' slides beside it."),
 ("Instead of a big public launch, Google quietly gave early access to a small group of cybersecurity partners first,", "A small locked door; three shield badges pass through; crowd stays outside a rope."),
 ("through a voluntary government pre-release program, before opening it up more broadly to paying subscribers.", "Paper flow: government building → shields → a credit card → wider door."),
 ("The model is built for long, complex tasks — things like software engineering, legal analysis, finance work, and cybersecurity,", "Four objects on the desk: code printout, law book, ledger, padlock."),
 ("basically the kind of jobs where an AI has to stay focused and accurate over a long stretch of work, not just answer a quick question.", "A long paper tape unrolling across the desk vs a single sticky note."),
 ("Google is claiming Argon beats OpenAI's current flagship model, GPT-6 Astra, on a number of coding and knowledge benchmarks.", "Bar chart (DeepSWE v1.1: Argon 77.9, GPT-6 Astra 74.1). Source: Google, via VentureBeat."),
 ("Tulsee Doshi, who heads Gemini product at Google DeepMind, called it, quote, \"incredibly well-rounded.\"", "Photo of Tulsee Doshi (licensed) with name tag; the quote in Caveat hand."),
 ("Now, it's worth noting this launch comes almost a full year after Gemini 3.", "Timeline ruler: Nov 2025 Gemini 3 → Sep 2026 Gemini 4."),
 ("Google had been aiming for a release back in June, then scrapped that version and skipped straight to Gemini 4. So Google took its time here.", "Calendar page JUNE with '3.5' crossed out; arrow jumps to '4'."),
 ("And Bloomberg reported that some employees think the model does worse in real use than it does on benchmarks.", "Newspaper clipping (styled, no logo) with a highlighter sweep."),
 ("We'll see how Argon performs once more people get their hands on it, but for now, Google says it's a serious contender at the top of the leaderboard.", "Leaderboard podium; Gemini mark on top with a question-mark sticky note."),
])
seg('s2', 'THE FTC PROBE', [
 ("Now here's a story with much bigger stakes: the Federal Trade Commission has opened a sweeping investigation into OpenAI, Anthropic, and other major AI labs over consumer protection concerns.", "3D replica of the FTC Apex Building, Pennsylvania Ave, Washington; zoom to the door."),
 ("This is multiple outlets confirming the same thing, so this is real and it's serious.", "Clippings stack up; stamp 'CONFIRMED'."),
 ("FTC Chair Andrew Ferguson is planning to use what's called a Civil Investigative Demand — basically a legally binding order —", "Photo of Andrew Ferguson (public domain); a paper CID document unfolds."),
 ("to force these companies to hand over internal documents and even sit executives down for testimony, and those demands are expected within weeks.", "Boxes of files slide across; an empty witness chair and microphone; calendar counts weeks."),
 ("What makes the timing especially striking is that this probe became public just one day after executives from several of these same companies stood at the White House and signed a voluntary safety pledge.", "Two calendar pages: Sep 29 (White House) and Sep 30 (FTC), red thread between them."),
 ("So you've got the industry promising to police itself on one day, and federal regulators opening a formal investigation into them the next.", "Split desk: pledge with signatures vs investigation folder."),
 ("Ferguson himself gave a warning in the middle of this too, saying AI companies shouldn't be allowed to use regulatory standards as a way to box out rivals —", "Big 3D blocks fence in a small block."),
 ("basically, don't use \"safety\" as an excuse to squeeze out smaller competitors. This is one to watch closely over the coming weeks.", "The fence opens; magnifier over it."),
])
seg('s3', 'THE WHITE HOUSE ACCORD', [
 ("And that White House pledge I just mentioned deserves its own breakdown, because the list of who signed it is a who's who of AI.", "3D White House north facade, lawn, fountain and elm trees; camera pushes in."),
 ("On September 29th, six companies put their names on something called the \"White House Accord on Super Intelligence.\"", "Paper document titled with the accord name; date stamp SEP 29 2026."),
 ("That's Anthropic's Dario Amodei, OpenAI's Greg Brockman, Google's Sundar Pichai,", "Photos + 3D logos, one by one."),
 ("Meta's Mark Zuckerberg, xAI's Elon Musk, and Nvidia's Jensen Huang.", "Photos + 3D logos, one by one; all six in a row."),
 ("The commitment involves putting monitoring controls on their AI systems, setting up internal safety teams,", "Objects: a monitor gauge, a team badge."),
 ("bringing in independent outside auditors, and meeting regularly to build shared safety standards.", "Objects: an auditor's clipboard, a round table with six chairs."),
 ("President Trump framed this as proof that self-regulation can work, backed up by existing law enforcement through the Justice Department and FBI.", "Photo of Donald Trump (public domain); DOJ and FBI seals."),
 ("But not everyone is convinced. AI researcher Toby Walsh, of the UNSW AI Institute in Sydney, pointed out these companies have already shown they can be, in his words, incompetent and careless at managing themselves.", "Photo of Toby Walsh (licensed); quote in hand lettering."),
 ("Other critics said the accord is vague and lacks independent enforcement —", "The accord paper; an empty 'enforcement' slot with a dotted outline."),
 ("especially notable since this comes right after twenty countries and the EU proposed a global AI oversight framework, which the Trump administration rejected as what it called a globalist scheme.", "Globe with 20 pins + EU stars; UN General Assembly hall replica; a stamp 'REJECTED'."),
])
seg('s4', 'OPENAI vs MOONSHOT', [
 ("Okay, this next one is a genuinely spicy story.", "OpenAI mark and Moonshot mark slide in from opposite sides."),
 ("OpenAI is accusing users linked to the Chinese AI company Moonshot AI of running a coordinated campaign to extract OpenAI's model reasoning through roughly sixteen thousand API requests.", "A counter rolls to 16,000; streams of paper slips fly from many laptops toward the OpenAI mark."),
 ("If you're not familiar with the term, this is called \"distillation\" —", "A glass distillation flask on a stand."),
 ("basically trying to copy how a powerful AI model thinks by bombarding it with questions and using the answers to train your own, cheaper model.", "Questions pour into the big model; answers drip through the flask into a smaller model."),
 ("This isn't happening in a vacuum, either. Earlier this month, Anthropic published its own report detailing similar distillation campaigns coming from Alibaba, Moonshot AI, and DeepSeek.", "Anthropic report document (Sep 10); three 3D logos pinned to it."),
 ("So there's a pattern here of U.S. labs accusing Chinese AI companies of trying to reverse-engineer their models.", "Map: US to China with red threads."),
 ("Interestingly, back in July, OpenAI's own president, Greg Brockman, was a bit more measured about it personally, saying Moonshot's Kimi K3 model is, quote, \"pretty good,\"", "Photo of Greg Brockman; quote in hand lettering."),
 ("while admitting he's not actually sure if it was distilled from OpenAI's technology or not.", "Question mark over the flask."),
 ("So you've got the company making a forceful accusation while one of its own top executives is hedging.", "Scale: accusation vs hedge."),
 ("This dispute is also feeding directly into the Trump administration's broader push around AI and intellectual property protection, so expect to hear more about this one.", "Padlock on a patent document; White House in background."),
])
seg('s5', "META'S TAX MOVE", [
 ("Now, this next story is about money, and it is wild.", "3D Meta logo on a desk with a calculator."),
 ("The New York Times reported that Meta has been classifying some of its AI data centers and even its Nvidia chip purchases as, quote, \"experimental research investments\" in order to claim bigger tax credits.", "A data-centre model and a GPU card get a paper label 'EXPERIMENTAL RESEARCH'."),
 ("And this isn't small — Meta's research-tax-credit savings reportedly jumped from about seven hundred million dollars back in 2023 to three point nine billion dollars in 2025.", "Two money stacks: $0.7B (2023) vs $3.9B (2025). Source: NYT, Meta filings."),
 ("But the headline-grabbing detail is about Mark Zuckerberg personally.", "Photo of Mark Zuckerberg."),
 ("Meta apparently classified four point one billion dollars worth of stock options that Zuckerberg exercised years ago as a research expense, which let the company claim about three hundred fifty-five million dollars in tax savings.", "Stock certificate $4.1B → research stamp → $355M credit."),
 ("Meta's argument is that Zuckerberg was personally involved in building Facebook's early technology, so his compensation should count as research spending.", "Old laptop with early-Facebook-style feed sketch (no logo), 2005 date."),
 ("The IRS disagrees on the timing of when that work actually happened.", "Timeline 2005 vs 2008–2010; IRS seal; Tax Court."),
 ("As of this past June, Meta is sitting on eighteen point seven four billion dollars in what's called unrecognized tax benefits — tax positions the company has taken that could still be challenged.", "A tall stack $18.74B with a 'could be challenged' tag. Source: Meta 10-Q."),
])
seg('s6', 'OPENAI: $30B, NO IPO', [
 ("Speaking of huge numbers, OpenAI is reportedly trying to raise around thirty billion dollars in a new funding round, according to Bloomberg and Semafor,", "Money bricks stack to $30B beside 3D OpenAI mark."),
 ("and at the same time, the company appears to be delaying its planned IPO.", "Stock exchange bell with a 'POSTPONED' tag; calendar 2026 → 2027."),
 ("Reported valuations for OpenAI have varied a bit depending on the report and the exact timing of the talks, generally somewhere in the one-point-two to one-point-four trillion dollar range, so treat the precise number as still moving.", "A range slider $1.2T–$1.4T, needle wobbling."),
 ("What's notable is the broader pattern: several other high-profile companies have also pulled back their IPO timelines recently,", "Row of IPO tickets being pulled back."),
 ("including smart ring maker Oura and data center operators SB Energy and NScale.", "3D Oura ring; SB Energy and Nscale logos."),
 ("Even OpenAI's rival Anthropic, which had been expected to go public this year, now faces the same uncertain market.", "3D Anthropic mark next to the bell; fog."),
])
seg('s7', 'DOORDASH IN YOUR TEXTS', [
 ("Let's end on something a little lighter but still genuinely interesting. DoorDash just launched a new AI agent that lives right inside Apple's Messages app, so you can literally text it to order food.", "3D DoorDash logo; phone with a Messages thread."),
 ("It's live right now with about twenty thousand users in a U.S. iOS pilot.", "Counter 20,000; US map outline."),
 ("Here's the clever part: because it already knows your phone number, order history, and payment info, it can handle something like \"order my usual\" without you typing anything else.", "Thread: 'order my usual' → order card; phone number, receipt, card icons link in."),
 ("DoorDash co-founder Andy Fang put it well, saying, quote, \"Every other AI agent is meeting you for the first time. We've known you for years.\"", "Photo of Andy Fang (licensed); quote in hand."),
 ("You can also text it a photo of a dish you want, and it'll find something similar nearby.", "Photo of a bowl of ramen sent in thread; nearby map pins."),
 ("Early testing from Bloomberg did turn up some rough edges, like pricing mismatches, which DoorDash says will be ironed out for people on the waitlist.", "Two price tags that don't match; an iron smoothing a paper."),
 ("There's also a business side: DoorDash built a separate enterprise tool using the Model Context Protocol that lets company Slack bots place bulk orders for teams,", "Office desk; a stack of lunch bags; plug diagram."),
 ("already being tested internally by SpaceX, Cognition, and Mercor.", "Three 3D logos on lunch bags."),
])
seg('outro', 'OUTRO', [
 ("And that's your AI news roundup for today — a federal investigation, a White House safety pact, a brand-new frontier model,", "Folders close one by one."),
 ("a distillation dispute between the US and China, a wild Meta tax story, a thirty-billion-dollar OpenAI funding round, and DoorDash letting you text your dinner order to an AI.", "Folders close; desk clears."),
 ("If you found this useful, smash that like button, subscribe so you don't miss the next update, and drop a comment letting me know which of these stories you want me to dig deeper into.", "Paper like and subscribe buttons get pressed."),
 ("Thanks for watching, and I'll see you in the next one.", "Desk lamp clicks off."),
])
json.dump(S, open(os.path.join(os.path.dirname(__file__), 'lines.json'), 'w'), indent=1, ensure_ascii=False)
print(sum(len(s['lines']) for s in S), 'lines', sum(len(l['say']) for s in S for l in s['lines']), 'chars')
