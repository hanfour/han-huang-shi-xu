# 全站字型／字色／字級／間距統一 — 設計文件

日期：2026-07-10
分支：`refactor/typography-tokens`
基準 commit：`77e4eee`
目標檔案：`web_v0.0.08/index.html`（3738 行，CSS 內嵌 + Tailwind CDN）

---

## 1. 背景與目標

`index.html` 的字色、字級、間距散落在 Tailwind arbitrary value（`text-[#7d621a]`、`text-[10px]`）與內嵌 CSS 之中，沒有單一真相來源。`:root` 雖已定義部分 CSS 變數，但多數引用次數為 0。

**目標**：建立 token 單一真相來源，並修正因散落而產生的實際視覺不一致。

**已確認的決策範圍**（來自需求釐清）：

- 允許為了「真正對齊」而微調視覺呈現
- 收斂基準為「現有多數用法」，而非設計稿或全新設計系統
- 落地方式為 `tailwind.config` token + 語意元件 class

---

## 2. 現況調查（實測數據）

以下數字皆由 `grep` 對 `77e4eee` 的 `index.html` 實測取得。

### 2.1 關鍵架構特徵：雙份 markup

**部分** section 維護兩份完整 markup，以容器顯隱切換：

- 有雙份：`#mrt`、`#traffic`、`#park`
  手機份包在 `<div class="md:hidden">`（L820／L1003／L1294）
  桌機份包在 `<div class="hidden md:flex">` 或 `hidden md:block`
- 無雙份（單一份 markup 帶響應式 class）：`#school`、`#facility`、`#vr`、`#materials`、`#info`、`#team`

這是理解字級統計與間距分析的前提。例如圖片 overlay 圖說之所以出現
「16 次固定 8px、16 次固定 10px」，並非隨機混亂，而是**雙份 section 的手機份寫 8px、
桌機份寫 10px**。

注意：不可將「全檔 `text-[8px]` 共 22 次」這類單一 utility 的總數直接當成語意群組的大小。
`text-[10px]` 全檔 53 次之中，只有 16 次屬於圖說，其餘分屬內文手機份等不同群組。
正確的分類口徑見 2.4。

雙份架構對本次重構是**有利的**：同一個語意元件 class 可同時掛在兩份 markup 上，
帶完整響應式值即可，各自因容器隱藏而只顯示一份。

### 2.2 字型

全站實際渲染兩種字型：

| 字型 | 出處 | 狀態 |
| --- | --- | --- |
| Noto Sans TC | `--font-sans`，`body` 繼承 | 活 |
| Times New Roman | `.fc-cap-en`（L610）硬寫 | 活，用於 `#facility` 四個英文圖說 |

`.fc-cap-en` 帶 `mix-blend-mode: screen`，是刻意的設計元素，不可移除。

**死設定**（實測 0 引用）：

- `--font-serif` — 0 引用，且首選字型 `"Noto Serif"` 從未載入
- `--font-CenturyGothic` — 0 引用
- `src/fonts.css` — 第 42 行早已被註解，整檔未載入
- Google Fonts `Shafarik`（L53 `<link>`）— markup 0 使用

註：`.fc-cap-en` 使用的 Times New Roman 是**系統字型**，與 `fonts.css` 無關。

### 2.2.1 本地字型資產全數失效（137MB）

`src/assets/fonts/` 共 22 個字型檔、**137MB**，全部在 git 追蹤下。實測結論：

- `src/assets/fonts/` 的唯一引用來源是 `src/fonts.css`，而該檔從未載入
- `index.html` 內 **0 個 `@font-face`**；`thanku.html` 同樣走 Google Fonts CDN
- 頁面實際顯示的 Noto Sans TC 來自 Google Fonts CDN（`index.html:48`），非本地檔案

因此**全部 137MB 皆為無效資產**。三項佐證：

1. `fonts.css:80` 引用 `TrajanPro-Regular.ttf`，但磁碟上的檔案為 `TrajanPro-Regular.otf`。
   副檔名不符——即使解開 L42 的註解，這條 `@font-face` 仍會 404。此規則從未生效過。
2. 有 6 個檔案連 `fonts.css` 都未提及，屬完全孤立：
   `NotoSansCJKtc-DemiLight.otf`(16M)、`NotoSansTC-VariableFont_wght.ttf`(11M)、
   `AdobeMingStd-Light.otf`(9.7M)、`NotoSerifTC-Black.otf`(5.6M)、
   `NotoSansTC-Thin.ttf`(6.8M)、`Fontspring-DEMO-theseasons-bd.otf`(16K)
