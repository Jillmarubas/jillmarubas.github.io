#!/usr/bin/env python3
"""Synthesise the whole soundtrack for "The Giant from the Sea" (no samples, no credits).

Every sound effect is built from oscillators, noise and filters; voices (screams, crying,
laughter, cheers) use a small source-filter vocal synth with formants. The cue list and shot
timing come from src/kaiju/timeline.json, so sound and picture share one source.

Writes out/kaiju-mix.wav (stereo, 44.1 kHz).
"""
import json
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TL = json.load(open(os.path.join(ROOT, 'src/kaiju/timeline.json')))
rng = np.random.default_rng(7)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def lp(x, f, o=4):
    return signal.sosfilt(signal.butter(o, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, o=4):
    return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, o=3):
    return signal.sosfilt(signal.butter(o, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)


def env(n, a=0.01, r=0.2, hold=None):
    """Attack/hold/release envelope over n samples (times in seconds)."""
    e = np.ones(n)
    na = max(1, int(a * SR))
    nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def expdec(n, k):
    return np.exp(-np.arange(n) / SR * k)


def norm(x, p=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * p


def osc(f, d, kind='sin'):
    """f may be a scalar or an array (per-sample frequency)."""
    n = int(d * SR)
    f = np.broadcast_to(np.asarray(f, dtype=float), (n,)) if np.ndim(f) == 0 else f[:n]
    ph = np.cumsum(f) / SR
    if kind == 'sin':
        return np.sin(2 * np.pi * ph)
    if kind == 'saw':
        return 2 * (ph % 1) - 1
    if kind == 'sq':
        return np.sign(np.sin(2 * np.pi * ph))
    if kind == 'tri':
        return 2 * np.abs(2 * (ph % 1) - 1) - 1
    raise ValueError(kind)


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[: len(p)] += p
    return out


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i : i + len(x)] += x


# ------------------------------------------------------------------ the vocal synth
FORMANTS = {
    'a': [(800, 80), (1150, 90), (2900, 120)],
    'e': [(400, 60), (2000, 100), (2550, 120)],
    'i': [(300, 50), (2300, 100), (3000, 120)],
    'o': [(450, 70), (800, 80), (2830, 100)],
    'u': [(325, 50), (700, 60), (2530, 100)],
}


def voice(f0, d, vowel='a', vowel2=None, breath=0.15, rough=0.0, vib=5.5, vibd=0.02, jitter=0.01, scale=1.0):
    """Source-filter voice. f0: scalar or per-sample array. scale shifts formants (kids ~1.25)."""
    n = int(d * SR)
    t = np.arange(n) / SR
    f0 = np.broadcast_to(np.asarray(f0, dtype=float), (n,)) if np.ndim(f0) == 0 else np.asarray(f0)[:n]
    wob = 1 + vibd * np.sin(2 * np.pi * vib * t) + jitter * lp(rng.standard_normal(n), 30)
    f = f0 * wob
    ph = np.cumsum(f) / SR
    # glottal-ish pulse train: sum of harmonics with -12 dB/oct tilt
    src = np.zeros(n)
    for h in range(1, 40):
        mask = (f * h) < SR / 2 - 500
        src += mask * np.sin(2 * np.pi * h * ph) / h ** 1.1
    if rough > 0:
        src *= 1 + rough * np.sin(2 * np.pi * (40 + 20 * rng.random()) * t) * lp(rng.standard_normal(n), 200) * 3
    src += breath * rng.standard_normal(n) * 0.6
    out = np.zeros(n)
    fa = FORMANTS[vowel]
    fb = FORMANTS[vowel2] if vowel2 else fa
    # split into two halves to morph vowels cheaply
    for part, frm in ((slice(0, n // 2 + 2000), fa), (slice(n // 2 - 2000, n), fb)):
        seg = src[part]
        y = np.zeros(len(seg))
        for k, (fc, bw) in enumerate(frm):
            fc *= scale
            lo, hi = max(50, fc - bw * 2.5), fc + bw * 2.5
            y += bp(seg, lo, hi, 2) * (1.0, 0.7, 0.4)[k]
        w = np.ones(len(seg))
        if part.start and part.start > 0:
            w[:4000] = np.linspace(0, 1, 4000)
        if part.stop and part.stop < n:
            w[-4000:] = np.linspace(1, 0, 4000)
        out[part] += y * w
    return out


def glide(a, b, d, curve=1.0):
    u = np.linspace(0, 1, int(d * SR)) ** curve
    return a + (b - a) * u


# ------------------------------------------------------------------ sound effects
def sfx_scream(kid=True, d=1.6, seed=0):
    r = np.random.default_rng(seed)
    f_hi = (900 if kid else 620) * (0.85 + r.random() * 0.3)
    f0 = np.concatenate([glide(f_hi * 0.7, f_hi, 0.15), glide(f_hi, f_hi * 1.05, d - 0.45), glide(f_hi * 1.05, f_hi * 0.6, 0.3)])
    v = voice(f0, len(f0) / SR, 'a', 'e' if r.random() > 0.5 else 'a', breath=0.35, rough=0.35, vib=6.5, vibd=0.03, jitter=0.03, scale=1.3 if kid else 1.05)
    return v * env(len(v), 0.04, 0.35)


def crowd_scream(d=4.5, n=14, kid_share=0.3):
    out = np.zeros(int(d * SR))
    for i in range(n):
        s = sfx_scream(kid=rng.random() < kid_share, d=0.9 + rng.random() * 1.4, seed=100 + i)
        place(out, s * (0.5 + rng.random() * 0.5), rng.random() * (d - 1.2))
    return out


def kid_cry(d=3.0, seed=1):
    out = np.zeros(int(d * SR))
    t0 = 0.0
    k = 0
    while t0 < d - 0.6:
        L = 0.55 + rng.random() * 0.35
        f0 = np.concatenate([glide(420, 520, 0.12), glide(520, 400, L - 0.12, 0.7)])
        w = voice(f0, len(f0) / SR, 'a', 'u', breath=0.25, rough=0.12, vib=7, vibd=0.04, jitter=0.03, scale=1.3)
        w *= env(len(w), 0.05, 0.25)
        place(out, w, t0)
        # a hiccuping inhale between sobs
        inh = bp(noise(0.18), 1500, 5000) * env(int(0.18 * SR), 0.1, 0.05) * 0.25
        place(out, inh, t0 + L + 0.02)
        t0 += L + 0.25 + rng.random() * 0.1
        k += 1
    return out


def kid_sob(d=3.0):
    return kid_cry(d) * 0.5


def kids_laugh(d=1.6, voices=3):
    out = np.zeros(int(d * SR))
    for v in range(voices):
        f = 360 + v * 60 + rng.random() * 40
        t0 = rng.random() * 0.2
        for i in range(int(d * 5.5)):
            L = 0.09 + rng.random() * 0.03
            h = voice(glide(f * 1.05, f * 0.9, L), L, 'a', breath=0.45, jitter=0.02, scale=1.3) * env(int(L * SR), 0.01, 0.05)
            place(out, h * (1 - i / (d * 6)), t0 + i * 0.17)
    return out


def kid_giggle(d=1.0):
    return kids_laugh(d, 1)


def kid_cheer(d=1.4, voices=1):
    out = np.zeros(int(d * SR) + SR)
    for v in range(voices):
        f = 420 + rng.random() * 120
        L = d * (0.8 + rng.random() * 0.3)
        c = voice(np.concatenate([glide(f, f * 1.45, 0.3), glide(f * 1.45, f * 1.35, L - 0.3)]), L, 'e', 'a', breath=0.25, rough=0.1, scale=1.3)
        place(out, c * env(len(c), 0.05, 0.4), rng.random() * 0.3)
    return out


def kids_cheer(d=2.2):
    return kid_cheer(d, 5)


def kids_scream(d=2.0):
    out = np.zeros(int(d * SR) + SR)
    for i in range(3):
        place(out, sfx_scream(True, 1.2 + rng.random() * 0.6, seed=10 + i), i * 0.12)
    return out


def kid_gasp(d=0.6):
    x = bp(noise(d), 900, 4500) * np.linspace(0.2, 1, int(d * SR)) ** 2 * env(int(d * SR), 0.02, 0.08)
    return x * 0.8


def mom_shout(d=1.2):
    out = np.zeros(int(d * SR))
    for i, L in enumerate((0.35, 0.45)):
        f0 = glide(420, 330, L)
        place(out, voice(f0, L, 'o', 'a', breath=0.25, rough=0.15, scale=1.1) * env(int(L * SR), 0.02, 0.12), i * 0.5)
    return out


def hero_voice(d=0.7):
    f0 = np.concatenate([glide(140, 220, 0.12), glide(220, 170, d - 0.12)])
    v = voice(f0, d, 'a', 'a', breath=0.2, rough=0.25, scale=0.9)
    return v * env(len(v), 0.02, 0.2)


def roar(d=2.8, hurt=False):
    n = int(d * SR)
    t = np.arange(n) / SR
    base = (110 if hurt else 70) * (1 + 0.25 * np.sin(np.pi * t / d)) * (1.25 - 0.4 * t / d)
    v = voice(base, d, 'a', 'o', breath=0.6, rough=0.9, vib=9, vibd=0.05, jitter=0.08, scale=0.55)
    sub = osc(base / 2, d) * 0.6
    grit = bp(noise(d), 120, 1600) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t))
    x = np.tanh((v * 1.4 + sub + grit * 0.5) * 2.2)
    return x * env(n, 0.12, 0.8)


def rumble(d=3.0, grow=False):
    n = int(d * SR)
    x = lp(noise(d), 90, 4) * 6 + osc(32 + 4 * np.sin(np.arange(n) / SR * 2), d) * 0.5
    e = np.linspace(0.2, 1, n) ** (1.5 if grow else 0.6)
    return x * e * env(n, 0.4, 0.8)


def chain_rattle(d=2.5):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 22)):
        L = 0.03
        c = bp(noise(L), 2500, 7000) * expdec(int(L * SR), 120)
        ring = sum(osc(f, 0.12) for f in (3100, 4630, 5870)) * expdec(int(0.12 * SR), 40) * 0.1
        place(out, mix(c, ring) * (0.3 + rng.random() * 0.7), rng.random() * (d - 0.15))
    return out


def gulls(d=4.0, panic=False):
    out = np.zeros(int(d * SR))
    k = int(d * (5 if panic else 1.6))
    for _ in range(k):
        L = 0.28 if not panic else 0.18
        f = glide(2100, 1300, L, 0.6) * (0.9 + rng.random() * 0.2)
        c = (osc(f, L) + 0.4 * osc(f * 2, L) + 0.2 * osc(f * 3, L)) * env(int(L * SR), 0.02, 0.1)
        place(out, c * (0.3 + rng.random() * 0.6), rng.random() * (d - L))
    return out


def ambience_park(d=6.0):
    breeze = lp(noise(d), 500) * 0.5 * (0.7 + 0.3 * np.sin(np.arange(int(d * SR)) / SR * 0.8))
    birds = np.zeros(int(d * SR))
    for _ in range(int(d * 3)):
        L = 0.08 + rng.random() * 0.1
        f = glide(3000 + rng.random() * 1500, 4200 + rng.random() * 1500, L)
        place(birds, osc(f, L) * env(int(L * SR), 0.01, 0.04) * 0.25, rng.random() * (d - 0.3))
    waves = lp(noise(d), 700) * (0.5 + 0.5 * np.sin(np.arange(int(d * SR)) / SR * 1.1) ** 2) * 0.8
    return breeze + birds + waves


