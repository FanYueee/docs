#!/usr/bin/env python3
"""
把編號框線與箭頭直接畫進截圖（輸出為 PNG），避免在手機上用 CSS 疊圖造成錯位。

  原始截圖：shots-src/images/**（不會部署）
  框線座標：lib/shot-marks.json（原始像素 [x, y, 寬, 高]）
  輸出：    public/images/**（同樣路徑；<Shot pick={[2]}> 這類變體會輸出成 xxx.p2.png）

用法：python3 scripts/bake-shots.py   （需要 Pillow）
      輸出後請再做無損壓縮：
      find public/images -name '*.png' | xargs -P 6 -I{} zopflipng -y -m --iterations=20 {} {}
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "shots-src"
OUT = ROOT / "public"
MARKS = json.loads((ROOT / "lib/shot-marks.json").read_text(encoding="utf-8"))

ORANGE = (249, 115, 22, 255)
WHITE = (255, 255, 255, 255)
SS = 3  # 超取樣倍率，讓線條邊緣平滑
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def variants():
    """掃描 mdx，找出每張圖用到的 pick 組合（None 代表全部框線）。"""
    found = {}
    for f in (ROOT / "content").rglob("*.mdx"):
        for m in re.finditer(r"<Shot\b([^>]*?)/>", f.read_text(encoding="utf-8")):
            attrs = m.group(1)
            s = re.search(r'src="([^"]+)"', attrs)
            if not s:
                continue
            p = re.search(r"pick=\{\[([\d,\s]+)\]\}", attrs)
            pick = tuple(int(x) for x in p.group(1).split(",")) if p else None
            found.setdefault(s.group(1), set()).add(pick)
    return found


def out_name(src, pick):
    if pick is None:
        return src
    base, ext = src.rsplit(".", 1)
    return f"{base}.p{'-'.join(map(str, pick))}.{ext}"


def bake(src, pick):
    entry = MARKS[src]
    img = Image.open(SRC / src.lstrip("/")).convert("RGBA")
    w, h = img.size
    cw, ch = entry.get("size", [1440, 900])
    k = w / cw * SS  # 原始座標 -> 超取樣畫布
    U = w / 1440 * entry.get("scale", 1)  # 線條、圓圈、字體的縮放（以 1440 寬為基準，可用 scale 微調）
    font = ImageFont.truetype(FONT_PATH, round(24 * SS * U))
    marks = entry["marks"]
    sel = [marks[i - 1] for i in pick] if pick else marks
    arrows = [] if pick else entry.get("arrows", [])

    layer = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    for (x1, y1, x2, y2) in arrows:
        import math
        X1, Y1, X2, Y2 = (v * k for v in (x1, y1, x2, y2))
        ang = math.atan2(Y2 - Y1, X2 - X1)
        head = 22 * SS * U
        bx, by = X2 - math.cos(ang) * head * 0.6, Y2 - math.sin(ang) * head * 0.6
        tri = [
            (X2, Y2),
            (X2 - math.cos(ang - 0.45) * head, Y2 - math.sin(ang - 0.45) * head),
            (X2 - math.cos(ang + 0.45) * head, Y2 - math.sin(ang + 0.45) * head),
        ]
        d.line([(X1, Y1), (bx, by)], fill=WHITE, width=round(13 * SS * U))
        d.ellipse([X1 - 6.5 * SS * U, Y1 - 6.5 * SS * U, X1 + 6.5 * SS * U, Y1 + 6.5 * SS * U], fill=WHITE)
        d.polygon(tri, fill=WHITE, outline=WHITE, width=round(5 * SS * U))
        d.line([(X1, Y1), (bx, by)], fill=ORANGE, width=round(7 * SS * U))
        d.ellipse([X1 - 3.5 * SS * U, Y1 - 3.5 * SS * U, X1 + 3.5 * SS * U, Y1 + 3.5 * SS * U], fill=ORANGE)
        d.polygon(tri, fill=ORANGE)

    for m in sel:
        x, y, bw, bh = (v * k for v in m["box"])
        small = m["box"][2] * m["box"][3] < 120000
        r = 8 * SS * U
        if small:
            d.rounded_rectangle([x, y, x + bw, y + bh], r, fill=(249, 115, 22, 28))
        d.rounded_rectangle([x - 1 * SS * U, y - 1 * SS * U, x + bw + 1 * SS * U, y + bh + 1 * SS * U], r, outline=WHITE, width=round(9 * SS * U))
        d.rounded_rectangle([x, y, x + bw, y + bh], r, outline=ORANGE, width=round(5 * SS * U))

    for i, m in enumerate(sel, 1):
        x, y, bw, bh = (v * k for v in m["box"])
        R = 19 * SS * U
        if m.get("badge") == "left":  # 編號放在框線左側中間，避免蓋住上方的欄位標籤
            x, y = x - 0.35 * R, y + bh / 2
        cx = min(max(x, R + 2 * SS * U), w * SS - R - 2 * SS * U)
        cy = min(max(y, R + 2 * SS * U), h * SS - R - 2 * SS * U)
        d.ellipse([cx - R - 3 * SS * U, cy - R - 3 * SS * U, cx + R + 3 * SS * U, cy + R + 3 * SS * U], fill=WHITE)
        d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=ORANGE)
        d.text((cx, cy), str(i), font=font, fill=WHITE, anchor="mm")

    layer = layer.resize((w, h), Image.LANCZOS)
    out = Image.alpha_composite(img, layer).convert("RGB")
    # 只截取相關區域（crops：{"pick 以 - 相連": [x, y, 寬, 高]}，座標同框線）
    crop = entry.get("crops", {}).get("-".join(map(str, pick)) if pick else "all")
    if crop:
        f = w / cw
        x, y, bw, bh = (round(v * f) for v in crop)
        out = out.crop((x, y, min(x + bw, w), min(y + bh, h)))
    return out


def main():
    n = 0
    for src, picks in sorted(variants().items()):
        if src not in MARKS:
            continue
        for pick in sorted(picks, key=lambda p: (p is not None, p)):
            dest = OUT / out_name(src, pick).lstrip("/")
            dest.parent.mkdir(parents=True, exist_ok=True)
            bake(src, pick).save(dest, optimize=True)
            n += 1
            print("baked", dest.relative_to(ROOT))
    print(f"{n} files")


if __name__ == "__main__":
    sys.exit(main())