3. `Fontspring-DEMO-theseasons-bd.otf` 為 **DEMO 授權**字型，依 Fontspring 條款不得用於
   商業用途或公開部署。此為授權風險，與本次重構無關但應一併處理。

**處置**：刪除為獨立步驟，且置於實作順序最末（見 5. 步驟 9），執行前另行確認。
刪除僅縮減 working tree 與部署體積；`.git` 物件仍保有歷史，clone 大小不變。

### 2.3 字色

| 色碼 | 角色 | 次數 |
| --- | --- | --- |
| `#2B2B2B` | 淺底主文字 | 36 |
| `white` | 深底文字／圖說 | 88 |
| `#7d621a` | section 主標（金棕） | 9 |
| `#808080` | 表單 input 文字 | 4 |
| `#e9db6e` | 深底標題金／分隔線 | 2 |
| `#FFE3A4` | 導覽 active 態（JS 動態加掛） | 2 |
| `#cfc7bb` | 深底副文 | 1 |
| `text-gray-700` / `text-gray-800` | — | 5 |

**`text-gray-700/800` 全部位於不可見元素**：4 處 class 以 `hidden` 開頭，1 處位於 `#location` section 而該 section 本身帶 `!hidden`。移除為零視覺風險。

背景色 `#3d3127`、`#453a32` 分別等同 `:root` 已定義卻 0 引用的 `--color-brand-brown`、`--color-brand-brown-dark`。

### 2.3.1 未指定顏色的元素（computed 落在瀏覽器預設純黑）

以 computed style 量測（1440px，僅計可見元素）：

| computed color | 元素數 | 身分 |
| --- | --- | --- |
| `rgb(255,255,255)` | 55 | white |
| `rgb(43,43,43)` | 24 | `#2B2B2B` |
| `rgb(0,0,0)` | **11** | **從未指定顏色** |
| `rgb(125,98,26)` | 6 | `#7d621a` |
| `rgb(128,128,128)` | 4 | `#808080` |
| `rgb(233,219,110)` | 2 | `#e9db6e` |
| `rgb(207,199,187)` | 1 | `#cfc7bb` |

那 11 個純黑元素為：

- `#info` 的 6 個 `<p>`（投資興建／結構工程／營造公司／燈光設計／建築規劃／建築代銷）
- `#form` 的 4 個 `<div>`（接待中心／貴賓專線／建照號碼／不動產經紀人）與 1 個 `<input>`

它們沒有任何 `text-*` class，故 `body` 無 `color` 宣告時直接落到瀏覽器預設 `#000`。

**掃 Tailwind class 永遠找不到這個問題——因為它們沒有 class。** 此項僅能由 computed
style 量測發現，是本次「統一字色」的實質缺口。

註：`#kv` 與 `#form` 兩個 section 的 `id` 寫在 `<section` 的**下一行**，
用 `grep '<section id='` 會漏掉它們。全站共 15 個 section。

### 2.4 字級

依 class 組合分類（而非依單一 utility 統計）：

| 語意群組 | 手機份 | 桌機份 | 已響應式寫法 |
| --- | --- | --- | --- |
| 圖片 overlay 圖說 | `text-[8px]` ×16 | `text-[10px]` ×16 | `text-[8px] md:text-[10px]` ×4 |
| section 內文 | `text-[10px]` ×12 | `text-sm` ×10 | `text-[10px] md:text-sm` ×16 |
| `#info` 建案資訊表格 | — | — | `text-sm md:text-base` ×4 |
| section 主標 | `text-lg` | `text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl` | 合併版見下 |

`text-[12px]`（4 次）與 `text-xs`（8 次）為同一數值（12px），可直接合併。

### 2.5 已知缺陷

**(a) section 主標尺寸曲線非單調**

`text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl` 實際渲染為：

```
18px → 30px (md, 768) → 24px (lg, 1024) → 24px (xl) → 30px (2xl, 1536)
                         ^^^^ 縮小
```

平板（768–1023px）標題比筆電（1024px）大 6px。

**(b) section 主標階層與顏色不一致**

| Section | 背景 | 標籤 | 顏色 |
| --- | --- | --- | --- |
| `#mrt` `#traffic` `#school` `#park` `#vr` `#facility` | 紙紋 | `h3` | `#7d621a` |
| `#materials` | 白底 | `h3` | `#2B2B2B` |
| `#info` | 紙紋 | `h4` | `#2B2B2B` |

另：`#materials` 內主標 `h3` 與次標 `h4` 字級完全相同，僅靠 `font-light` / `font-medium` 區分，階層扁平。另有一處 `h4` 直接寫 inline `style="font-size: 1.5rem; font-weight: bold;"`。

**(c) 垂直留白部分未對齊**

分析此項必須先區分兩種佈局，否則會得到錯誤結論：

- **A 類：左文右圖 side-by-side**（`#mrt`、`#traffic`、`#park`）
  文字欄以 flex 垂直置中（`justify-center` 或 `justify-between`）對齊右側圖片高度。
  **標題的垂直位置由 flex 對齊決定，與 padding 無關。** 其手機份 markup 內雖有 `py-10`，
  但該容器帶 `md:hidden`（L820／L1003／L1294），桌機不可見，不應計入桌機留白。

- **B 類：標題置頂堆疊**（`#school`、`#facility`、`#vr`、`#team`、`#materials`、`#info`）
  section `py` 與內容 `py` 疊加，直接決定標題上方留白。

桌機（md 以上）實測：

| Section | 類別 | section `py` | 內容 `py` | 標題上方留白 |
| --- | --- | --- | --- | --- |
| `#mrt` `#traffic` `#park` | A | 96px | — | 由 flex 決定 |
| `#vr` `#team` | B | 96px | 無 | 96px |
| `#materials` | B | 80px | 無 | **80px** |
| `#school` | B | 96px | 64px | **160px** |
| `#facility` | B | 無 | 64px | **64px** |
| `#info` | B | 48px（僅 `pt-12`） | 無 | **48px** |

B 類多數已是 96px，離群者為 `#materials`(80)、`#school`(160)、`#facility`(64)、`#info`(48)。

手機端 section `py` 為 0 或 48px，但 0 的那些其內容層帶 `py-10`(40px)，
實際呼吸為 40px 或 48px，差距 8px，視覺上難以察覺。

**(d) 壞掉的 `@apply`（L357-359）**

```css
.unique-image-caption {
  @apply text-[8px] md: text-[10px] text-white px-2 pb-1 absolute bottom-0 right-0 w-full text-right;
}
```

兩個獨立缺陷：

1. 此 `@apply` 位於**普通 `<style>`** 內。Tailwind CDN 僅處理 `<style type="text/tailwindcss">` 中的 `@apply`；普通 `<style>` 內的 `@apply` 為無效 CSS，遭瀏覽器丟棄。
2. `md:` 後多一個空格，即使處理也會失敗。

實測 `.unique-image-caption` 與 `.unique-responsive-carousel` 在 markup 中皆為 **0 次使用**，整組為死 code。

---

## 3. 設計

### 3.1 色彩 token

於 `tailwind.config` 定義：

| Token | 值 | 取代 |
| --- | --- | --- |
| `ink` | `#2B2B2B` | `text-[#2B2B2B]` |
| `gold` | `#7d621a` | `text-[#7d621a]` |
| `gold-light` | `#e9db6e` | `text-[#e9db6e]`、`bg-[#e9db6e]` |
| `gold-pale` | `#FFE3A4` | JS 動態 class |
| `sand` | `#cfc7bb` | `text-[#cfc7bb]` |
| `muted` | `#808080` | 表單 input |
| `brown` | `#3d3127` | `bg-[#3d3127]` |
| `brown-dark` | `#453a32` | `bg-[#453a32]` |
| `brown-deep` | `#321d12` | `bg-[#321d12]` |

`text-gray-700` / `text-gray-800`（5 處，全在隱藏元素）直接移除。

另於 `body` 補上 `color: var(--color-ink)`，使 2.3.1 那 11 個未指定顏色的元素
由瀏覽器預設純黑 `#000` 繼承為 `#2B2B2B`。這是全站字色統一的最後一塊缺口。

### 3.2 字型 token

- `--font-serif` 重新定義為 `'Times New Roman', Georgia, serif`（照 `.fc-cap-en` 的實際 fallback 順序）
- `.fc-cap-en` 改用 `font-family: var(--font-serif)`。視覺不變。
- 刪除 `--font-CenturyGothic`
- 刪除 `src/fonts.css`（整檔未載入，見 2.2.1）
- 移除 `Shafarik` 的 Google Fonts `<link>`（`index.html:53`、`thanku.html:39`）

`src/assets/fonts/` 的 137MB 刪除**不在此步驟**，見 5. 步驟 9。

### 3.3 字級階梯

```
title:       18px → 24px (md) → 30px (2xl)    單調遞增
subtitle:    16px → 20px (md) → 24px (2xl)    單調遞增，恆比 title 小一級
info-row:    14px → 16px (md)
body-text:   10px → 14px (md)
img-caption:  8px → 10px (md)
```

`title` 的 md 值由 30px 改為 24px，用於消除 2.5(a) 的反折，僅影響 768–1023px 寬度。

`subtitle` 為新增階梯，供 `#materials` 的品牌名次標使用（現況與主標同級，見 2.5(b)）。三個斷點皆恰比 `title` 小一級，確保階層在任何寬度下都成立。

### 3.4 語意元件 class

**必須新增一個 `<style type="text/tailwindcss">` 區塊**，`@apply` 才會生效（見 2.5(d)）。既有的普通 `<style>` 保留給非 Tailwind 的 CSS。

```
.section-title     → 11 處  text-gold + title 階梯 + font-light + leading-tight
.subsection-title  →  2 處  text-ink + subtitle 階梯 + font-medium + leading-tight
.body-text         → 約 38 處  text-ink + body-text 階梯 + tracking-widest + leading-6
.img-caption       → 36 處  text-white + img-caption 階梯 + 定位
.info-row          →  4 處  info-row 階梯
```

同一 class 同時掛在手機份與桌機份 markup 上（見 2.1）。

`.unique-image-caption`、`.unique-responsive-carousel` 於重構時刪除。

### 3.5 標題階層統一

三項改動：

1. `#materials`、`#info` 的 section 主標統一為 `h3` + `.section-title`。
   `#info` 的「建案資訊」由 `h4` 升為 `h3`；兩者顏色由 `#2B2B2B` 改為金棕 `#7d621a`。
2. `#materials` 內的品牌名次標（`h4`，2 處）改用 `.subsection-title`，
   套用 `subtitle` 階梯（16／20／24px），恆比主標小一級。
   現況為與主標同級、僅靠 `font-light` / `font-medium` 區分。
3. 移除 `h4` 上的 inline `style="font-size: 1.5rem; font-weight: bold;"`，改用 `.subsection-title`。

`#7d621a` 於白底對比度約 5.9:1，通過 WCAG AA。

### 3.6 垂直間距

**目標：B 類（標題置頂堆疊）section 的桌機標題上方留白統一為 96px。**
A 類（左文右圖）的 section `py` 已是 `md:py-24`，且標題位置由 flex 決定，**不動**。

只需修正四個離群 section：

| Section | 現況 | 改為 | 桌機留白 |
| --- | --- | --- | --- |
| `#materials` | section `py-12 md:py-20` | `py-12 md:py-24` | 80 → 96px |
| `#school` | section `md:py-24` + 內容 `py-10 md:py-16` | 內容改 `py-10 md:py-0` | 160 → 96px |
| `#facility` | section 無 + 內容 `py-10 md:py-16` | section 加 `md:py-24`，內容改 `py-10 md:py-0` | 64 → 96px |
| `#info` | section `pt-12` | `py-12 md:py-24` | 48 → 96px |

不動的 section：

- `#mrt`、`#traffic`、`#park`（A 類，flex 置中）
- `#vr`、`#team`（已是 96px）
- `#aerial`、`#brand`、`#building`（滿版圖／滿版底色，本就無 `py`）
- `#location`（帶 `!hidden`，不可見）

手機端維持現況（40px／48px 混用，差距 8px 視覺不可察）。強行統一需改動 A 類的手機份
markup，收益不足以抵銷風險，列為非目標。

---

## 4. 風險與驗證

### 4.1 主要驗證手段：computed style 快照，而非截圖

**不以截圖比對作為主要驗證。** 本次重構的標的就是 computed style（font／color／size／
spacing），而截圖是一條帶雜訊的間接管道。實測證實三個無法消除的雜訊源：

1. `#vr` 內嵌外部 VR 環景 iframe，載入時機取決於外部網路
2. `#school`、`#park` 的圖片排版依圖片載入時序而異
3. slick 輪播的 autoplay 是 `setInterval`，在 Chrome `--virtual-time-budget` 下會前進不定張數

實測結果：截圖比對在上述 section 無法達成確定性；而 computed style 快照
連續兩次執行**逐字元相同**（693 行，涵蓋 15 個 section × 5 個斷點）。

工具為 `_verify.sh`（搭配 `_shot.html`、`_probe.html`），實作完成後一併刪除：

```bash
./_verify.sh serve                  # 啟動本機 server
./_verify.sh styles baseline        # 產生基準快照
# ...改動...
./_verify.sh styles t2 && ./_verify.sh sdiff baseline t2
```

快照記錄每個可見文字元素的 `font-family` / `font-size` / `font-weight` / `color` /
`line-height` / `letter-spacing` / `margin-bottom` / 距 section 頂端距離，以及每個
section 的 `padding-top` / `padding-bottom`。

截圖（`./_verify.sh snap` / `diff`）僅作為輔助，供人工檢視關鍵 section 的視覺結果。

