#!/usr/bin/env python3
"""Malay subtitles + watermark for the two-pivot handball tactics clip (@alexhandball5).

The narration is French. The burned-in English captions are covered by a plate and
replaced with Malay, timed to the French words (Whisper large-v3 word timestamps).
The creator's TikTok handle is kept visible above the plate.

If scripts/malay_voiceover.py has been run on <out_dir>, its Malay voice-over mix and the
cue times retimed to it are used, and the output is two_pivot_ms_vo.mp4.

usage: scripts/malay_subs.py <source.mp4> <out_dir>
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WATERMARK = "UMPSA HANDBALL"
W, H = 1080, 1920
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
CAP_SIZE, CAP_Y = 60, 1640           # caption centre, over the original English band
PLATE = (40, 1574, 1040, 1706)        # covers the English captions at y 845-900 (576 px source)
HANDLE_BOX = (820, 1520, 1080, 1632)  # TikTok logo + "@alexhandball5", restored over the plate
PLATE_ON, PLATE_OFF = 0.30, 48.60
HANDLE_ON, HANDLE_OFF = 4.99, 47.58   # right-side handle is on frames 150-1427 (5.000-47.567 s)

# (start, end, text); {word} = yellow keyword. Times follow the French narration.
CUES = [
    (0.60, 2.10, "KAU LAWAN {PERTAHANAN}"),
    (2.10, 2.94, "YANG {MELEKAT} DI GARISAN"),
    (2.94, 4.30, "TAPI TAK JUMPA {CELAH}."),
    (4.50, 5.78, "MASA UNTUK KELUARKAN"),
    (5.78, 7.04, "SISTEM {DUA PIVOT}!"),
    (7.30, 8.62, "MATLAMATNYA,"),
    (8.62, 9.20, "CIPTA {HURU-HARA}"),
    (9.20, 10.00, "DI {TENGAH}."),
    (10.16, 10.80, "{LANGKAH 1:}"),
    (10.80, 12.10, "{TRANSFORMASI}."),
    (12.22, 13.00, "SAMBIL BOLA BERGERAK"),
    (13.00, 13.70, "DI {ATAS},"),
    (13.70, 14.88, "PEMAIN {SAYAP} KAU"),
    (14.88, 15.34, "ATAU SALAH SEORANG"),
    (15.34, 15.74, "PEMAIN {BELAKANG}"),
    (15.74, 16.58, "TINGGALKAN POSISI"),
    (16.58, 17.18, "SAMBIL {MEMECUT}"),
    (17.18, 18.12, "UNTUK JADI"),
    (18.12, 18.98, "{PIVOT KEDUA}"),
    (18.98, 20.60, "DI GARISAN {6 METER}."),
    (20.82, 21.48, "{LANGKAH 2:}"),
    (21.48, 23.30, "MEMBELAH {LAUT MERAH}."),
    (23.46, 25.18, "DUA PIVOT {MENJARAK}"),
    (25.18, 26.32, "DAN PASANG {BLOK BESAR}"),
    (26.32, 27.56, "PADA {DEFENDER TENGAH}."),
    (27.56, 29.12, "MEREKA {BETUL-BETUL}"),
    (29.12, 29.90, "BELAH {PERTAHANAN}"),
    (29.90, 30.38, "JADI {DUA}"),
    (30.38, 31.28, "DAN BUKA {LUBANG BESAR}"),
    (31.28, 32.20, "TEPAT DI {TENGAH}."),
    (32.30, 33.06, "{LANGKAH 3:}"),
    (33.06, 34.40, "{HUKUMAN}!"),
    (34.56, 35.40, "SEBAB DEFENDER"),
    (35.40, 36.44, "DAH {TERKUNCI} DI GARISAN"),
    (36.44, 37.16, "OLEH {PIVOT} KAU,"),
    (37.16, 38.28, "PEMAIN {BELAKANG} KAU"),
    (38.28, 39.46, "ADA {LEBUH RAYA} SEBENAR"),
    (39.46, 40.66, "UNTUK MASUK {LAJU},"),
    (40.66, 42.12, "REMPUH {LUBANG TENGAH}"),
    (42.12, 43.36, "DAN {BEDIL} PENJAGA GOL"),
    (43.36, 44.60, "DARI {JARAK DEKAT}."),
    # Outro has no narration; this translates the on-screen "Prêt à tout casser ? Abonne-toi !"
    (45.00, 46.60, "DAH SEDIA NAK {BELASAH}?"),
    (46.60, 48.50, "{FOLLOW} SEKARANG!"),
]


def ts(t, sep="."):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}" if sep == "." else f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")


def write_ass(path, cues):
    yellow, white = r"{\c&H2CD0FF&}", r"{\c&HFFFFFF&}"
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter Black,{CAP_SIZE},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,5,2,5,0,0,0,1
Style: Mark,Inter Black,30,&H55FFFFFF,&H55FFFFFF,&H99000000,&H00000000,0,0,0,0,100,100,6,0,1,2,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for s, e, txt in cues:
        body = txt.replace("{", "\x01").replace("}", "\x02").replace("\x01", yellow).replace("\x02", white)
        anim = rf"{{\pos({W//2},{CAP_Y})\fad(60,0)\fscx112\fscy112\t(0,90,\fscx100\fscy100)}}"
        lines.append(f"Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{anim}{body}")
    lines.append(f"Dialogue: 0,{ts(0)},{ts(51.6)},Mark,,0,0,0,,{{\\pos({W//2},1752)}}{WATERMARK}")
    path.write_text(head + "\n".join(lines) + "\n", encoding="utf-8")


def write_srt(path, cues):
    out = []
    for i, (s, e, txt) in enumerate(cues, 1):
        out.append(f"{i}\n{ts(s, ',')} --> {ts(e, ',')}\n{txt.replace('{', '').replace('}', '')}\n")
    path.write_text("\n".join(out), encoding="utf-8")


def check_widths():
    f = ImageFont.truetype(FONT, CAP_SIZE)
    worst = max((f.getlength(t.replace("{", "").replace("}", "")), t) for _, _, t in CUES)
    assert worst[0] <= PLATE[2] - PLATE[0] - 40, f"caption too wide: {worst}"


def make_plate(path):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(PLATE, radius=26, fill=(9, 16, 34, 255), outline=(63, 208, 255, 200), width=3)
    img.save(path)


def make_handle_mask(src, path, tmp):
    # The outro frame has nothing behind the handle except plain background.
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "46.2", "-i", src, "-frames:v", "1",
                    "-vf", f"scale={W}:{H}:flags=lanczos", str(tmp)], check=True)
    fr = Image.open(tmp).convert("RGB")
    mask = Image.new("L", (W, H), 0)
    x0, y0, x1, y1 = HANDLE_BOX
    px, mp = fr.load(), mask.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            if max(r, g, b) > 150 and (max(r, g, b) - min(r, g, b) < 70 or r > 200 or (g > 180 and b > 180)):
                mp[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    ImageDraw.Draw(mask).rectangle((0, 0, W, PLATE[1] + 2), fill=0)
    handle = fr.convert("RGBA"); handle.putalpha(mask)
    handle.save(path)


def main():
    src, out = sys.argv[1], Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    check_widths()
    ass, srt = out / "subs_ms.ass", out / "subs_ms.srt"
    plate, hmask = out / "plate.png", out / "handle.png"
    vo, mix = out / "cues_ms.json", out / "mix_ms.wav"
    use_vo = vo.exists() and mix.exists()
    cues = json.loads(vo.read_text(encoding="utf-8")) if use_vo else CUES
    write_ass(ass, cues); write_srt(srt, cues); make_plate(plate)
    make_handle_mask(src, hmask, out / "_outro.png")
    fc = (
        f"[0:v]scale={W}:{H}:flags=lanczos,format=rgba[base];"
        f"[1:v]format=rgba,fade=t=in:st={PLATE_ON}:d=0.15:alpha=1,fade=t=out:st={PLATE_OFF-0.2}:d=0.2:alpha=1[pl];"
        f"[base][pl]overlay=shortest=1[p];"
        f"[2:v]format=rgba[h];"
        f"[p][h]overlay=enable='between(t,{HANDLE_ON},{HANDLE_OFF})'[q];"
        f"[q]ass={ass}:fontsdir=/usr/share/fonts/opentype/inter,format=yuv420p[v]"
    )
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src,
           "-loop", "1", "-framerate", "30", "-i", str(plate),
           "-loop", "1", "-framerate", "30", "-i", str(hmask),
           *(["-i", str(mix)] if use_vo else []),
           "-filter_complex", fc, "-map", "[v]", "-map", "3:a" if use_vo else "0:a", "-shortest",
           "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-r", "30",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
           *(["-c:a", "aac", "-b:a", "192k"] if use_vo else ["-c:a", "copy"]),
           "-movflags", "+faststart", str(dst := out / ("two_pivot_ms_vo.mp4" if use_vo else "two_pivot_ms.mp4"))]
    subprocess.run(cmd, check=True)
    print(dst)


if __name__ == "__main__":
    main()
