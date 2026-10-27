#!/usr/bin/env python3
"""Build the paper props for revision 1 from the blank A4 photo and other cut-outs (no generation credits).

    python3 make_paper_assets.py ASSETS_DIR ALTMAN_CUTOUT.png

Writes into ASSETS_DIR:
  O22_bill_plus.png   A4 invoice, $20 plan (the cold-open bill)
  O23_bill_pro.png    A4 invoice, $200 Pro plan
  O24_terms.png       A4 "fair use" page; prints the box around "too much" for the highlighter
  O25_calendar.png    October 2026 wall calendar page; prints the centre of the 29th
  O26_laptop_post.png laptop at night with the post on screen (realistic social-app layout, no brand marks)
  O27_altman.png      the licensed photo cut-out (TechCrunch, CC BY 2.0, via Wikimedia Commons)
  N1_news_altman.png  the OpenAI logo on the newspaper's photo is blurred (no real logos)
Coordinates are printed in image pixels; the JSX converts them to comp space.
"""
import os, shutil, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

A, ALT = sys.argv[1], sys.argv[2]
FR = "/root/.fonts/Fraunces-Black.ttf"
FRS = "/root/.fonts/Fraunces-SemiBold.ttf"
MONO = "/root/.fonts/IBMPlexMono-Medium.ttf"
MONOR = "/root/.fonts/IBMPlexMono-Regular.ttf"
INTER = "/usr/share/fonts/opentype/inter/Inter-%s.otf"
INK = (30, 27, 24, 255)
GREY = (110, 104, 96, 255)
RED = (190, 32, 28, 255)


def f(p, s):
    return ImageFont.truetype(p, s)


sheet = Image.open(os.path.join(A, "O20_a4_sheet.png")).convert("RGBA")
X0, Y0, X1, Y1 = 169, 215, 1572, 2128          # the sheet inside the photo
SW = X1 - X0


def ink_on(base, draw_fn):
    """Draw text on a transparent layer and multiply it onto the sheet, kept inside the paper."""
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    layer = layer.filter(ImageFilter.GaussianBlur(0.5))
    a = np.minimum(np.array(layer)[:, :, 3], np.array(base)[:, :, 3])
    arr = np.array(layer); arr[:, :, 3] = a
    out = base.copy(); out.alpha_composite(Image.fromarray(arr))
    return out


def dots(d, x0, x1, y, font, left, right, fill=INK):
    d.text((x0, y), left, font=font, fill=fill)
    d.text((x1, y), right, font=font, fill=fill, anchor="ra")
    lw, rw = font.getlength(left), font.getlength(right)
    n = int((x1 - x0 - lw - rw - 30) / font.getlength("."))
    d.text((x0 + lw + 15, y), "." * max(0, n), font=font, fill=(150, 144, 136, 255))


def bill(plan, price, inv, date, out):
    L, R = X0 + 120, X1 - 120

    def draw(d):
        y = Y0 + 110
        d.text((L, y), "SMALL PRINT", font=f(FR, 92), fill=INK)
        d.text((R, y + 8), "INVOICE", font=f(MONO, 40), fill=GREY, anchor="ra")
        d.text((R, y + 60), "No. " + inv, font=f(MONOR, 30), fill=GREY, anchor="ra")
        y += 110
        d.text((L, y), "SUBSCRIPTIONS", font=f(MONO, 34), fill=GREY)
        d.text((R, y), date, font=f(MONOR, 30), fill=GREY, anchor="ra")
        y += 80
        d.line([(L, y), (R, y)], fill=INK, width=4)
        y += 40
        d.text((L, y), "BILL TO", font=f(MONO, 28), fill=GREY); d.text((L + 260, y), "YOU", font=f(MONO, 28), fill=INK)
        y += 46
        d.text((L, y), "PLAN", font=f(MONO, 28), fill=GREY); d.text((L + 260, y), plan, font=f(MONO, 28), fill=INK)
        y += 90
        fm = f(MONO, 46)
        dots(d, L, R, y, fm, "MONTHLY PLAN", price); y += 78
        dots(d, L, R, y, fm, "YOUR USAGE", "???"); y += 78
        dots(d, L, R, y, fm, "OUR COST", "???"); y += 90
        d.line([(L, y), (R, y)], fill=INK, width=3); y += 30
        d.text((L, y), "TOTAL DUE", font=f(FR, 54), fill=INK); d.text((R, y), price, font=f(FR, 54), fill=INK, anchor="ra")
        y += 110
        d.text((L, y), "USAGE DETAIL", font=f(MONO, 30), fill=GREY); y += 50
        d.line([(L, y), (R, y)], fill=(170, 164, 156, 255), width=2); y += 18
        fs = f(MONOR, 26)
        for i in range(14):
            day = 1 + i * 2
            d.text((L, y), f"{day:02d}  session {1000 + i * 37}", font=fs, fill=GREY)
            d.text((L + 560, y), f"{(i * 7919) % 90 + 9:>3},{(i * 373) % 1000:03d} tokens", font=fs, fill=GREY)
            d.text((R, y), "included", font=fs, fill=GREY, anchor="ra")
            y += 44
        y += 30
        d.line([(L, y), (R, y)], fill=(170, 164, 156, 255), width=2); y += 26
        small = ("Plans, prices and included usage are subject to change. Included usage may be adjusted "
                 "to reflect model efficiency. Fair use limits apply. Usage beyond your allowance may be billed "
                 "separately at the then-current rate. Continued use constitutes acceptance of these terms.")
        fsm = f(MONOR, 20); line = ""
        for w in small.split():
            if fsm.getlength(line + " " + w) > R - L:
                d.text((L, y), line.strip(), font=fsm, fill=GREY); y += 30; line = w
            else:
                line += " " + w
        d.text((L, y), line.strip(), font=fsm, fill=GREY)
    ink_on(sheet, draw).save(os.path.join(A, out))
    print("bill", out)


bill("PLUS", "$20.00", "0020", "01 FEB 2023", "O22_bill_plus.png")
bill("PRO", "$200.00", "0200", "05 DEC 2024", "O23_bill_pro.png")

# ---- fair-use page with "too much" to highlight ----
box = {}


def terms(d):
    L, R = X0 + 120, X1 - 120
    y = Y0 + 110
    d.text((L, y), "SMALL PRINT", font=f(FR, 80), fill=INK); y += 100
    d.text((L, y), "FAIR USE POLICY", font=f(MONO, 36), fill=GREY); y += 70
    d.line([(L, y), (R, y)], fill=INK, width=4); y += 50
    fb = f(FRS, 52)
    d.text((L, y), "Your plan is unlimited,", font=fb, fill=INK); y += 74
    pre = "as long as you don't use "
    d.text((L, y), pre, font=fb, fill=INK)
    x = L + fb.getlength(pre)
    d.text((x, y), "too much.", font=fb, fill=INK)
    bb = d.textbbox((x, y), "too much", font=fb)
    box["too_much"] = bb
    y += 130
    body = ("1. What counts as too much is decided by us. 2. It may change at any time, including when models "
            "become more efficient. 3. When you reach it, your access may be slowed, limited, or billed separately. "
            "4. We will tell you about changes on our help page. 5. Automated, background or continuous use "
            "(for example, agents that run all night) may count as too much. 6. Continued use means you accept this.")
    fm = f(MONOR, 32); line = ""
    for w in body.split():
        if fm.getlength(line + " " + w) > R - L:
            d.text((L, y), line.strip(), font=fm, fill=GREY); y += 50; line = w
        else:
            line += " " + w
    d.text((L, y), line.strip(), font=fm, fill=GREY); y += 90
    while y < Y1 - 240:
        i = int(y) // 46
        d.line([(L, y), (R - (i * 97) % 300, y)], fill=(200, 194, 186, 255), width=10); y += 46
    d.text((L, Y1 - 160), "Page 4 of 31", font=f(MONOR, 26), fill=GREY)


ink_on(sheet, terms).save(os.path.join(A, "O24_terms.png"))
print("terms too_much box", box["too_much"], "image", sheet.size)

