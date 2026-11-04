#!/usr/bin/env python3
"""Synthesises every SFX in presets/sfx/out/ from scratch (no samples). MIT.

Run:  python3 presets/sfx/synth.py      (needs numpy + scipy)
One-shots: -18 LUFS target, but the -1 dBFS peak cap wins for very short transients (clicks/pops land at -24..-28 LUFS;
that is expected — loudness meters under-read 60 ms sounds). Mixed SaaS layers: -16 LUFS via a soft-knee limiter,
ceiling -1 dBFS (room left for the music bed; the final ad mix is mastered to -14 LUFS in the render).
Loudness = ITU-R BS.1770 K-weighted, gated, implemented below (mono).
"""
import json
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
rng = np.random.default_rng(7)  # fixed seed -> reproducible files


def t(d):
    return np.arange(int(d * SR)) / SR


def env_exp(d, tau):
    return np.exp(-t(d) / tau)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def place(dst, src, at):
    i = int(at * SR)
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n]
    return dst


def pink(n):
    w = rng.standard_normal(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w)


def fade(x, ms_in=1.0, ms_out=8.0):
    x = x.copy()
    a, b = int(ms_in * SR / 1000), int(ms_out * SR / 1000)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x


# ---------- loudness (BS.1770-4) ----------
def k_weight(x):
    # pre-filter (high shelf) + RLB high-pass, coefficients for 48 kHz
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x))


def lufs(x):
    y = k_weight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if len(y) < blk:
        y = np.pad(y, (0, blk - len(y)))
    ms = np.array([np.mean(y[i:i + blk] ** 2) for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[l > -70]
    if len(g) == 0: return -70.0
    rel = -0.691 + 10 * np.log10(np.mean(g)) - 10
    g2 = ms[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(np.mean(g2)))


def normalise(x, target, peak_db=-1.0):
    x = x / (np.max(np.abs(x)) + 1e-12)
    gain = 10 ** ((target - lufs(x)) / 20)
    y = x * gain
    pk = np.max(np.abs(y)); lim = 10 ** (peak_db / 20)
    if pk > lim:
        y *= lim / pk  # peak cap wins over loudness target for very transient sounds
    return y


# ---------- sounds ----------
def click():
    d = 0.06
    n = hp(rng.standard_normal(int(d * SR)), 2000) * env_exp(d, 0.0015)
    tone = np.sin(2 * np.pi * 4200 * t(d)) * env_exp(d, 0.004) * 0.5
    return fade(n + tone, 0, 10)


def mech_click(var=0.0):
    """Keyboard / switch: press + release transients ~9 ms apart, each = 2 bandpassed noise bursts + low body thump."""
    d = 0.09
    out = np.zeros(int(d * SR))
    for k, (at, g, f1, f2) in enumerate([(0.0, 1.0, 1800, 3200), (0.009 + var * 0.003, 0.55, 2400, 4100)]):
        n = rng.standard_normal(int(0.03 * SR))
        burst = bp(n, f1 * (1 + var * 0.1), f1 * 1.6, 2) * np.exp(-t(0.03) / 0.0018) + 0.6 * bp(n, f2, f2 * 1.4, 2) * np.exp(-t(0.03) / 0.0009)
        place(out, burst * g, at)
    body = np.sin(2 * np.pi * (180 + 40 * var) * t(0.03)) * np.exp(-t(0.03) / 0.006) * 0.7
    place(out, body, 0.0)
    return fade(out, 0, 12)


def stutter():
    out = np.zeros(int(0.65 * SR))
    for i in range(8):
        place(out, mech_click(i / 8) * (0.45 + 0.55 * i / 7), i * 0.0625)
    return fade(out, 0, 30)


def data_loop(bars=1, bpm=120):
    d = bars * 4 * 60 / bpm
    out = np.zeros(int(d * SR))
    step = 0.03
    for i in range(int(d / step)):
        if rng.random() < 0.55:
            f = rng.choice([1200, 1600, 2000, 2400, 2800, 3400])
            l = rng.choice([0.008, 0.012, 0.02])
            sq = signal.square(2 * np.pi * f * t(l)) * np.exp(-t(l) / (l / 3))
            place(out, sq * rng.uniform(0.3, 1.0), i * step)
    out = lp(out, 6000)
    return fade(out, 2, 20)


def charge():
    d = 1.2
    tt = t(d)
    f = 120 * (1800 / 120) ** (tt / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(8 + 16 * tt / d) / SR)
    s = np.sin(ph) * 0.6 + 0.25 * signal.sawtooth(ph * 0.5)
    noise = hp(rng.standard_normal(len(tt)), 3000) * (tt / d) ** 2 * 0.3
    return fade((s * trem + noise) * (tt / d) ** 1.5, 5, 15)


def whoosh(d=0.55):
    n = pink(int(d * SR))
    tt = t(d)
    centre = np.interp(tt, [0, d * 0.55, d], [300, 3000, 600])
    out = np.zeros_like(n)
    blk = 256
    for i in range(0, len(n), blk):
        c = centre[i]
        sos = signal.butter(2, [c * 0.6, min(c * 1.7, SR / 2 - 100)], 'bandpass', fs=SR, output='sos')
        out[i:i + blk] = signal.sosfilt(sos, n[max(0, i - 2048):i + blk])[-len(n[i:i + blk]):]
    bell = np.exp(-((tt - d * 0.55) / (d * 0.22)) ** 2)
    return fade(out * bell, 5, 30)


def riser(d=2.0):
    tt = t(d)
    out = np.zeros_like(tt)
    for det in (-0.12, 0, 0.09):
        f = 110 * 2 ** ((12 * tt / d + det) / 12)
        out += signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    out /= 3
    noise = rng.standard_normal(len(tt)) * 0.4
    mixed = out + noise * (tt / d) ** 2
    # HP sweep 100 -> 3000 Hz in blocks
    res = np.zeros_like(mixed)
    blk = 1024
    for i in range(0, len(mixed), blk):
        fc = 100 * 30 ** (i / len(mixed))
        res[i:i + blk] = hp(mixed[max(0, i - 4096):i + blk], fc)[-len(mixed[i:i + blk]):]
    return fade(res * (0.15 + 0.85 * (tt / d) ** 2), 20, 2)  # hard cut at the end


def glitch():
    out = np.zeros(int(0.35 * SR))
    pos = 0.0
    while pos < 0.33:
        l = rng.uniform(0.008, 0.02)
        kind = rng.integers(0, 3)
        tt = t(l)
        if kind == 0: s = rng.standard_normal(len(tt))
        elif kind == 1: s = signal.square(2 * np.pi * rng.uniform(200, 3000) * tt)
        else: s = np.sin(2 * np.pi * rng.uniform(60, 400) * tt)
        s = np.round(s * 8) / 8  # 4-bit-ish crush
        place(out, s * rng.uniform(0.3, 1.0), pos)
        pos += l * rng.choice([1.0, 1.0, 1.6])
    return fade(out, 0, 15)


def pop():
    d = 0.12
    tt = t(d)
    f = 300 + 600 * np.exp(-tt / 0.012)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.03)
    c = click(); s[:len(c)] += 0.3 * c
    return fade(s, 0, 10)


def hit():
    d = 0.8
    tt = t(d)
    sub = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt / 0.04)) / SR) * np.exp(-tt / 0.25)
    n = bp(rng.standard_normal(len(tt)), 800, 6000) * np.exp(-tt / 0.03) * 0.5
    return fade(sub + n, 0, 50)


