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

## 逐步圖片教學（遊戲主機各功能頁）

`content/docs/gamecloud/` 底下 14 個功能頁（主控台、檔案、版本安裝、單一外掛、模組包、世界上傳與下載、玩家管理、備份、排程、使用者、啟動設定、伺服器設定、網路、告警）是「每一步一張圖＋一句說明」的格式。

- 圖片放在 `public/images/tutorials/<教學代號>/NN.webp`（**無損 WebP**，像素與原本的 PNG 完全相同，檔案約小 60%）。
- 頁面中 `{/* tutorial:start */}` 與 `{/* tutorial:end */}` 之間的步驟是程式產生的，**不要手改**；標記外的簡介與提示框可以自由編輯。
- 重新拍攝後，把新的教學資料夾（每個資料夾內有 `NN-annotated.png` 與 `manifest.json`）放到任一位置，執行：

```bash
python3 scripts/import-tutorials.py /path/to/tutorials            # 全部
python3 scripts/import-tutorials.py /path/to/tutorials backups    # 只更新一個
```

## 分享預覽圖（Open Graph）

每個頁面都有專屬的 1200×630 預覽圖（`public/og/docs/…`，純色版面，PNG 已無損壓縮）。新增頁面或修改標題／描述後重新產生：

```bash
OG_FONT=/path/to/NotoSansTC.ttf node scripts/gen-og.mjs                 # 全部
OG_FONT=/path/to/NotoSansTC.ttf node scripts/gen-og.mjs gamecloud/backups   # 只更新一頁
```

字型只在產圖時使用，不會被打包進網站。需要安裝 playwright（`PW_MODULE` 可指定位置）。沒有圖片的頁面會自動使用 `/og/default.png`。

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs
