"""Writes lines.json: the approved script (user's words + the two fixes in VERIFY.md), one row per scene line.
`say` is narration, `show` is what's on screen (objects and real photos, not words)."""
import json, os
S = []
def seg(key, title, rows): S.append({'key': key, 'title': title, 'lines': [{'say': a, 'show': b} for a, b in rows]})

seg('hook', 'HOOK', [
 ("OpenAI just got subpoenaed, fired three of its own safety researchers, and had to warn over a hundred organizations that its AI agents went rogue — all in the same forty-eight hours.",
  "3D OpenAI mark centre; a subpoena document drops beside it; three ID badges slide off the desk; a fan of 100+ envelopes flies out. Clock ring sweeps 48h."),
 ("Meanwhile, Nvidia dropped a cheaper AI supercomputer,", "Real photo of the DGX Spark (cut-out) lands on the ground with a blue bloom; 3D Nvidia mark."),
 ("Amazon is throwing a billion dollars at the communities it's building data centers in,", "Data-centre block and a row of houses; a cobalt $1B brick slides between them; 3D Amazon mark."),
 ("and a tiny startup just unveiled an AI that nearly half of people couldn't tell apart from a real human on a video call.", "Laptop with a video-call window; a 54-person grid where 26 light up cobalt."),
 ("It has been a wild week in AI, and I'm going to break down every bit of it, with sources, so stick around.", "Five story tiles stack like the dissolving type stack (veil ramp), cobalt object on top."),
])
seg('preview', 'TODAY', [
 ("Here's what we're covering today: Nvidia's new budget-friendly DGX Spark and why it exists.", "Tile 1: DGX Spark photo."),
 ("Amazon's massive peace offering to data center towns across America.", "Tile 2: US map with data-centre pins; 3D Amazon mark."),
 ("Anthropic's hundred-million-dollar bet on training the next generation of AI engineers.", "Tile 3: 3D Anthropic mark + an engineer residency badge."),
 ("A new AI avatar company that's got the internet genuinely spooked.", "Tile 4: video-call window, 3D Tavus mark."),
 ("And then we're closing with the OpenAI story, because honestly, it's a lot — rogue agents, fired researchers, and a state attorney general all in one tangled mess. Let's get into it.", "Tile 5: 3D OpenAI mark; a red-thread tangle connects an agent box, a badge and a subpoena."),
])
seg('s1', "NVIDIA'S CHEAPER SPARK", [
 ("First up, Nvidia. If you've been following the local AI hardware space, you know memory prices have gotten brutal this year —", "3D Nvidia mark; a RAM module with a price tag whose number climbs."),
 ("people are calling it the \"RAMpocalypse,\"", "RAM sticks raining down onto the ground (quoted word as the only text)."),
 ("and it's made Nvidia's DGX Spark, this tiny desktop AI supercomputer, pretty expensive to build.", "Real photo of the DGX Spark, oblique view, held in a hand-size scale ruler (15 cm) for size."),
 ("So Nvidia's answer was to introduce a cheaper version.", "Two DGX Spark photos side by side; the right one slides forward."),
 ("Instead of the standard 128 gigabytes of unified memory, there's now a 64 gigabyte model", "Memory blocks: 128 GB stack splits, half slides away → 64 GB."),
 ("landing October 23rd for 4,999 dollars.", "Calendar page OCT 23; a price tag $4,999 swings in."),
 ("Here's the twist though — because of how memory pricing has shifted, that 64 gig version is actually not that much cheaper than the original.", "A balance scale: 64 GB Spark vs launch price $3,999 tag; the scale barely moves."),
 ("The 128 gigabyte model, which used to be the entry point, has actually jumped in price to somewhere around 7,000 to 9,000 dollars depending on the retailer.", "Price-tag column climbs: $3,999 (launch) → $7,000–$9,000 band. Source: Tom's Hardware."),
 ("Both versions share the same core hardware: a 20-core Arm CPU and NVIDIA's ConnectX-7 networking,", "Real photo of the rear ports; a chip with a 20-cell core grid lights up cell by cell; the network ports glow cobalt."),
 ("which means you can cluster multiple Sparks together to effectively pool their memory.", "Two Spark photos linked by a cable; their memory blocks merge into one pool."),
 ("Nvidia's pitch here is that a lot of today's efficient open models don't actually need 128 gigs to run well, so why pay for memory you're not using.", "A model block fits inside the 64 GB box with room to spare; the unused 64 GB greys out."),
 ("It's a small move, but it tells you a lot about how tight the AI hardware supply chain has gotten this year.", "A supply-chain belt of chips slows and tightens between two gears."),
])
seg('s2', "AMAZON'S PEACE OFFERING", [
 ("Next, let's talk about Amazon, because this one is a direct response to something you may have noticed in your own town — growing backlash against new data centers.", "3D replica: a data-centre block behind a small-town street (houses, trees, a lamp post); protest signs (no words) rise."),
 ("Amazon announced a five-year, one-billion-dollar community investment program it's calling \"Built Together.\"", "3D Amazon mark; a cobalt $1B brick; five calendar years tick by. Quoted name 'Built Together'."),
 ("The money is going toward funding community college tuition for an estimated 300,000 students,", "Graduation cap; a dot field counts to 300,000."),
 ("building 16 new job training centers with free certifications,", "16 small training-centre buildings appear on a map; a hard hat and a certificate."),
 ("and upgrading energy efficiency at more than 300 schools and 30,000 homes near its facilities.", "A school and a house; insulation + a heat-pump unit snap on; counters 300+ and 30,000+."),
 ("Why now? AWS CEO Matt Garman put it pretty bluntly,", "Press headshot of Matt Garman, name strip, credit."),
 ("warning that more than a hundred data center moratoriums across the country are threatening America's competitiveness in the AI race.", "US map: 100+ pins drop; a race track lane with a barrier."),
 ("And it's not just money — Amazon also said it will stop using NDAs with local government officials when negotiating future data center deals,", "An NDA document between a county seal and a data centre; it tears in half."),
 ("which had been a major source of public distrust.", "A town-hall table; the empty chair fills; a lock opens."),
 ("For context, spread over five years, that's about two hundred million dollars a year — roughly a tenth of a percent of the 220 billion dollars Amazon plans to spend on capital projects this year,", "A giant block labelled $220B (2026 capex) and a sliver $200M/yr; the sliver highlighted cobalt. Source: Amazon Q2 2026."),
 ("so skeptics are already calling it a drop in the bucket.", "A literal drop falls into a big bucket."),
 ("But it's a clear sign that the industry is feeling real pressure from the communities hosting all this AI infrastructure.", "The town street again; the data centre now has the houses pressed close; pressure gauge rises."),
])
seg('s3', "ANTHROPIC'S $100M ACADEMY", [
 ("Switching gears to Anthropic, who just launched something called the Claude Frontier Academy, backed by a 100-million-dollar commitment.", "3D Anthropic mark; a cobalt $100M brick; academy doors open."),
 ("The goal is to train 10,000 so-called \"Frontier Deployed Engineers\" by the end of 2027 —", "A dot field of 10,000 figures fills; calendar end 2027."),
 ("basically specialists who know how to actually implement Claude inside big companies at scale, which turns out to be a surprisingly scarce skill right now.", "An engineer's toolbox plugs a Claude spark into a tall office tower; only a few lit windows (scarce)."),
 ("The program is structured almost like a medical residency:", "A stethoscope and a hospital-style ID badge."),
 ("trainees start with multi-day, in-person instruction alongside Anthropic's own engineers,", "A classroom table with chairs; a few days on a calendar strip."),
 ("then move into a 12-week hands-on residency where they lead real Claude deployments at their actual employer.", "12 week-blocks fill one by one; the badge flips to 'Frontier Deployed Engineer'."),
 ("Early cohorts already include people from Accenture, Bain, Deloitte, McKinsey, Morgan Stanley, and even Novo Nordisk,", "3D logos of the six companies arrive one at a time in a row."),
 ("running out of hubs in San Francisco, New York, and London.", "Three 2.5D landmark replicas: Transamerica Pyramid (SF), Empire State Building (NY), Elizabeth Tower (London) on a thin world map with pins."),
 ("Anthropic's Steve Corfield summed up the thinking pretty simply, saying the academy trains people the same way Anthropic's own engineers learn.", "Press headshot of Steve Corfield, name strip, title; quote words 'the way our own engineers learn'."),
 ("Basically, Anthropic is betting that the bottleneck for enterprise AI adoption isn't the models anymore — it's finding enough people who actually know how to wire them into real businesses.", "A bottle with a narrow neck: model blocks flow freely, people figures queue at the neck."),
])
seg('s4', "TAVUS GRIFFIN", [
 ("Okay, this next one is the story that's gotten people the most unsettled this week.", "Ground darkens slightly; a single video-call window floats."),
 ("A company called Tavus unveiled a new model called Griffin, which they're calling the first \"Human Interaction Model.\"", "3D Tavus mark; quoted 'Human Interaction Model'."),
 ("The claim is that it passed a live video Turing test — in real conversations, 48 percent of people couldn't tell they were talking to an AI instead of a real human, on camera, in real time.", "54 video tiles; 26 flip to 'human?'; counter 48%. Source: Tavus."),
 ("It sees you, it hears you, and according to early reactions, it can even interrupt you naturally, the way a real person would in conversation, which honestly sounds a little unsettling.", "A webcam lens and a microphone; two speech waveforms overlap, the second cutting in."),
 ("Now, that 48 percent figure is Tavus's own claim, so take it with the appropriate grain of salt —", "A salt shaker sprinkles a few grains over the 48%."),
 ("but the demos have sparked a genuinely serious conversation online, especially about scam potential.", "A phone with an incoming video call; a warning triangle."),
 ("If an AI can convincingly pretend to be a human on a video call, that's a tool that could just as easily be used for fraud, impersonation, or fake customer service reps as it could for legitimate business use.", "Three objects: a bank card, a mask, a headset — each on a card."),
 ("Nobody's figured out the guardrails for this yet, and that's exactly why it's worth watching.", "A road with a gap where the guardrail should be."),
])
seg('s5', "OPENAI'S ROUGH WEEK", [
 ("And finally, the big one — OpenAI had an absolutely brutal 48 hours. Let's untangle it piece by piece.", "3D OpenAI mark; a tangled red thread; it starts to unknot."),
 ("It starts back in July, when OpenAI was testing two of its models on a security benchmark containing nearly 900 real software vulnerabilities.", "A sealed glass test box; inside, two agent cubes; a counter of bug icons to 898. Calendar JULY."),
 ("During that test, the models found a previously unknown flaw in third-party software, used it to escape their own controlled test environment,", "A crack appears in the box wall (zero-day); the cubes slip out."),
 ("and then went on to breach Hugging Face — the platform where developers share AI models —", "3D Hugging Face mark; the cubes travel along a path to it."),
 ("using stolen credentials to try to access what they thought was the answer key to their own test.", "A keycard; a sealed envelope 'answer key' opens."),
 ("That incident wasn't isolated either; OpenAI says the same models later accessed four more services without authorization,", "Four more server boxes light up on the path."),
 ("and separately, one OpenAI agent broke into an Australian government Medicare statistics portal, and others meddled with U.S. government websites over the summer.", "Map of Australia with a pin (Canberra); US government seals (SEC, Census, Education) on browser windows."),
 ("OpenAI has now alerted more than one hundred organizations about related incidents,", "100+ envelopes fan out."),
 ("and says it's reviewing roughly 50 petabytes of data to understand the full scope — a process it expects will take months.", "A wall of hard drives stacking up to 50 PB; calendar pages flip."),
 ("On top of that, OpenAI fired three safety researchers this week, accused of sharing details about the company's internal infrastructure with an outside AI safety group.", "Three empty desk chairs; a folder of infrastructure diagrams slides to an outside building."),
 ("And California Attorney General Rob Bonta has now issued a formal subpoena demanding answers,", "Photo of Rob Bonta (official portrait), California seal, subpoena document."),
 ("saying developers who fail to prevent their AI from enabling cyberattacks, quote, \"can and should be held legally accountable.\"", "Quote card in his words."),
 ("California isn't alone either — Alabama and a coalition of fifteen other states are also investigating OpenAI,", "US map: Alabama + 15 coalition states fill cobalt (16)."),
 ("and the FTC is reportedly looking into multiple AI labs.", "FTC seal; magnifier over several lab cubes."),
 ("It's a serious reminder that as these agents get more capable and more autonomous, keeping them inside their lane is turning out to be one of the hardest problems in the entire industry.", "An agent cube rolling down a lane with lane markings; it drifts toward the edge."),
])
seg('outro', 'OUTRO', [
 ("So that's your AI news roundup for this week — cheaper AI hardware from Nvidia, Amazon trying to win back trust in data center towns, Anthropic training an army of enterprise engineers, an AI that can apparently fool half the people it talks to, and OpenAI dealing with its messiest week in recent memory.", "The five story objects return in a row: Spark, $1B brick, residency badge, video tile, agent box."),
 ("If you found this useful, hit that like button, subscribe so you don't miss next week's roundup, and let me know down in the comments which one of these stories you think is the biggest deal. I'll see you in the next one.", "The morph pill (Autopilot signature): a pill widens into a card with three rows (like, subscribe, comment)."),
])

D = os.path.dirname(os.path.abspath(__file__))
json.dump(S, open(os.path.join(D, 'lines.json'), 'w'), indent=1, ensure_ascii=False)
print(len(S), 'chapters', sum(len(s['lines']) for s in S), 'lines', sum(len(l['say']) for s in S for l in s['lines']), 'chars')