def swing_creak(d=4.5):
    out = np.zeros(int(d * SR))
    for i in range(int(d / 1.3)):
        L = 0.35
        f = 900 + 180 * np.sin(np.linspace(0, np.pi, int(L * SR)))
        s = (osc(f, L, 'saw') * 0.3 + osc(f * 1.5, L) * 0.2) * env(int(L * SR), 0.05, 0.1)
        place(out, bp(s, 600, 3000) * 0.5, i * 1.3)
    return out


def whoosh(d=0.9, lo=300, hi=2500, up=True):
    n = int(d * SR)
    x = noise(d)
    out = np.zeros(n)
    steps = 24
    for i in range(steps):
        a, b = i * n // steps, (i + 1) * n // steps
        u = i / (steps - 1)
        fc = lo + (hi - lo) * (u if up else 1 - u)
        out[a:b] = bp(x[a:b], fc * 0.6, fc * 1.6, 2)
    return out * np.sin(np.pi * np.arange(n) / n) ** 1.5


def slide(d=1.4):
    return whoosh(d, 400, 1800) * 0.8 + bp(noise(d), 180, 500) * 0.3 * env(int(d * SR), 0.1, 0.4)


def boom(d=2.5, f0=55, f1=28):
    n = int(d * SR)
    s = osc(glide(f0, f1, d, 0.4), d) * expdec(n, 1.8)
    th = lp(noise(0.4), 300) * expdec(int(0.4 * SR), 8) * 2
    return np.tanh(mix(s * 1.3, th) * 1.5)


