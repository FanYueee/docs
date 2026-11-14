import fs from "node:fs";
import path from "node:path";

/** 讀取 public 內 PNG 的寬高（只讀檔頭 24 bytes）。用來在 <img> 上設定 width/height，避免載入圖片時版面跳動（CLS）。 */
export function pngSize(src: string): { width: number; height: number } | undefined {
	try {
		const fd = fs.openSync(path.join(process.cwd(), "public", src), "r");
		const buf = Buffer.alloc(24);
		fs.readSync(fd, buf, 0, 24, 0);
		fs.closeSync(fd);
		if (buf.toString("ascii", 1, 4) !== "PNG") return undefined;
		return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
	} catch {
		return undefined;
	}
}
