# vpc_doc

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## 截圖與編號框線

文檔裡的截圖用 `<Shot src="/images/…" alt="…" />` 嵌入，框線與編號是**直接畫進圖片檔**的（手機上不會錯位，點圖可放大）。

- 原始截圖放在 `shots-src/images/…`（不會部署）。
- 框線座標與圖片下方的說明文字寫在 `lib/shot-marks.json`（座標為原始像素 `[x, y, 寬, 高]`；`size` 為座標基準尺寸，`crops` 可只截取某個 `pick` 的區域）。
- `<Shot pick={[2, 3]} />` 只顯示指定編號的框線，並重新編號（輸出為 `xxx.p2-3.png`）。
- 修改後執行 `python3 scripts/bake-shots.py`（需要 Pillow）重新輸出到 `public/images/`，再用 zopflipng 做無損壓縮：

```bash
git status --porcelain | awk '{print $2}' | grep '^public/.*\.png$' | xargs -P 6 -I{} zopflipng -y -m --iterations=15 {} {}
```

沒有框線的圖片，直接放進 `public/images/` 並用 `![說明](/images/…)` 或 `<Shot src alt />` 即可。

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs
