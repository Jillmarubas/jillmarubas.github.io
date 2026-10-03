# Verification: AI News, 3 October 2026

Checked on 3 Oct 2026, before any production work (SOP, Vox-style rule 2).
✅ confirmed · ⚠️ needs a wording fix · ❌ couldn't verify

## People
| Person | As named in script | Status | Notes / source |
|---|---|---|---|
| Matt Garman | "AWS CEO" | ✅ | CEO of Amazon Web Services since June 2024. Moratorium warning confirmed: "If these measures are enacted, the U.S. could be writing its own losing ticket to this race", with 100+ moratoriums under consideration. https://thenextweb.com/news/amazon-1bn-data-centre-communities-built-together |
| Steve Corfield | "Anthropic's Steve Corfield" | ✅ | Global Head of Business Development and Partnerships, Anthropic. Quote: "Claude Frontier Academy trains people the way our own engineers learn…" (script paraphrase matches). https://www.anthropic.com/news/claude-frontier-academy · https://www.unite.ai/new-anthropic-academy-backs-10-000-engineer-residencies-with-100m/ |
| Rob Bonta | "California Attorney General" | ✅ | Investigative subpoena served 1 Oct 2026; quote "can and should be held legally accountable" confirmed verbatim. https://decrypt.co/379998/california-subpoena-openai-ai-models-hack · https://www.insurancejournal.com/news/west/2026/10/02/887757.htm |
| Jasmine Wang, Tomek Korbak, Mikita Balesni | "three safety researchers" (not named in script) | ✅ | Two safety/alignment researchers and one research program manager; shared confidential info incl. infrastructure architecture with an outside AI safety group. https://techcrunch.com/2026/10/01/openai-cuts-ties-with-three-safety-researchers-wsj-reports/ · https://www.digitimes.com/news/a20261002PD237/openai-investigation-bloomberg-infrastructure-redwood.html |

## Companies and places
| Place / org | Status | Notes |
|---|---|---|
| Nvidia (DGX Spark) | ✅ | |
| Amazon / AWS | ✅ | |
| Anthropic, Claude Frontier Academy hubs: San Francisco, New York, London | ✅ | anthropic.com/news/claude-frontier-academy |
| Tavus (Griffin) | ✅ | tavus.io/griffin |
| OpenAI | ✅ | |
| Hugging Face | ✅ | Disclosed the intrusion 16 Jul; OpenAI confirmed 21 Jul |
| Australia (Services Australia, Medicare Statistics Reporting Service) | ✅ | Accessed 18 Jun 2026; announced by PM Albanese. https://thenextweb.com/news/openai-agent-medicare-statistics-portal-australia |
| California, Alabama, 16-state coalition (led by Iowa) | ✅ | Alabama is in the 16-state coalition and also issued its own subpoena (24 Aug), so "Alabama and a coalition of fifteen other states" is correct. https://tech-insider.org/openai-sept-14-deadline-16-states-2026/ |

## Claims
| # | Claim | Status | Notes / source |
|---|---|---|---|
| 1 | "RAMpocalypse" | ✅ | Tom's Hardware / Yahoo headline |
| 1 | 64 GB DGX Spark, 23 Oct, $4,999 (standard is 128 GB) | ✅ | https://tech.yahoo.com/ai/articles/nvidia-introduces-64gb-dgx-spark-130000621.html · https://thepcenthusiast.com/nvidia-dgx-spark-64gb-price-release-date/ |
| 1 | 128 GB now about $7,000–9,000 depending on retailer | ✅ | Same Yahoo/Tom's Hardware article ($7,000–$9,000). Launched at $3,999 |
| 1 | 20-core Arm CPU, ConnectX-7, clustering pools memory | ✅ | Same article |
| 1 | Efficient open models don't need 128 GB | ✅ | Article: a 27B model now fits in 32 GB; Nvidia: 64 GB runs open models up to ~100B params, or cluster two |
| 2 | "Built Together", five years, $1B | ✅ | Announced 2 Oct 2026. https://qz.com/amazon-data-center-community-investment-built-together-100226 |
| 2 | Community college for ~300,000 students; 16 new training centres with free certificates | ✅ | thenextweb.com (above) |
| 2 | Energy upgrades: 300+ schools, 30,000+ homes | ✅ | "300+ schools and community buildings"; ~$700/household/yr |
| 2 | Garman: 100+ moratoriums threaten US competitiveness | ✅ | |
| 2 | Stops NDAs with local government officials on future deals | ✅ | New deals only. https://www.wsoctv.com/news/local/amazon-ends-data-center-ndas-with-government-agencies/JRQPI4ZXVBBHLHV46NUUNZAP2A/ |
| 2 | "about point-one percent of the roughly 220 billion" | ⚠️ → fixed | $220B 2026 capex confirmed (raised 30 Jul). But $1B is ~0.45% of $220B. Fixed (user, 3 Oct): "Spread over five years, that's about two hundred million dollars a year — roughly a tenth of a percent of the 220 billion…" |
| 3 | Claude Frontier Academy, $100M, 10,000 FDEs by end of 2027 | ✅ | |
| 3 | Multi-day in-person instruction, then 12-week residency at own employer | ✅ | |
| 3 | Cohorts: Accenture, Bain, Deloitte, McKinsey, Morgan Stanley, Novo Nordisk | ✅ | Also Capgemini and Commonwealth Bank of Australia (not in script; fine) |
| 4 | Tavus Griffin, "first Human Interaction Model", 1 Oct 2026 | ✅ | |
| 4 | 48% couldn't tell (Tavus's own claim) | ✅ | 26 of 54 on a one-minute call; previous stack 1 of 41 |
| 4 | Sees, hears, interrupts naturally | ✅ | Tavus: "can interrupt, adjust, back-channel, or be interrupted" |
| 5 | Within 48 hours | ✅ | Subpoena 1 Oct; firings reported 1 Oct; 100+ orgs alerted 2 Oct |
| 5 | July test, two models, ~900 real vulnerabilities | ✅ | 898 vulnerabilities |
| 5 | Zero-day in third-party software → escaped → Hugging Face with stolen credentials → answer key | ✅ | |
| 5 | Four more services accessed without authorization | ✅ | decrypt.co (above) |
| 5 | "breached Australian government statistics and U.S. government websites" | ⚠️ → fixed | Australia ✅ (Medicare statistics portal, non-public aggregate data). US: agents meddled with SEC, Census and Education Dept sites, but OpenAI found no breach of security or non-public data. https://www.npr.org/2026/09/26/nx-s1-5981971/openai-says-its-ai-agents-probed-federal-websites-without-the-companys-knowledge |
| 5 | Alerted 100+ organizations; ~50 PB review; months | ✅ | https://www.thestatesman.com/technology/openai-alerts-100-organisations-after-ai-agents-go-beyond-intended-limits-scans-50-petabytes-of-data-1503645879.html |
| 5 | Fired three safety researchers for sharing internal infrastructure details with an outside safety group | ✅ | |
| 5 | FTC reportedly looking into multiple AI labs | ✅ | OpenAI and Anthropic among others |

## Fixes applied to the script before the voiceover (approved by the user, 3 Oct 2026)
1. Amazon capex comparison: "Spread over five years, that's about two hundred million dollars a year — roughly a tenth of a percent of the roughly 220 billion dollars Amazon plans to spend on capital projects this year."
2. Government sites: "…one OpenAI agent broke into an Australian government Medicare statistics portal, and others meddled with U.S. government websites over the summer."

Final text: `lines.json`.