def splash(d=3.5, big=True):
    n = int(d * SR)
    x = noise(d)
    out = np.zeros(n)
    steps = 30
    for i in range(steps):
        a, b = i * n // steps, (i + 1) * n // steps
        fc = 6000 * (1 - i / steps) ** 1.5 + 300
        out[a:b] = lp(x[a:b], fc, 2)
    out *= np.concatenate([np.linspace(0, 1, int(0.03 * SR)), np.ones(n - int(0.03 * SR))]) * expdec(n, 1.1)
    if big:
        out = mix(out, boom(d, 60, 25) * 0.9)
    # bubbles and droplets
    for _ in range(int(d * 20)):
        L = 0.04
        f = glide(600 + rng.random() * 1200, 1600 + rng.random() * 1800, L)
        place(out, osc(f, L) * env(int(L * SR), 0.005, 0.02) * 0.2, 0.3 + rng.random() * (d - 0.4))
    return out


def water_cascade(d=4.0):
    return lp(noise(d), 2500) * env(int(d * SR), 0.3, 1.5) * 0.8


def water_swell(d=4.0):
    x = lp(noise(d), 400) * np.linspace(0.2, 1, int(d * SR)) ** 2
    bub = np.zeros(int(d * SR))
    for _ in range(int(d * 12)):
        L = 0.06
        place(bub, osc(glide(200 + rng.random() * 300, 500 + rng.random() * 600, L), L) * env(int(L * SR), 0.01, 0.03) * 0.3, rng.random() * (d - 0.1))
    return x * 1.5 + bub + rumble(d, True) * 0.6