# ---- October 2026 calendar (1 Oct 2026 is a Thursday) ----
CW, CH = 2400, 1560
paper = sheet.crop((X0 + 20, Y0 + 20, X1 - 20, Y1 - 20)).resize((CW, CH)).convert("RGBA")
cal = Image.new("RGBA", (CW + 80, CH + 140), (0, 0, 0, 0))
sh = Image.new("RGBA", cal.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rectangle([50, 90, CW + 50, CH + 120], fill=(0, 0, 0, 120))
cal.alpha_composite(sh.filter(ImageFilter.GaussianBlur(22)))
cal.alpha_composite(paper, (30, 70))
d = ImageDraw.Draw(cal)
for i in range(22):                          # spiral binding
    cx = 140 + i * (CW - 200) / 21
    d.ellipse([cx - 16, 40, cx + 16, 104], outline=(40, 40, 44, 255), width=7)
d.text((30 + 110, 150), "OCTOBER", font=f(FR, 150), fill=INK)
d.text((30 + CW - 110, 175), "2026", font=f(FR, 120), fill=RED, anchor="ra")
gx0, gy0, gw, gh = 30 + 90, 380, CW - 180, CH - 380
days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
cw, rh = gw / 7, (gh - 70) / 5
for i, s in enumerate(days):
    d.text((gx0 + i * cw + 18, gy0), s, font=f(MONO, 40), fill=GREY)
top = gy0 + 70
for r in range(6):
    d.line([(gx0, top + r * rh), (gx0 + gw, top + r * rh)], fill=(150, 144, 136, 255), width=3)
for q in range(8):
    d.line([(gx0 + q * cw, top), (gx0 + q * cw, top + 5 * rh)], fill=(150, 144, 136, 255), width=3)
centre = None
for day in range(1, 32):
    k = day + 2                                  # Thursday = column 3
    r, q = k // 7, k % 7
    if r > 4:
        r = 4                                    # (31 Oct shares the last row; there are 5 rows)
    x, y = gx0 + q * cw + 20, top + r * rh + 14
    d.text((x, y), str(day), font=f(FR, 70), fill=INK if q < 5 else RED)
    if day == 29:
        centre = (gx0 + q * cw + cw / 2, top + r * rh + rh / 2)
for day, q in [(28, 0), (29, 1), (30, 2)]:       # September tail in grey
    d.text((gx0 + q * cw + 20, top + 14), str(day), font=f(FR, 70), fill=(190, 184, 176, 255))
cal.save(os.path.join(A, "O25_calendar.png"))
print("calendar size", cal.size, "29th centre", centre, "cell", (cw, rh))

# ---- laptop at night with the post on screen ----
lap = Image.open(os.path.join(A, "O06_laptop.png")).convert("RGBA")
quad = [(306, 132), (1230, 234), (1428, 994), (530, 1110)]   # TL TR BR BL of the screen
UW, UH = 1600, 1000
ui = Image.new("RGBA", (UW, UH), (255, 255, 255, 255))
d = ImageDraw.Draw(ui)
d.rectangle([0, 0, 220, UH], fill=(247, 248, 250, 255))
for i in range(7):
    d.ellipse([84, 60 + i * 110, 136, 112 + i * 110], fill=(205, 208, 214, 255))
d.line([(220, 0), (220, UH)], fill=(225, 228, 232, 255), width=2)
d.line([(1150, 0), (1150, UH)], fill=(225, 228, 232, 255), width=2)
d.text((270, 40), "←   Post", font=f(INTER % "Bold", 40), fill=(15, 20, 25, 255))
alt = Image.open(ALT).convert("RGBA")
avbg = Image.new("RGBA", alt.size, (226, 230, 236, 255)); avbg.alpha_composite(alt)
av = avbg.crop((420, 230, 1340, 1150)).resize((120, 120), Image.LANCZOS)
mask = Image.new("L", (120, 120), 0); ImageDraw.Draw(mask).ellipse([0, 0, 119, 119], fill=255)
ui.paste(av, (270, 140), mask)
d.text((415, 150), "Sam Altman", font=f(INTER % "Bold", 40), fill=(15, 20, 25, 255))
d.text((415, 205), "@sama", font=f(INTER % "Regular", 34), fill=(130, 134, 142, 255))
body = ["insane thing: we are currently", "losing money on openai pro", "subscriptions!", "", "people use it much more than", "we expected."]
y = 310
for ln in body:
    d.text((270, y), ln, font=f(INTER % "Regular", 50), fill=(15, 20, 25, 255)); y += 66
d.text((270, y + 30), "Jan 5, 2025", font=f(INTER % "Regular", 32), fill=(130, 134, 142, 255))
d.line([(250, y + 100), (1120, y + 100)], fill=(225, 228, 232, 255), width=2)
for i in range(4):
    d.ellipse([300 + i * 220, y + 130, 340 + i * 220, y + 170], outline=(140, 146, 154, 255), width=4)
d.rounded_rectangle([1190, 40, 1560, 110], radius=35, fill=(239, 243, 244, 255))
d.rounded_rectangle([1190, 150, 1560, 520], radius=24, fill=(247, 249, 249, 255))
for i in range(5):
    d.rounded_rectangle([1220, 190 + i * 64, 1520 - (i * 53) % 120, 214 + i * 64], radius=8, fill=(222, 226, 230, 255))
# Perspective-map the UI into the screen quad.
def coeffs(dst, src):
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(src).reshape(8)
    return np.linalg.solve(np.array(m, dtype=float), b)
src = [(0, 0), (UW, 0), (UW, UH), (0, UH)]
warp = ui.transform(lap.size, Image.PERSPECTIVE, coeffs(quad, src), Image.BICUBIC)
qmask = Image.new("L", lap.size, 0); ImageDraw.Draw(qmask).polygon(quad, fill=255)
# Night: darken the aluminium body, keep the screen emitting.
arr = np.array(lap).astype(float)
arr[:, :, :3] *= np.array([0.30, 0.31, 0.36])
night = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
night.paste(warp, (0, 0), qmask)
glow = Image.new("RGBA", lap.size, (0, 0, 0, 0)); ImageDraw.Draw(glow).polygon(quad, fill=(200, 215, 255, 110))
glow = glow.filter(ImageFilter.GaussianBlur(60))
out = Image.alpha_composite(glow, night)
out.save(os.path.join(A, "O26_laptop_post.png"))
print("laptop ok")

shutil.copy(ALT, os.path.join(A, "O27_altman.png"))

# ---- blur the real logo on the newspaper's photo ----
n1p = os.path.join(A, "N1_news_altman.png")
if not os.path.exists(os.path.join(A, "N1_news_altman_raw.png")):
    shutil.copy(n1p, os.path.join(A, "N1_news_altman_raw.png"))
n1 = Image.open(os.path.join(A, "N1_news_altman_raw.png")).convert("RGB")
m = Image.new("L", n1.size, 0); ImageDraw.Draw(m).ellipse([1340, 1000, 1740, 1380], fill=255)
n1.paste(n1.filter(ImageFilter.GaussianBlur(28)), (0, 0), m.filter(ImageFilter.GaussianBlur(20)))
n1.save(n1p)
print("newspaper logo blurred")
