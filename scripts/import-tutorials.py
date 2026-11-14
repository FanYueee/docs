#!/usr/bin/env python3
"""
匯入逐步圖片教學（每步一張圖＋一句說明）。

來源資料夾每個教學一個子資料夾：NN-annotated.png（紅框＋編號）與 manifest.json（{title, steps:[{step, annotated, caption}]}）。

做的事：
  1. 把 NN-annotated.png 轉成「無損 WebP」放到 public/images/tutorials/<id>/NN.webp（像素完全相同，檔案約為 PNG 的 1/3）。
  2. 把對應頁面 content/docs/gamecloud/<id>.mdx 裡
       {/* tutorial:start */} 與 {/* tutorial:end */}
     之間的內容，換成最新的步驟（圖片在上、說明在下）。標記外的簡介與提示框是手寫的，不會被動到。

用法：python3 scripts/import-tutorials.py /path/to/tutorials [教學代號 …]   （需要 Pillow）
重新拍攝後重跑一次即可更新圖片與文字。
"""
import json, re, sys
from multiprocessing import Pool
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "content/docs/gamecloud"
IMAGES = ROOT / "public/images/tutorials"
START, END = "{/* tutorial:start */}", "{/* tutorial:end */}"


def convert(job):
    src, dst = job
    dst.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGB")
    im.save(dst, "WEBP", lossless=True, quality=100, method=6)
    return im.size


def mdx_text(s: str) -> str:
    return s.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}").replace("<", "&lt;").replace(">", "&gt;")


def alt_text(title: str, n: int, caption: str) -> str:
    first = re.split(r"[。！？]", caption)[0]
    return f"{title} 步驟 {n}：{first}".replace('"', "'")[:90]


def main():
    src_root = Path(sys.argv[1])
    only = set(sys.argv[2:])
    ids = sorted(p.name for p in src_root.iterdir() if (p / "manifest.json").exists())
    ids = [i for i in ids if not only or i in only]

    jobs, meta = [], {}
    for tid in ids:
        m = json.loads((src_root / tid / "manifest.json").read_text(encoding="utf-8"))
        meta[tid] = m
        for s in m["steps"]:
            jobs.append((src_root / tid / s["annotated"], IMAGES / tid / f"{s['step']:02d}.webp"))
    with Pool() as pool:
        sizes = pool.map(convert, jobs)
    size_of = {dst: sz for (_, dst), sz in zip(jobs, sizes)}

    for tid in ids:
        page = PAGES / f"{tid}.mdx"
        if not page.exists():
            print("缺少頁面，略過：", page)
            continue
        m = meta[tid]
        blocks = ["<Steps>"]
        for s in m["steps"]:
            dst = IMAGES / tid / f"{s['step']:02d}.webp"
            w, h = size_of[dst]
            blocks.append(
                "<Step>\n\n"
                f'<Shot src="/images/tutorials/{tid}/{s["step"]:02d}.webp" alt="{mdx_text(alt_text(m["title"], s["step"], s["caption"]))}" '
                f'width={{{w}}} height={{{h}}} caption="{mdx_text(s["caption"]).replace(chr(34), "&quot;")}" />\n'
                "</Step>"
            )
        blocks.append("</Steps>")
        text = page.read_text(encoding="utf-8")
        if START not in text or END not in text:
            print("缺少標記，略過：", page)
            continue
        head, rest = text.split(START, 1)
        _, tail = rest.split(END, 1)
        page.write_text(head + START + "\n" + "\n".join(blocks) + "\n" + END + tail, encoding="utf-8")
        print(f"{tid}: {len(m['steps'])} 步")


if __name__ == "__main__":
    main()