def wave_crash(d=3.0):
    n = int(d * SR)
    x = lp(noise(d), 3000)[:n] * np.concatenate([np.linspace(0, 1, n // 4) ** 2, expdec(n - n // 4, 1.6)])
    return x + lp(noise(d), 200) * env(n, 0.5, 1.0) * 1.5


def boat_horn(d=1.8):
    s = osc(110, d, 'saw') + osc(165, d, 'saw') * 0.7
    return lp(s, 900) * env(int(d * SR), 0.1, 0.4) * 0.6


def stomp(d=1.8, water=False):
    x = mix(boom(d, 70, 26) * 1.2, lp(noise(0.3), 1200) * expdec(int(0.3 * SR), 10) * 0.8)
    if water:
        x = mix(x, splash(2.2, False) * 0.7)
    return x


def footsteps(d=4.0, rate=9, crowd=True):
    out = np.zeros(int(d * SR))
    n = int(d * rate * (3 if crowd else 1))
    for i in range(n):
        L = 0.06
        s = lp(noise(L), 900) * expdec(int(L * SR), 60) + osc(90, L) * expdec(int(L * SR), 50) * 0.5
        at = rng.random() * (d - L) if crowd else i / rate
        place(out, s * (0.3 + rng.random() * 0.7), at)
    return out


def siren(d=3.5):
    t = np.arange(int(d * SR)) / SR
    f = 950 + 350 * np.sin(2 * np.pi * 0.6 * t)
    s = osc(f, d, 'tri') + 0.3 * osc(f * 2, d, 'tri')
    return s * env(len(s), 0.4, 0.8) * 0.5


def tire_screech(d=1.0):
    t = np.arange(int(d * SR)) / SR
    f = 2300 + 300 * np.sin(2 * np.pi * 13 * t)
    s = osc(f, d, 'saw') * 0.3 + bp(noise(d), 1800, 4000) * 0.8
    return bp(s, 1200, 5000) * env(len(s), 0.05, 0.2)


def glass(d=1.6):
    out = np.zeros(int(d * SR))
    for _ in range(40):
        L = 0.3
        f = 3000 + rng.random() * 6000
        place(out, osc(f, L) * expdec(int(L * SR), 18 + rng.random() * 20) * (0.2 + rng.random() * 0.5), rng.random() ** 1.6 * (d - L))
    out[: int(0.05 * SR)] += hp(noise(0.05), 3000) * 0.8
    return out


def car_crash(d=2.2):
    n = int(d * SR)
    hit = np.tanh(lp(noise(d), 2500) * expdec(n, 5) * 3)
    metal = sum(osc(f, d) * expdec(n, k) for f, k in ((310, 4), (577, 5), (891, 6), (1340, 8), (2210, 10))) * 0.4
    return mix(hit, metal, boom(d, 60, 30) * 0.8)


def car_horn(d=0.8):
    return lp(osc(420, d, 'sq') + osc(520, d, 'sq'), 2500) * env(int(d * SR), 0.01, 0.05) * 0.4


def car_alarm(d=2.0):
    t = np.arange(int(d * SR)) / SR
    f = np.where((t * 4) % 1 < 0.5, 1400, 1050)
    return osc(f, d, 'sq') * 0.25 * env(len(t), 0.01, 0.2)


def building_collapse(d=4.5):
    n = int(d * SR)
    body = lp(noise(d), 400) * np.concatenate([np.linspace(0.3, 1, n // 3), expdec(n - n // 3, 0.8)]) * 3
    cr = np.zeros(n)
    for _ in range(40):
        L = 0.12
        place(cr, lp(noise(L), 2000) * expdec(int(L * SR), 30) * (0.3 + rng.random()), rng.random() * (d - 0.2))
    return mix(body, cr, boom(d, 50, 25))


def debris(d=2.5):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 20)):
        L = 0.08 + rng.random() * 0.1
        fc = 400 + rng.random() * 2500
        place(out, bp(noise(L), fc * 0.5, fc * 1.5) * expdec(int(L * SR), 25) * (0.2 + rng.random() * 0.8), rng.random() * (d - 0.2))
    gravel = hp(noise(d), 1500) * 0.15 * env(int(d * SR), 0.05, 1.0)
    return out + gravel


def charge_up(d=2.0):
    n = int(d * SR)
    f = glide(80, 700, d, 1.6)
    s = osc(f, d, 'saw') + osc(f * 1.01, d, 'saw') + osc(f * 0.5, d, 'saw')
    cr = hp(noise(d), 3000) * (rng.random(n) > 0.995) * 3
    return lp(s, 3000) * np.linspace(0.1, 1, n) * 0.4 + cr * 0.3


def beam_fire(d=1.8, f=110, col=1.0):
    n = int(d * SR)
    t = np.arange(n) / SR
    s = osc(f * (1 + 0.02 * np.sin(2 * np.pi * 7 * t)), d, 'saw') + osc(f * 2.01, d, 'saw') * 0.5
    buzz = bp(noise(d), 300 * col, 4000 * col) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    x = np.tanh((lp(s, 2500 * col) + buzz * 0.6) * 1.8)
    return x * env(n, 0.03, 0.4)


def beam_clash(d=4.0):
    a = beam_fire(d, 110)
    b = beam_fire(d, 196, 1.6)
    cr = np.zeros(int(d * SR))
    for _ in range(int(d * 30)):
        L = 0.02
        place(cr, hp(noise(L), 2000) * (0.3 + rng.random()), rng.random() * (d - L))
    return mix(a * 0.6, b * 0.6, cr * 0.5, rumble(d) * 0.8)


def explosion(d=3.5):
    n = int(d * SR)
    x = noise(d)
    out = np.zeros(n)
    steps = 30
    for i in range(steps):
        a, b = i * n // steps, (i + 1) * n // steps
        out[a:b] = lp(x[a:b], 5000 * (1 - i / steps) ** 2 + 150, 2)
    out *= expdec(n, 1.2)
    return np.tanh(mix(out * 3, boom(d, 45, 20) * 1.5, debris(d) * 0.5) * 1.2)


def distant_boom(d=2.5):
    return lp(explosion(d), 300) * 0.8


def chime(d=2.5):
    out = np.zeros(int(d * SR))
    for i, f in enumerate((1318.5, 1567.98, 1975.53, 2637.02, 3135.96)):
        L = 1.6
        place(out, (osc(f, L) + 0.3 * osc(f * 2.76, L)) * expdec(int(L * SR), 3) * 0.35, i * 0.12)
    return out


def shimmer(d=2.0):
    out = np.zeros(int(d * SR))
    for i in range(18):
        f = 1200 * 2 ** (i / 6)
        L = 0.9
        place(out, osc(f, L) * expdec(int(L * SR), 5) * 0.18, i * 0.05)
    return out + whoosh(d, 2000, 8000) * 0.2


def descend_whoosh(d=3.2):
    n = int(d * SR)
    f = glide(1800, 300, d, 0.8)
    whine = osc(f, d) * 0.3 + osc(f * 1.5, d) * 0.15
    return (whoosh(d, 3000, 400, True) * 1.2 + whine) * np.linspace(0.2, 1, n) ** 2


def landing_boom(d=3.0):
    return mix(boom(d, 80, 22) * 1.4, lp(noise(1.2), 1500) * expdec(int(1.2 * SR), 3), debris(d) * 0.4)


def brass(freqs, d, a=0.25, r=0.8, bright=1500):
    s = sum(osc(f * (1 + 0.003 * k), d, 'saw') for k, f in enumerate(freqs))
    n = int(d * SR)
    cut = lp(s, bright)
    return cut * env(n, a, r) / len(freqs)


def hero_chord(d=2.6):
    return brass([196, 246.94, 293.66, 392], d, 0.3, 1.0, 2400) * 1.2


def sting(d=3.0):
    hit = brass([146.83, 220, 293.66, 349.23], d, 0.02, 1.8, 3000) * 1.4
    timp = osc(glide(98, 90, d), d) * expdec(int(d * SR), 1.5)
    return mix(hit, timp, boom(d, 55, 30) * 0.4)


def punch(d=0.6):
    return mix(boom(d, 120, 40) * 1.2, hp(noise(0.05), 1500) * 0.8)


def impact(d=2.0):
    return mix(boom(d, 70, 25) * 1.2, debris(1.5) * 0.4, hp(noise(0.1), 2000) * 0.8)


def wind(d=5.0):
    n = int(d * SR)
    x = bp(noise(d), 200, 1200) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 1.3))
    return x * env(n, 0.8, 1.0) * 0.8


def hero_charge(d=1.8):
    return charge_up(d) * 0.6 + shimmer(d) * 0.6


SFX = {
    'ambience_park': lambda: ambience_park(6.0),
    'gulls': lambda: gulls(5.0),
    'gulls_panic': lambda: gulls(3.0, True),
    'kids_laugh': lambda: kids_laugh(1.8),
    'kid_giggle': lambda: kid_giggle(1.0),
    'kid_cheer': lambda: kid_cheer(1.4),
    'kids_cheer': lambda: kids_cheer(2.2),
    'swing_creak': lambda: swing_creak(4.5),
    'slide': lambda: slide(1.4),
    'rumble_low': lambda: rumble(3.0),
    'rumble_grow': lambda: rumble(4.2, True),
    'chain_rattle': lambda: chain_rattle(3.0),
    'kid_gasp': lambda: kid_gasp(0.6),
    'water_swell': lambda: water_swell(5.0),
    'mega_splash': lambda: splash(4.5),
    'water_cascade': lambda: water_cascade(5.0),
    'boom_deep': lambda: boom(3.0),
    'roar': lambda: roar(2.8),
    'roar_hurt': lambda: roar(1.4, True),
    'kids_scream': lambda: kids_scream(2.0),
    'kid_cry': lambda: kid_cry(3.2),
    'kid_sob': lambda: kid_sob(3.0),
    'mom_shout': lambda: mom_shout(1.2),
    'wave_crash': lambda: wave_crash(3.0),
    'boat_horn': lambda: boat_horn(1.8),
    'stomp_water': lambda: stomp(2.0, True),
    'stomp': lambda: stomp(2.0),
    'crowd_scream': lambda: crowd_scream(4.5),
    'footsteps_crowd': lambda: footsteps(5.0),
    'footsteps_run': lambda: footsteps(4.0, 7, False),
    'siren': lambda: siren(4.0),
    'tire_screech': lambda: tire_screech(1.0),
    'car_crash': lambda: car_crash(2.4),
    'glass': lambda: glass(1.6),
    'car_horn': lambda: car_horn(0.8),
    'car_alarm': lambda: car_alarm(1.8),
    'wind_whoosh': lambda: whoosh(2.4, 200, 1200),
    'tail_whoosh': lambda: whoosh(1.0, 1500, 250, True),
    'whoosh': lambda: whoosh(0.8, 400, 3000),
    'building_collapse': lambda: building_collapse(4.5),
    'debris': lambda: debris(2.5),
    'charge_up': lambda: charge_up(2.0),
    'beam_fire': lambda: beam_fire(1.8),
    'explosion': lambda: explosion(3.5),
    'distant_boom': lambda: distant_boom(2.5),
    'chime': lambda: chime(2.5),
    'descend_whoosh': lambda: descend_whoosh(3.2),
    'landing_boom': lambda: landing_boom(3.0),
    'hero_chord': lambda: hero_chord(2.6),
    'shimmer': lambda: shimmer(2.0),
    'hero_voice': lambda: hero_voice(0.7),
    'wind': lambda: wind(5.0),
    'punch': lambda: punch(0.6),
    'impact': lambda: impact(2.0),
    'hero_charge': lambda: hero_charge(1.8),
    'hero_beam': lambda: beam_fire(4.0, 220, 1.8),
    'beam_clash': lambda: beam_clash(3.8),
    'sting': lambda: sting(3.0),
}

# per-effect loudness (relative to peak-normalised), so screams and booms sit right
LEVEL = {
    'ambience_park': 0.55, 'gulls': 0.5, 'gulls_panic': 0.4, 'swing_creak': 0.55, 'kids_laugh': 0.95, 'kid_giggle': 0.85,
    'kid_cheer': 0.9, 'kids_cheer': 0.95, 'slide': 0.75, 'rumble_low': 0.8, 'rumble_grow': 0.9, 'chain_rattle': 0.45,
    'kid_gasp': 0.45, 'water_swell': 0.7, 'mega_splash': 1.0, 'water_cascade': 0.55, 'boom_deep': 0.9, 'roar': 1.0,
    'roar_hurt': 0.85, 'kids_scream': 0.8, 'kid_cry': 0.85, 'kid_sob': 0.7, 'mom_shout': 0.55, 'wave_crash': 0.75,
    'boat_horn': 0.45, 'stomp_water': 0.9, 'stomp': 1.0, 'crowd_scream': 0.7, 'footsteps_crowd': 0.4, 'footsteps_run': 0.45,
    'siren': 0.35, 'tire_screech': 0.5, 'car_crash': 0.95, 'glass': 0.5, 'car_horn': 0.35, 'car_alarm': 0.3, 'wind_whoosh': 0.5,
    'tail_whoosh': 0.7, 'whoosh': 0.6, 'building_collapse': 1.0, 'debris': 0.6, 'charge_up': 0.6, 'beam_fire': 0.8,
    'explosion': 1.0, 'distant_boom': 0.5, 'chime': 0.5, 'descend_whoosh': 0.8, 'landing_boom': 1.0, 'hero_chord': 0.6,
    'shimmer': 0.5, 'hero_voice': 0.7, 'wind': 0.35, 'punch': 0.9, 'impact': 1.0, 'hero_charge': 0.55, 'hero_beam': 0.6,
    'beam_clash': 0.85, 'sting': 0.9,
}


# ------------------------------------------------------------------ music bed
def note(f, d, kind='pluck'):
    n = int(d * SR)
    if kind == 'pluck':
        return (osc(f, d, 'tri') * 0.7 + osc(f * 2, d) * 0.2) * expdec(n, 6)
    if kind == 'pad':
        return lp(osc(f, d, 'saw') + osc(f * 1.005, d, 'saw'), 1200) * env(n, 0.4, 0.6) * 0.3
    if kind == 'bass':
        return lp(osc(f, d, 'saw'), 400) * env(n, 0.01, 0.1) * 0.8
    raise ValueError(kind)


def drum(kind, d=0.5):
    n = int(d * SR)
    if kind == 'taiko':
        return osc(glide(90, 45, d, 0.5), d) * expdec(n, 7) * 1.3 + lp(noise(d), 500) * expdec(n, 20) * 0.5
    if kind == 'snare':
        return hp(noise(d), 1200) * expdec(n, 18) * 0.5 + osc(190, d) * expdec(n, 25) * 0.3
    if kind == 'hat':
        return hp(noise(0.05), 6000) * expdec(int(0.05 * SR), 60) * 0.25
    raise ValueError(kind)


def music(total, marks):
    out = np.zeros(int(total * SR) + SR * 4)
    a0, a1, a2, a3, a4, a5 = marks  # playful, tension, danger, hero, fight, end
    # 1) playful: C major pentatonic plucks, 112 bpm
    beat = 60 / 112
    mel = [72, 76, 79, 76, 81, 79, 76, 74, 72, 74, 76, 79, 77, 76, 74, 72]
    chords = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]]
    t = a0
    i = 0
    while t < a1 - beat:
        f = 440 * 2 ** ((mel[i % len(mel)] - 69) / 12)
        place(out, note(f, beat * 1.5) * 0.32, t)
        if i % 4 == 0:
            for m in chords[(i // 4) % 4]:
                place(out, note(440 * 2 ** ((m - 12 - 69) / 12), beat * 4, 'pad') * 0.32, t)
        t += beat / 2 if i % 3 == 2 else beat
        i += 1
    # 2) tension: a low drone and a heartbeat
    d = a2 - a1
    place(out, lp(osc(55, d, 'saw') + osc(55.4, d, 'saw'), 300) * env(int(d * SR), 1.0, 0.5) * 0.15, a1)
    t = a1 + 0.3
    while t < a2 - 0.5:
        place(out, drum('taiko', 0.4) * 0.35, t)
        place(out, drum('taiko', 0.4) * 0.25, t + 0.22)
        t += 0.9
    # 3) danger: D minor ostinato, taiko and low brass stabs, 100 bpm
    beat = 60 / 100
    bassline = [38, 38, 41, 38, 43, 41, 38, 36]
    t = a2
    i = 0
    while t < a3 - beat:
        place(out, note(440 * 2 ** ((bassline[i % 8] - 69) / 12), beat * 0.9, 'bass') * 0.22, t)
        if i % 2 == 0:
            place(out, drum('taiko', 0.6) * 0.45, t)
        if i % 4 == 2:
            place(out, drum('snare') * 0.3, t)
        if i % 8 == 0:
            place(out, brass([146.83, 174.61, 220], beat * 3, 0.05, 0.6, 1200) * 0.35, t)
        t += beat
        i += 1
    # 4) the hero: rising major chords with a choir-like pad
    beat = 60 / 90
    prog = [[55, 59, 62], [57, 60, 64], [60, 64, 67], [62, 66, 69]]
    t = a3
    k = 0
    while t < a4 - 0.1:
        ch = prog[k % 4]
        place(out, brass([440 * 2 ** ((m - 69) / 12) for m in ch], beat * 2, 0.4, 0.8, 2200) * 0.35, t)
        place(out, voice(440 * 2 ** ((ch[0] - 69) / 12), beat * 2, 'a', 'o', breath=0.05, scale=1.0) * env(int(beat * 2 * SR), 0.3, 0.5) * 0.08, t)
        t += beat * 2
        k += 1
    # 5) the fight: heroic ostinato with drums, 128 bpm
    beat = 60 / 128
    riff = [50, 57, 62, 57, 53, 60, 65, 60]
    t = a4
    i = 0
    while t < a5 - beat:
        place(out, note(440 * 2 ** ((riff[i % 8] - 69) / 12), beat * 0.8, 'bass') * 0.2, t)
        place(out, note(440 * 2 ** ((riff[i % 8] + 12 - 69) / 12), beat * 0.6, 'pluck') * 0.08, t)
        if i % 2 == 0:
            place(out, drum('taiko', 0.5) * 0.4, t)
        else:
            place(out, drum('hat') * 0.6, t)
        if i % 4 == 2:
            place(out, drum('snare') * 0.35, t)
        if i % 16 == 0:
            place(out, brass([146.83, 185, 220, 293.66], beat * 6, 0.1, 1.0, 2400) * 0.3, t)
        t += beat
        i += 1
    # 6) the end: a soft suspended chord under the sting
    d = total - a5
    place(out, brass([146.83, 196, 220, 293.66], d, 1.0, 2.0, 1500) * 0.25, a5)
    return out


# ------------------------------------------------------------------ render
def main():
    starts = []
    acc = 0.0
    for s in TL['shots']:
        starts.append(acc)
        acc += round(s['dur'] * TL['fps']) / TL['fps']
    total = acc
    ids = [s['id'] for s in TL['shots']]
    at = lambda sid: starts[ids.index(sid)]
    L = np.zeros(int(total * SR) + SR * 5)
    R = np.zeros_like(L)
    cache = {}
    for s, t0 in zip(TL['shots'], starts):
        for off, name, g in s['sfx']:
            if name not in cache:
                cache[name] = norm(SFX[name]())
            x = cache[name] * LEVEL.get(name, 0.6) * g
            pan = 0.5 + (rng.random() - 0.5) * 0.5
            place(L, x * np.sqrt(1 - pan) * 1.2, t0 + off)
            place(R, x * np.sqrt(pan) * 1.2, t0 + off)
    mus = music(total, [0, at('tremor'), at('emerge'), at('arrival'), at('faceoff'), at('end')])
    mus = norm(mus, 0.35)
    # duck the music a little under loud effects
    fx_env = lp(np.abs(L) + np.abs(R), 3, 2)
    duck = 1 - 0.5 * np.clip(fx_env / (np.max(fx_env) + 1e-9) * 2.5, 0, 1)
    L[: len(mus)] += mus[: len(L)] * duck[: len(mus)]
    R[: len(mus)] += mus[: len(R)] * duck[: len(mus)]
    st = np.stack([L, R], 1)[: int(total * SR)]
    # soft limiter and master level
    st = np.tanh(st / (np.percentile(np.abs(st), 99.9) + 1e-9) * 0.9)
    st = st / (np.max(np.abs(st)) + 1e-9) * 0.95
    fade = int(1.5 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    wavfile.write(os.path.join(ROOT, 'out/kaiju-mix.wav'), SR, (st * 32767).astype(np.int16))
    rms = 20 * np.log10(np.sqrt(np.mean(st ** 2)) + 1e-9)
    print(f'wrote out/kaiju-mix.wav  {total:.2f}s  rms {rms:.1f} dBFS')


if __name__ == '__main__':
    main()