# ---------- mixed SaaS layers ----------
def db(x): return 10 ** (x / 20)


def saas_hook():
    """riser -> 3 frames silence -> hit + click on the cut (cut at 2.1 s)."""
    out = np.zeros(int(3.2 * SR))
    place(out, normalise(riser(2.0), -18) * db(-2), 0.0)
    place(out, normalise(hit(), -18) * db(0), 2.1)
    place(out, normalise(click(), -18) * db(-4), 2.1)
    place(out, normalise(whoosh(0.5), -18) * db(-6), 2.35)
    return out


def saas_dataflow():
    out = np.zeros(int(4.0 * SR))
    bed = np.tile(normalise(data_loop(), -18), 2)
    place(out, bed * db(-8), 0.0)
    place(out, normalise(charge(), -18) * db(-3), 1.6)
    for i, at in enumerate([0.5, 0.75, 1.0, 2.85, 2.95, 3.05, 3.15]):
        place(out, normalise(mech_click(i / 7), -18) * db(-5), at)
    place(out, normalise(pop(), -18) * db(-2), 2.8)
    return out


def saas_mech():
    out = np.zeros(int(3.0 * SR))
    beat = 60 / 128 / 2  # 1/8 notes at 128 bpm
    for i in range(10):
        place(out, normalise(mech_click(i % 3 / 3), -18) * db(-3 if i % 2 == 0 else -9), i * beat)
    place(out, normalise(stutter(), -18) * db(-4), 10 * beat)
    place(out, normalise(glitch(), -18) * db(-8), 10 * beat + 0.65)
    place(out, normalise(pop(), -18) * db(-1), 2.4)
    return out


def limit_to(x, target, ceiling_db=-1.0):
    """Raise loudness to `target` LUFS through a soft-knee limiter (tanh above the knee), ceiling -1 dBFS."""
    c = 10 ** (ceiling_db / 20)
    knee = 0.6 * c
    def lim(y):
        a = np.abs(y); over = a > knee
        out = y.copy()
        out[over] = np.sign(y[over]) * (knee + (c - knee) * np.tanh((a[over] - knee) / (c - knee)))
        return out
    x = x / (np.max(np.abs(x)) + 1e-12) * c
    g = 1.0
    for _ in range(30):
        y = lim(x * g)
        e = target - lufs(y)
        if abs(e) < 0.2: break
        g *= 10 ** (e / 20)
    return y


ONESHOTS = {'click': click, 'mech_click': mech_click, 'stutter': stutter, 'data_loop': data_loop, 'charge': charge,
            'whoosh': whoosh, 'riser': riser, 'glitch': glitch, 'pop': pop, 'hit': hit}
LAYERS = {'saas_hook': saas_hook, 'saas_dataflow': saas_dataflow, 'saas_mech': saas_mech}


def write(name, x):
    pcm = np.int16(np.clip(x, -1, 1) * 32767)
    wavfile.write(os.path.join(OUT, f'{name}.wav'), SR, pcm)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    report = {}
    for name, fn in ONESHOTS.items():
        y = normalise(fn(), -18)
        write(name, y)
        report[name] = {'seconds': round(len(y) / SR, 3), 'lufs': round(lufs(y), 1), 'peak_dbfs': round(20 * np.log10(np.max(np.abs(y))), 1)}
    for name, fn in LAYERS.items():
        y = limit_to(fn(), -16)
        write(name, y)
        report[name] = {'seconds': round(len(y) / SR, 3), 'lufs': round(lufs(y), 1), 'peak_dbfs': round(20 * np.log10(np.max(np.abs(y))), 1)}
    with open(os.path.join(OUT, 'loudness.json'), 'w') as fh:
        json.dump(report, fh, indent=1)
    for k, v in report.items():
        print(f'{k:14s} {v}')