### 4.2 各步驟的驗證斷言

| 步驟 | 風險 | 驗證斷言 |
| --- | --- | --- |
| 1 建立 token | 極低（不改 markup） | `sdiff` **完全 PASS** |
| 2 字色 token 替換 | 極低（等值替換） | `sdiff` **完全 PASS** + grep 無殘留 hex |
| 3 清理死設定 | 極低（實測 0 引用） | `sdiff` **完全 PASS** |
| 4 `--font-serif` | 極低（等值替換） | `sdiff` **完全 PASS** |
| 5 語意 class 替換 | 中（`@apply` 可能靜默失效） | `sdiff` **完全 PASS** |
| 6 `body` 補 `color` | 低（僅影響未指定者） | `sdiff` **恰好 11 行**：`rgb(0,0,0)` → `rgb(43,43,43)`，無其他差異 |
| 7 `title` 字級曲線 | 低（僅平板寬度） | 僅 768px 的 `size=` 由 30px→24px，其餘斷點不變 |
| 8 標題階層與顏色 | 中 | `#materials`/`#info` 主標 `color` 轉為 `rgb(125,98,26)`；`#info` 標籤 `h4`→`h3` |
| 9 垂直間距 | 中（僅 4 個 B 類 section） | `#materials`/`#school`/`#facility`/`#info` 的 `pt=` 均為 `96px`；A 類不得變動 |
| 10 刪除字型檔 | 低（實測 0 引用） | `sdiff` **完全 PASS** |

步驟 1–5 是純等值替換，斷言是 `sdiff` 完全 PASS——**任何一行差異都代表改壞了**。

步驟 6–9 是刻意的視覺改動，斷言是「差異恰好等於預期，且不多不少」。
例如步驟 6 若出現第 12 行差異，代表 `body` 的 `color` 意外影響了原本已指定顏色的元素。

### 4.3 關鍵前提

**A 類 section（`#mrt`、`#traffic`、`#park`）的間距不在改動範圍內**，因其標題位置由
flex 對齊決定（見 2.5(c)）。實作時若發現任一 A 類 section 實為 padding 定位，
應先回頭修正本文件。

`@apply` 必須寫在新增的 `<style type="text/tailwindcss">` 內。若誤寫入既有的普通
`<style>`，樣式會**靜默失效而非報錯**——這正是 `.unique-image-caption` 的失敗原因。
因此步驟 5 不可僅憑「無錯誤」判定成功，必須以 `sdiff` PASS 為準。

驗證斷點：375、768、1024、1440、1536px。

---

## 5. 實作順序

風險由低至高，每步可獨立 commit 與回滾：

0. 建立驗證 harness（`_verify.sh` / `_shot.html` / `_probe.html`），產生 baseline 快照
1. 新增 `tailwind.config` 色彩／字級 token 與 `<style type="text/tailwindcss">` 區塊（不改 markup）
2. 字色 token 替換 + 移除 `text-gray-700/800`
3. 清理死設定：`fonts.css`、`Shafarik` `<link>`、`--font-CenturyGothic`、`.unique-*` 死 class
4. `--font-serif` 重新定義，`.fc-cap-en` 改用變數
5. 建立 `.section-title` / `.subsection-title` / `.body-text` / `.img-caption` / `.info-row`，替換 markup
6. `body` 補 `color: var(--color-ink)`，收拾 11 個未指定顏色的元素
7. 修正 `title` 字級曲線（`md:text-3xl` → `md:text-2xl`）
8. 統一標題階層與顏色（`#materials`、`#info`）
9. 統一垂直間距（`#materials`、`#school`、`#facility`、`#info` 四個 B 類 section）
10. 刪除驗證 harness 三個檔案
11. **（獨立步驟，執行前另行確認）** 刪除 `src/assets/fonts/` 全部 137MB

步驟 1–9 完成後網站應與現況視覺一致（除 3.3、3.5、3.6、2.3.1 列出的預期改動外）。
步驟 11 與前面無依賴關係，可單獨執行或永久擱置。

---

## 6. 非目標

- 不改動 Tailwind CDN 為 build-time 方案
- 不改動雙份 markup 架構（手機／桌機分離）
- 不改動 `.fc-*` 公設輪播的版面邏輯
- 不調整 `!tracking-widest`（59 次）與 `!leading-6`（49 次）的既有數值，僅收進 component class
- **不統一手機端 section 間距**（現況 40px／48px，差距 8px 視覺不可察；統一需改動 A 類手機份 markup，風險大於收益）
- 不改動 A 類 section 的 flex 對齊佈局
