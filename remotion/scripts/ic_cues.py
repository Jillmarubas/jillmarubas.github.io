#!/usr/bin/env python3
"""Cue lists for The Invisible Cassette, Scenes 2-10 and the act cards, placed by spoken word.

Usage: python3 -I scripts/ic_cues.py            (writes src/invisible-cassette/cues/*.json)
Then:  python3 -I scripts/mix_ic.py src/invisible-cassette/cues/s2.json out/invisible-cassette/mix/s2.wav

Scene times match the EffectCraft scene comps: the voice starts at LEAD (1.0 s), so at("word") is that
word's voiceover time + LEAD, exactly like at() in effectcraft/invisible-cassette/kit2.jsx.
Mix rules (sound-cues page): at most ~5 kinds of sound at once, rumble only on tense stretches, ~0.3 s
of near-silence and a bass drop-out before each "But" turn, sound leads a mood change by a beat.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS = json.load(open(os.path.join(ROOT, "src/invisible-cassette/words.json")))
OUT = os.path.join(ROOT, "src/invisible-cassette/cues")
LEAD = 1.0
A = "out/invisible-cassette/audio/"
VO, MU, SX = A + "vo/", A + "music/", A + "sfx/"
PUB = "public/sfx/"


def norm(w):
    return re.sub(r"[^a-z0-9.$%]", "", w.lower())


def at(scene, phrase, after=0.0):
    ws = WORDS[str(scene)]
    p = [norm(x) for x in phrase.split()]
    for i, w in enumerate(ws):
        if w["s"] < after - LEAD:
            continue
        if all(i + k < len(ws) and norm(ws[i + k]["w"]).startswith(p[k]) for k in range(len(p))):
            return round(w["s"] + LEAD, 2)
    raise SystemExit(f"scene {scene}: '{phrase}' not found after {after}")


def vo(t):
    return round(t + LEAD, 2)


def c(f, t, bus="sfx", **kw):
    d = {"f": f, "at": round(t, 2), "bus": bus}
    d.update(kw)
    return d


def write(name, dur, cues, rumble=(), silence=(), bassout=(), shepard=()):
    os.makedirs(OUT, exist_ok=True)
    json.dump({"duration": round(dur, 2), "cues": cues, "rumble": list(rumble), "silence": list(silence), "bassout": list(bassout), "shepard": list(shepard)},
              open(os.path.join(OUT, name + ".json"), "w"), indent=1)
    print("wrote", name, round(dur, 2), "s,", len(cues), "cues")


def vo_dur(n):
    return {2: 153.69, 3: 180.53, 4: 112.18, 5: 113.03, 6: 97.71, 7: 92.04, 8: 77.42, 9: 88.10}[n]


def scene2():
    S = 2
    end = vo(vo_dur(S)) + 1.8
    tP = at(S, "pleaded")
    cues = [
        c(VO + "scene2.wav", LEAD, "vo"),
        c(MU + "M4.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=3),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "F4a.mp3", 0.3, gain=-5),
        c(SX + "K7a.mp3", vo(26.9) + 0.1, gain=-8),
        c("public/cc1003/sfx/typing-laptop.wav", at(S, "volume") - 0.05, trim=[0, 0.7], gain=-13, fade_out=0.1),
        c("public/cc1003/sfx/typing-laptop.wav", at(S, "price") - 0.05, trim=[1, 1.6], gain=-13, fade_out=0.1),
        c(SX + "A3a.mp3", vo(41.28), "amb", gain=-2, loop_to=vo(84.9), fade_in=1.0, fade_out=1.5),
        c(SX + "K5a.mp3", vo(41.28) + 1.5, gain=-15, loop_to=vo(68.44), fade_in=1.0, fade_out=1.0),
        c(SX + "T3a.mp3", at(S, "catastrophic"), gain=-6),
        c(SX + "F1a.mp3", tP, gain=-3),
        c(SX + "T5a.mp3", at(S, "today") - 0.4, gain=-8),
        c(SX + "E4a.mp3", at(S, "today"), "amb", gain=-6, loop_to=end, fade_in=2.5, fade_out=1.5),
    ]
    write("s2", end, cues,
          rumble=[[vo(57.8), vo(95.0), -20], [vo(107.6), vo(129.16), -22]],
          silence=[[vo(107.6) - 0.35, vo(107.6)]], bassout=[[vo(107.6), 0.7]])


def scene3():
    S = 3
    end = vo(vo_dur(S)) + 1.8
    black = at(S, "went black")
    cues = [
        c(VO + "scene3.wav", LEAD, "vo"),
        c(MU + "M5.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=3),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "E4a.mp3", vo(8.36) - 0.4, "amb", gain=-3, loop_to=vo(39.74), fade_in=0.6, fade_out=1.0),
        c(SX + "K6a.mp3", at(S, "phone") - 0.2, gain=-12, trim=[0, 2.5], fade_out=0.6),
        c(SX + "E1a.mp3", at(S, "inverter"), "amb", gain=-8, loop_to=vo(60.78), fade_in=0.8, fade_out=0.8),
        c(SX + "E3a.mp3", vo(66.6) - 0.5, "amb", gain=-2, loop_to=black, fade_in=1.0, fade_out=0.05),
        c(SX + "K4a.mp3", at(S, "protection"), gain=-6),
        c(SX + "K4b.mp3", at(S, "cut off"), gain=-6),
        c(SX + "T3b.mp3", black, gain=-4),
        c(SX + "E5a.mp3", at(S, "twisted") - 0.3, gain=-6),
        c(SX + "A4a.mp3", at(S, "2003") - 0.5, "amb", gain=-4, loop_to=vo(146.0), fade_in=0.8, fade_out=1.0),
        c(SX + "K4c.mp3", at(S, "automatic systems"), gain=-6),
        c(SX + "T3c.mp3", at(S, "biologically"), gain=-7),
    ]
    write("s3", end, cues,
          rumble=[[vo(66.6), black, -19], [vo(126.32), vo(163.68), -21]],
          silence=[[vo(39.74) - 0.3, vo(39.74)], [black, black + 1.2]], bassout=[[vo(39.74), 0.7]])


def scene4():
    S = 4
    end = vo(vo_dur(S)) + 1.8
    cues = [
        c(VO + "scene4.wav", LEAD, "vo"),
        c(MU + "M6.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=2.5),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "K7a.mp3", at(S, "if voltage") - 0.4, gain=-9),
        c("public/cc1003/sfx/typing-laptop.wav", at(S, "if voltage"), trim=[0, 0.8], gain=-13, fade_out=0.1),
        c("public/cc1003/sfx/typing-laptop.wav", at(S, "open a"), trim=[1, 1.7], gain=-13, fade_out=0.1),
        c(SX + "E1a.mp3", vo(20.1), "amb", gain=-9, loop_to=vo(38.0), fade_in=0.6, fade_out=0.8),
        c(SX + "A3a.mp3", vo(38.0), "amb", gain=-3, loop_to=vo(92.2), fade_in=1.0, fade_out=1.5),
        c(SX + "T5b.mp3", at(S, "they learn by") - 0.3, gain=-9),
        c(SX + "K4a.mp3", at(S, "switch"), gain=-7),
        c(SX + "K4b.mp3", at(S, "reroute"), gain=-7),
        c(SX + "T3a.mp3", at(S, "explainability"), gain=-5),
    ]
    write("s4", end, cues,
          rumble=[[vo(101.9), end, -20]],
          silence=[[vo(20.1) - 0.3, vo(20.1)], [vo(101.9) - 0.3, vo(101.9)]], bassout=[[vo(20.1), 0.7], [vo(101.9), 0.7]])


def scene5():
    S = 5
    end = vo(vo_dur(S)) + 1.8
    cues = [
        c(VO + "scene5.wav", LEAD, "vo"),
        c(MU + "M7.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=2.5),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "E5a.mp3", at(S, "fracture") - 0.2, gain=-10),
        c(SX + "F7b.mp3", at(S, "metal fatigue"), gain=-10),
        c(SX + "K7a.mp3", vo(20.9), gain=-9),
        c("public/cc1003/sfx/typing-laptop.wav", at(S, "execution"), trim=[0, 3.0], gain=-15, fade_out=0.3),
        c(SX + "T4a.mp3", at(S, "deep reinforcement") - 0.4, gain=-9),
        c(SX + "T5a.mp3", at(S, "thousands") - 0.3, gain=-9),
        c(SX + "A3a.mp3", vo(51.8), "amb", gain=-3, loop_to=vo(75.5), fade_in=0.8, fade_out=1.0),
        c(SX + "T3b.mp3", at(S, "why") - 0.4, gain=-6),
    ]
    write("s5", end, cues, rumble=[[vo(86.2), end, -21]],
          silence=[[vo(32.9) - 0.3, vo(32.9)]], bassout=[[vo(32.9), 0.7]])


def scene6():
    S = 6
    end = vo(vo_dur(S)) + 1.8
    off = at(S, "switch off")
    cues = [
        c(VO + "scene6.wav", LEAD, "vo"),
        c(MU + "M8.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=2.5),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "F3a.mp3", at(S, "researchers"), gain=-6),
        c(SX + "F2a.mp3", at(S, "flipped") + 0.6, gain=-6),
        c(SX + "E3a.mp3", vo(48.2), "amb", gain=-4, loop_to=vo(65.4), fade_in=0.8, fade_out=1.0),
        c(SX + "K9a.mp3", off, gain=-4),
        c(SX + "F1a.mp3", at(S, "blackout"), gain=-4),
        c(SX + "T3c.mp3", at(S, "zero", vo(70)), gain=-6),
        c(SX + "K7a.mp3", at(S, "loss function") - 0.3, gain=-9),
    ]
    write("s6", end, cues, rumble=[[vo(48.2), vo(65.4), -21], [vo(86.0), end, -21]],
          silence=[[off - 0.3, off]], bassout=[[off, 0.7]])


def scene7():
    S = 7
    end = vo(vo_dur(S)) + 1.8
    cues = [
        c(VO + "scene7.wav", LEAD, "vo"),
        c(MU + "M9.mp3", 0, "music", trim=[0, end], fade_in=2, fade_out=2.5),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "A5a.mp3", vo(6.7) - 0.4, "amb", gain=-2, loop_to=vo(24.0), fade_in=0.8, fade_out=1.0),
        c(SX + "A6a.mp3", vo(24.0) - 0.4, "amb", gain=-3, loop_to=vo(49.5), fade_in=0.8, fade_out=1.0),
        c(SX + "K5a.mp3", at(S, "data link"), gain=-14, trim=[0, 4], fade_out=0.8),
        c(SX + "A9a.mp3", vo(49.5) - 0.4, "amb", gain=-2, loop_to=vo(61.3), fade_in=0.8, fade_out=1.0),
        c(SX + "K7a.mp3", at(S, "control rooms") - 0.3, gain=-9),
        c(SX + "T6a.mp3", vo(72.1) - 0.5, gain=-8),
        c(SX + "A3a.mp3", vo(72.1), "amb", gain=-6, loop_to=end, fade_in=1.0, fade_out=1.5),
        c(SX + "T3a.mp3", at(S, "spectators"), gain=-7),
    ]
    write("s7", end, cues, rumble=[[vo(72.1), end, -22]])


def scene8():
    S = 8
    end = vo(vo_dur(S)) + 1.8
    c1, c2, c3 = at(S, "cannot turn") - 0.2, at(S, "civilization") - 0.2, at(S, "without")
    cues = [
        c(VO + "scene8.wav", LEAD, "vo"),
        c(MU + "M10.mp3", 0, "music", trim=[0, c1], fade_in=2, fade_out=0.05),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "K9a.mp3", at(S, "provide"), gain=-6),
        c(SX + "K4a.mp3", at(S, "latency"), gain=-7),
        c(SX + "A7a.mp3", vo(18.6), "amb", gain=-4, loop_to=vo(37.0), fade_in=1.0, fade_out=1.0),
        c(SX + "E2a.mp3", vo(37.0), "amb", gain=-8, loop_to=vo(63.6), fade_in=1.0, fade_out=1.0),
        c(SX + "A6a.mp3", vo(50.4), "amb", gain=-6, loop_to=vo(63.6), fade_in=0.8, fade_out=0.8),
        c(SX + "K9b.mp3", at(S, "off", vo(64)), gain=-3),
        c(SX + "T3a.mp3", c1, gain=-3), c(SX + "T3b.mp3", c2, gain=-3), c(SX + "T3c.mp3", c3, gain=-3),
        c(MU + "M10.mp3", c3 + 0.4, "music", trim=[70, 74], fade_in=0.5, fade_out=2.0, gain=-4),
    ]
    write("s8", end, cues, rumble=[[vo(18.6), c1, -20]], shepard=[[0.5, c1, -16]],
          silence=[[c1 - 0.35, c1]], bassout=[[c1, 0.7]])


def scene9():
    S = 9
    end = vo(vo_dur(S)) + 3.0
    m12 = at(S, "fraction") - 3.0
    cues = [
        c(VO + "scene9.wav", LEAD, "vo"),
        c(MU + "M11.mp3", 0, "music", trim=[0, m12 + 2], fade_in=2, fade_out=2.5),
        c(MU + "M12.mp3", m12, "music", trim=[0, end - m12], fade_in=1.5, fade_out=0.05),
        c(PUB + "whoosh7.mp3", 0, gain=-8),
        c(SX + "A8a.mp3", vo(41.9) - 0.5, "amb", gain=-2, loop_to=vo(59.2), fade_in=1.0, fade_out=1.2),
        c(SX + "A9a.mp3", vo(59.2), "amb", gain=-8, loop_to=vo(70.4), fade_in=1.0, fade_out=0.8),
        c(SX + "T3c.mp3", at(S, "edge"), gain=-6),
        c(SX + "T2a.mp3", at(S, "bargain") - 0.2, gain=-8),
    ]
    write("s9", end, cues, rumble=[[vo(70.4), vo(81.9), -21]],
          silence=[[vo(70.4) - 0.3, vo(70.4)]], bassout=[[vo(70.4), 0.7]])


def scene10():
    cues = [
        c(MU + "M12.mp3", 0, "music", trim=[22.0, 40.0], fade_in=0.5, fade_out=3.0, gain=2),
        c(SX + "A1a.mp3", 0, "amb", gain=-6, loop_to=19.0, fade_in=1.0, fade_out=0.3),
        c("public/cc1003/sfx/typing-laptop.wav", 1.4, trim=[0, 2.6], gain=-14, fade_out=0.2),
        c("public/cc1003/sfx/typing-laptop.wav", 6.4, trim=[3, 5.5], gain=-14, fade_out=0.2),
        c(SX + "K8a.mp3", 18.4, gain=-5),
    ]
    write("s10", 22.0, cues)


def act_cards():
    # music-only cards, 15 s: the card's own cue, a low chime as the title lands
    for n in range(1, 5):
        write(f"c{n}", 15.0, [
            c(MU + f"C{n}.mp3", 0, "music", trim=[0, 15.0], fade_in=1.0, fade_out=2.5, gain=4),
            c(PUB + "whoosh7.mp3", 0, gain=-9),
            c(SX + "T2a.mp3", 3.3, gain=-8),
        ])


if __name__ == "__main__":
    scene2()
    scene3()
    scene4()
    scene5()
    scene6()
    scene7()
    scene8()
    scene9()
    scene10()
    act_cards()
