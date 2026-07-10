# 全站字型／字色／字級／間距統一 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `index.html` 散落的字色／字級／間距收斂為 token 與語意元件 class，並修正因散落而產生的實際視覺不一致。

**Architecture:** 於 Tailwind CDN 後加掛 `tailwind.config` 定義色彩 token，另開一個 `<style type="text/tailwindcss">` 區塊以 `@apply` 定義語意元件 class。既有的普通 `<style>` 保留給非 Tailwind 的 CSS。markup 由一長串 utility 改為語意 class。

**Tech Stack:** 單一 `index.html`（3738 行）、Tailwind CDN（無 build step）、jQuery、slick-carousel、AOS、fancybox。無測試框架。

**Spec:** `docs/superpowers/specs/2026-07-10-typography-tokens-design.md`

---

## Global Constraints

- 工作分支：`refactor/typography-tokens`。基準 commit `77e4eee`。
- 目標檔案只有一個：`web_v0.0.08/index.html`。所有路徑以 `web_v0.0.08/` 為根。
- **`@apply` 只在 `<style type="text/tailwindcss">` 內有效。** 寫進既有的普通 `<style>`（L72–784）會**靜默失效、不報錯**。現場已有一個這樣的受害者（`.unique-image-caption`）。
- **驗證一律用 computed style 快照，不用截圖比對。** 截圖有三個無法消除的雜訊源：`#vr` 的外部 VR iframe、`#school`/`#park` 依圖片載入時序的排版、slick autoplay 的 `setInterval` 在 `--virtual-time-budget` 下前進不定張數。
- 每個 task 結束都必須跑 `sdiff` 並確認斷言後才 commit。斷言不符 → 回頭修，不要往下走。
- **A 類 section（`#mrt`、`#traffic`、`#park`）的標題位置由 flex 垂直置中決定，與 padding 無關。** 不得改動其間距。
- 全站共 **15 個** section。`#kv` 與 `#form` 的 `id` 寫在 `<section` 的下一行，`grep '<section id='` 會漏掉。
- 手機份 markup 在 `md:hidden` 容器內，桌機份在 `hidden md:flex` / `hidden md:block` 內。同一 class 可同時掛在兩份上，各自因容器隱藏而只顯示一份。

### 色彩 token 對照（實測值，不可自行更動）

| token | 值 | computed |
| --- | --- | --- |
| `ink` | `#2B2B2B` | `rgb(43, 43, 43)` |
| `gold` | `#7d621a` | `rgb(125, 98, 26)` |
| `gold-light` | `#e9db6e` | `rgb(233, 219, 110)` |
| `gold-pale` | `#FFE3A4` | — |
| `sand` | `#cfc7bb` | `rgb(207, 199, 187)` |
| `muted` | `#808080` | `rgb(128, 128, 128)` |
| `brown` | `#3d3127` | — |
| `brown-dark` | `#453a32` | — |
| `brown-deep` | `#321d12` | — |

---

### Task 0: 驗證 harness 與 baseline 快照

**Files:**
- Create: `_verify.sh`、`_shot.html`、`_probe.html`（皆為臨時檔，Task 10 刪除）
- Modify: `.gitignore`

**Interfaces:**
- Produces: `./_verify.sh styles <name>` 產生快照；`./_verify.sh sdiff <a> <b>` 比對。後續每個 task 都依賴這兩個指令。

- [ ] **Step 1: 確認三個 harness 檔案已存在且可執行**

```bash
cd web_v0.0.08
ls -la _verify.sh _shot.html _probe.html && chmod +x _verify.sh
```

- [ ] **Step 2: 把 harness 加入 .gitignore（不進版控）**

在 `.gitignore` 末尾加入：

```
# 臨時驗證 harness（重構完成後刪除）
_verify.sh
_shot.html
_probe.html
```

- [ ] **Step 3: 啟動 server 並產生 baseline 快照**

```bash
./_verify.sh serve
./_verify.sh styles baseline
```

Expected: `styles 'baseline' → /tmp/hh-verify/styles/baseline  (693 行)`

- [ ] **Step 4: 驗證快照具確定性（這一步不可略過）**

```bash
./_verify.sh styles chk && ./_verify.sh sdiff baseline chk
```

Expected: `PASS: 樣式快照 baseline 與 chk 完全相同`

若非 PASS，harness 不可信，**停止**，先修 harness。

- [ ] **Step 5: Commit（只有 .gitignore）**

```bash
git add .gitignore
git commit -m "chore: 忽略臨時驗證 harness"
```

---

### Task 1: 建立 token 與 tailwindcss style 區塊

**Files:**
- Modify: `index.html:36`（Tailwind CDN script 之後）

**Interfaces:**
- Produces: Tailwind 色彩 token `ink` `gold` `gold-light` `gold-pale` `sand` `muted` `brown` `brown-dark` `brown-deep`；一個空的 `<style type="text/tailwindcss">` 供 Task 5 填入 component class。

- [ ] **Step 1: 在 Tailwind CDN script 之後插入 config**

`index.html` 第 36 行原本是：

```html
    <script src="https://cdn.tailwindcss.com"></script>
```

改為：

```html
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // 色彩單一真相來源。修改此處即全站同步。
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              ink: '#2B2B2B',
              gold: '#7d621a',
              'gold-light': '#e9db6e',
              'gold-pale': '#FFE3A4',
              sand: '#cfc7bb',
              muted: '#808080',
              brown: '#3d3127',
              'brown-dark': '#453a32',
              'brown-deep': '#321d12',
            },
          },
        },
      };
    </script>
    <style type="text/tailwindcss">
      /* 語意元件 class。@apply 只在 type="text/tailwindcss" 的 style 內有效；
         寫進普通 <style> 會靜默失效（見 .unique-image-caption 的前車之鑑）。 */
    </style>
```

- [ ] **Step 2: 驗證 token 已註冊、且未改動任何 computed style**

```bash
./_verify.sh styles t1 && ./_verify.sh sdiff baseline t1
```

Expected: `PASS: 樣式快照 baseline 與 t1 完全相同`

（本步驟不改 markup，任何差異都代表 config 寫錯導致 Tailwind 重新生成 CSS。）

- [ ] **Step 3: 驗證 `text-gold` 這個新 class 真的生效**

臨時把 `index.html` 第一個 `<h3` 的 `text-[#7d621a]` 改成 `text-gold`，跑：

```bash
./_verify.sh probe 1440 | grep -m1 'h3 ' 
```

Expected: 該行 `color=rgb(125, 98, 26)`（與改前相同）。確認後**還原**這個臨時改動。

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: 加入 Tailwind 色彩 token 與 tailwindcss style 區塊"
```

---

### Task 2: 字色 token 替換

**Files:**
- Modify: `index.html`（全檔）

**Interfaces:**
- Consumes: Task 1 的色彩 token
- Produces: markup 中不再有字色的 arbitrary hex

- [ ] **Step 1: 替換字色 class（等值，逐像素應無變化）**

```bash
cd web_v0.0.08
python3 - <<'PY'
import re
p = 'index.html'
s = open(p, encoding='utf-8').read()
pairs = [
    ('text-[#2B2B2B]',  'text-ink'),
    ('text-[#7d621a]',  'text-gold'),
    ('text-[#e9db6e]',  'text-gold-light'),
    ('text-[#FFE3A4]',  'text-gold-pale'),
    ('text-[#cfc7bb]',  'text-sand'),
    ('text-[#808080]',  'text-muted'),
    ('bg-[#3d3127]',    'bg-brown'),
    ('bg-[#453a32]',    'bg-brown-dark'),
    ('bg-[#321d12]',    'bg-brown-deep'),
    ('bg-[#e9db6e]',    'bg-gold-light'),
]
for a, b in pairs:
    n = s.count(a)
    s = s.replace(a, b)
    print(f'{a:20s} → {b:20s} {n} 處')
open(p, 'w', encoding='utf-8').write(s)
PY
```

Expected 輸出（次數必須完全吻合，否則停止）：

```
text-[#2B2B2B]       → text-ink              36 處
text-[#7d621a]       → text-gold              9 處
text-[#e9db6e]       → text-gold-light        2 處
text-[#FFE3A4]       → text-gold-pale         2 處
text-[#cfc7bb]       → text-sand              1 處
text-[#808080]       → text-muted             6 處
bg-[#3d3127]         → bg-brown               1 處
bg-[#453a32]         → bg-brown-dark          4 處
bg-[#321d12]         → bg-brown-deep          1 處
bg-[#e9db6e]         → bg-gold-light          2 處
```

- [ ] **Step 2: 移除 5 處位於不可見元素的 Tailwind 預設灰**

```bash
python3 - <<'PY'
p = 'index.html'
s = open(p, encoding='utf-8').read()
# 這 5 處全在 hidden 元素上（4 處 class 以 hidden 開頭，1 處在 !hidden 的 #location 內）
n1 = s.count('text-gray-700 '); s = s.replace('text-gray-700 ', '')
n2 = s.count('text-gray-800 '); s = s.replace('text-gray-800 ', '')
open(p, 'w', encoding='utf-8').write(s)
print(f'移除 text-gray-700 ×{n1}, text-gray-800 ×{n2}')
PY
```

Expected: `移除 text-gray-700 ×4, text-gray-800 ×1`

- [ ] **Step 3: 確認無殘留**

```bash
grep -cE 'text-\[#|text-gray-[0-9]' index.html || echo "0 殘留"
```

Expected: `0 殘留`

- [ ] **Step 4: 驗證 computed style 完全未變**

```bash
./_verify.sh styles t2 && ./_verify.sh sdiff baseline t2
```

Expected: `PASS: 樣式快照 baseline 與 t2 完全相同`

這是純等值替換，**任何一行差異都代表改壞了**。

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "refactor: 字色改用 token，移除隱藏元素上的 Tailwind 預設灰"
```

---

### Task 3: 清理死設定

**Files:**
- Modify: `index.html`（L53 Shafarik、L84–90 `:root`、L352–359 `.unique-*`）
- Modify: `thanku.html`（L39 Shafarik）
- Delete: `src/fonts.css`

**Interfaces:**
- Consumes: 無
- Produces: 無（純刪除）

實測依據：`.unique-image-caption` 與 `.unique-responsive-carousel` 在 markup 中皆 0 引用；
`--font-CenturyGothic` 0 引用；`Shafarik` 0 使用；`src/fonts.css` 從未被載入（`index.html:42` 是註解）。

- [ ] **Step 1: 移除 Shafarik 的 Google Fonts link（兩個檔案）**

刪除 `index.html` 這一行：

```html
    <link href="https://fonts.googleapis.com/css2?family=Shafarik&display=swap" rel="stylesheet">
```

刪除 `thanku.html` 中同樣的那一行。

- [ ] **Step 2: 移除 `--font-CenturyGothic` 變數**

刪除 `index.html` `:root` 內這兩行：

```css
        --font-CenturyGothic: "Century Gothic", "Noto Serif", "Roboto", "Lora",
          sans-serif;
```

- [ ] **Step 3: 移除死 class `.unique-responsive-carousel` 與 `.unique-image-caption`**

刪除 `index.html` 中所有 `.unique-responsive-carousel` 規則，以及：

```css
      .unique-image-caption {
        @apply text-[8px] md: text-[10px] text-white px-2 pb-1 absolute bottom-0 right-0 w-full text-right;
      }
```

（此 `@apply` 位於普通 `<style>` 內，本就從未生效；且 `md:` 後多一空格。）

- [ ] **Step 4: 刪除 fonts.css 與其註解引用**

```bash
git rm src/fonts.css
```

刪除 `index.html:42` 這行註解：

```html
    <!-- <link rel="stylesheet" href="./src/fonts.css" /> -->
```

- [ ] **Step 5: 確認無殘留引用**

```bash
grep -c "Shafarik\|font-CenturyGothic\|unique-image-caption\|unique-responsive-carousel\|fonts.css" index.html thanku.html || echo "0 殘留"
```

Expected: `0 殘留`

- [ ] **Step 6: 驗證 computed style 完全未變**

```bash
./_verify.sh styles t3 && ./_verify.sh sdiff baseline t3
```

Expected: `PASS: 樣式快照 baseline 與 t3 完全相同`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: 清理死字型設定與 0 引用的 unique-* class"
```

---

### Task 4: `--font-serif` 重新定義

**Files:**
- Modify: `index.html`（`:root` 的 `--font-serif`；`.fc-cap-en`）

**Interfaces:**
- Consumes: 無
- Produces: `.fc-cap-en` 改由 `var(--font-serif)` 供給字型

背景：`.fc-cap-en` 硬寫 `'Times New Roman', serif`，服務 `#facility` 的四個英文圖說
（Gym / Multi-function Room / Tutoring Classroom / Piano Room），帶 `mix-blend-mode: screen`。
而 `--font-serif` 現為 `"Noto Serif", "Georgia", "Times New Roman", …`，首選字型從未載入，且 0 引用。

- [ ] **Step 1: 重新定義 `--font-serif` 為實際的 fallback 順序**

`:root` 內原本：

```css
        --font-serif: "Noto Serif", "Georgia", "Times New Roman", "LiSu",
          "PMingLiU", serif;
```

改為：

```css
        /* 供 .fc-cap-en 使用。順序照其原本硬寫的值，確保 computed 結果不變。 */
        --font-serif: 'Times New Roman', Georgia, serif;
```

- [ ] **Step 2: `.fc-cap-en` 改用變數**

原本：

```css
        font-family: 'Times New Roman', serif;
```

改為：

```css
        font-family: var(--font-serif);
```

- [ ] **Step 3: 驗證 computed font-family 未變**

```bash
./_verify.sh styles t4 && ./_verify.sh sdiff baseline t4
```

Expected: `PASS: 樣式快照 baseline 與 t4 完全相同`

（快照的 `font=` 欄位取第一個字族，`.fc-cap-en` 應維持 `Times New Roman`。）

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "refactor: .fc-cap-en 改用 --font-serif 變數"
```

---

### Task 5: 建立語意元件 class 並替換 markup

**Files:**
- Modify: `index.html`（Task 1 建立的 `<style type="text/tailwindcss">`；全檔 markup）

**Interfaces:**
- Consumes: Task 1 的 `<style type="text/tailwindcss">` 與色彩 token
- Produces: `.section-title` `.subsection-title` `.body-text` `.img-caption` `.info-row`

**注意本 task 必須維持等值。** `.section-title` 此時仍沿用原本的非單調字級曲線，
曲線修正留到 Task 7。

- [ ] **Step 1: 填入 component class**

把 Task 1 建立的空 `<style type="text/tailwindcss">` 內容改為：

```html
    <style type="text/tailwindcss">
      /* 語意元件 class。@apply 只在 type="text/tailwindcss" 的 style 內有效；
         寫進普通 <style> 會靜默失效（見 .unique-image-caption 的前車之鑑）。 */
      @layer components {
        /* section 主標。字級曲線於 Task 7 修正為單調。 */
        .section-title {
          @apply text-gold text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl font-light !leading-tight;
        }
        /* section 次標（品牌名），恆比主標小一級 */
        .subsection-title {
          @apply text-ink text-base md:text-xl 2xl:text-2xl font-medium !leading-tight;
        }
        /* 內文。不綁定顏色 —— 深底用 text-white，淺底用 text-ink。 */
        .body-text {
          @apply text-[10px] md:text-sm !tracking-widest !leading-6;
        }
        /* 圖片上的 overlay 圖說 */
        .img-caption {
          @apply text-[8px] md:text-[10px] text-white px-2 pb-1;
        }
        /* #form 的建案資訊列 */
        .info-row {
          @apply text-sm md:text-base;
        }
      }
    </style>
```

- [ ] **Step 2: 替換 `.img-caption`（36 處，三種變體）**

三種變體都可統一：手機份原本 `md` 值不可見、桌機份原本 `<md` 值不可見。

```bash
python3 - <<'PY'
p='index.html'; s=open(p,encoding='utf-8').read()
pairs=[
  ('class="text-[8px] md:text-[10px] text-white px-2 pb-1"', 'class="img-caption"'),
  ('class="text-[8px] text-white px-2 pb-1"',                'class="img-caption"'),
  ('class="text-[10px] text-white px-2 pb-1"',               'class="img-caption"'),
]
for a,b in pairs:
    n=s.count(a); s=s.replace(a,b); print(f'{n:3d} 處  {a[:52]}')
open(p,'w',encoding='utf-8').write(s)
PY
```

Expected: `4 處` / `16 處` / `16 處`（合計 36）

- [ ] **Step 3: 驗證 img-caption 等值**

```bash
./_verify.sh styles t5a && ./_verify.sh sdiff baseline t5a
```

Expected: `PASS`

若 FAIL，代表某個變體所在容器並非如預期般隱藏 —— 回頭檢查該處的 `md:hidden` / `hidden md:*`。

- [ ] **Step 4: 替換 `.body-text`**

`.body-text` 的字級是 `10px → md:14px`。**凡是字級為固定 `text-sm`（14px 全斷點）
且在桌機可見的元素，都不能套用**，否則手機字級會由 14px 掉到 10px，不等值。

必須排除的三種（本步驟不碰）：

| class | 處數 | 排除原因 |
| --- | --- | --- |
| `text-sm text-center !tracking-widest !leading-6 md:!leading-8` | 6 | `#info` 的 6 個 `p`，14px 全斷點 |
| `text-ink text-sm text-center !tracking-widest !leading-6` | 1 | 同上，14px 全斷點 |
| `text-ink text-xl md:text-2xl !tracking-widest !leading-6 lg:!leading-8 pb-2` | 1 | 是標題，非內文 |

另 `text-ink text-lg md:text-3xl … pb-2`（1 處）是 `#info` 主標，由 Task 8 處理。

```bash
python3 - <<'PY'
p='index.html'; s=open(p,encoding='utf-8').read()
pairs=[
  # 深底白字（手機份 10px / 桌機份 14px，各自只有一份可見）
  ('class="text-white text-[10px] text-center !tracking-widest !leading-6 px-2"',
   'class="body-text text-white text-center px-2"'),
  ('class="text-white text-sm text-center !tracking-widest !leading-6 px-2"',
   'class="body-text text-white text-center px-2"'),
  ('class="text-white text-[10px] md:text-sm text-justify !tracking-widest !leading-6"',
   'class="body-text text-white text-justify"'),
  ('class="text-white text-[10px] md:text-sm text-center !tracking-widest !leading-6 max-w-3xl"',
   'class="body-text text-white text-center max-w-3xl"'),
  # 淺底 ink（長字串先替換，避免被短字串搶先匹配）
  ('class="text-ink text-[10px] md:text-sm text-center !tracking-widest !leading-6 max-w-3xl"',
   'class="body-text text-ink text-center max-w-3xl"'),
  ('class="text-ink text-[10px] md:text-sm text-center !tracking-widest !leading-6 opacity-80"',
   'class="body-text text-ink text-center opacity-80"'),
  ('class="text-ink text-[10px] md:text-sm text-center !tracking-widest !leading-6"',
   'class="body-text text-ink text-center"'),
  # 手機份（無 md:text-sm，位於 md:hidden 內，md 值不可見）
  ('class="text-ink text-[10px] text-center !tracking-widest !leading-6"',
   'class="body-text text-ink text-center"'),
  # 深底 sand
  ('class="text-sand text-[10px] md:text-sm text-center !tracking-widest !leading-6"',
   'class="body-text text-sand text-center"'),
]
for a,b in pairs:
    n=s.count(a); s=s.replace(a,b); print(f'{n:3d} 處  {a[7:62]}')
open(p,'w',encoding='utf-8').write(s)
PY
```

Expected: `12 / 10 / 1 / 1 / 3 / 2 / 6 / 3 / 1` 處，合計 39。

**注意 pairs 的順序**：`max-w-3xl` 與 `opacity-80` 的長字串必須排在無後綴的短字串之前，
否則短字串會先匹配掉前綴，留下孤兒 `max-w-3xl` / `opacity-80`。

- [ ] **Step 4b: 確認殘留的 `!leading-6` 都是刻意排除的**

```bash
grep -oE 'class="[^"]*!leading-6[^"]*"' index.html | sed 's/class="//;s/"$//' | sort | uniq -c | sort -rn
```

Expected: 只剩下上表列出的排除項（6 / 1 / 1 / 1 處）與 `text-[10px] md:text-sm …`
（1 處，原 `text-gray-800`，位於 `!hidden` 的 `#location` 內，不可見）。
若出現其他殘留，代表有變體未被涵蓋 —— 補進 pairs 再跑一次。

- [ ] **Step 5: 替換 `.info-row`（4 處，在 `#form` 內）**

```bash
python3 - <<'PY'
p='index.html'; s=open(p,encoding='utf-8').read()
a='border-t border-[#453E32]/60 py-2 md:py-3 text-sm md:text-base'
b='border-t border-[#453E32]/60 py-2 md:py-3 info-row'
n=s.count(a); s=s.replace(a,b)
open(p,'w',encoding='utf-8').write(s)
print(f'{n} 處 → info-row')
PY
```

Expected: `4 處 → info-row`

- [ ] **Step 6: 替換 `.section-title`（9 處，僅 `text-gold` 的）**

`#materials` 與 `#info` 的主標此時仍是 `text-ink`，留到 Task 8 處理。

```bash
python3 - <<'PY'
import re
p='index.html'; s=open(p,encoding='utf-8').read()
# 手機份：text-lg（無響應式）
a1='class="text-gold text-lg text-center font-light !leading-tight whitespace-nowrap"'
b1='class="section-title text-center whitespace-nowrap"'
# 桌機份：text-3xl 起跳
a2='class="text-gold text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center font-light !leading-tight whitespace-nowrap"'
b2='class="section-title text-center whitespace-nowrap"'
a3='class="text-gold text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-start font-light !leading-tight whitespace-nowrap"'
b3='class="section-title text-start whitespace-nowrap"'
# 單一份（含完整響應式）
a4='class="text-gold text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center font-light !leading-tight whitespace-nowrap"'
b4='class="section-title text-center whitespace-nowrap"'
for a,b in [(a1,b1),(a2,b2),(a3,b3),(a4,b4)]:
    n=s.count(a); s=s.replace(a,b); print(f'{n} 處')
open(p,'w',encoding='utf-8').write(s)
print('剩餘 text-gold 標題:', len(re.findall(r'text-gold text-(lg|3xl)', s)))
PY
```

Expected（實測次數，必須完全吻合）：

```
3 處     ← a1 手機份 text-lg（#mrt / #traffic / #park）
1 處     ← a2 桌機份 text-center（#mrt）
2 處     ← a3 桌機份 text-start（#traffic / #park）
3 處     ← a4 單一份完整響應式（#school / #vr / #facility）
剩餘 text-gold 標題: 0
```

合計 9 處。

> 注意：手機份的 `text-lg` 版本套上 `.section-title` 後，其 `md` 以上字級變為 30px，
> 但該容器帶 `md:hidden`，不可見。桌機份的 `<md` 字級變為 18px，同樣不可見。故為等值。

- [ ] **Step 7: 驗證全部 component class 等值**

```bash
./_verify.sh styles t5 && ./_verify.sh sdiff baseline t5
```

Expected: `PASS: 樣式快照 baseline 與 t5 完全相同`

**這是本計畫最容易出錯的一步。** 若 `@apply` 沒生效，所有套用 component class 的元素
會失去字級與顏色，`sdiff` 會出現大量差異。若 FAIL：
1. 先確認 `<style type="text/tailwindcss">` 存在且拼字正確
2. 再確認 `@layer components` 包住了所有規則
3. 用 `./_verify.sh probe 1440 | grep section-title` 之類的方式定位

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "refactor: 建立語意元件 class 並替換 markup"
```

---

### Task 6: `body` 補上 `color`，收拾 11 個未指定顏色的元素

**Files:**
- Modify: `index.html`（`:root` 加 `--color-ink`；`body` 加 `color`）

**Interfaces:**
- Consumes: 無
- Produces: 未指定顏色的元素由 `#000` 繼承為 `#2B2B2B`

實測：11 個可見元素的 computed color 為 `rgb(0,0,0)`，因為它們沒有任何 `text-*` class，
而 `body` 也沒有 `color` 宣告。分別是 `#info` 的 6 個 `<p>`、`#form` 的 4 個 `<div>` 與 1 個 `<input>`。

- [ ] **Step 1: 在 `:root` 加入 `--color-ink`**

於 `:root` 的「品牌顏色」區塊加入：

```css
        --color-ink: #2B2B2B;
```

- [ ] **Step 2: `body` 加上 `color`**

`body` 規則原本：

```css
      body {
        position: relative;
        width: 100dvw;
        min-height: 100svh;
        font-family: var(--font-sans);
        overflow-x: hidden;
      }
```

改為：

```css
      body {
        position: relative;
        width: 100dvw;
        min-height: 100svh;
        font-family: var(--font-sans);
        color: var(--color-ink);
        overflow-x: hidden;
      }
```

- [ ] **Step 3: 驗證差異「恰好 11 行，不多不少」**

```bash
./_verify.sh styles t6 && ./_verify.sh sdiff baseline t6
```

Expected: `DIFF: 樣式快照有差異`，且差異**只有** `color=rgb(0, 0, 0)` → `color=rgb(43, 43, 43)`。

用這個指令精確確認：

```bash
grep '^[+-][^+-]' /tmp/hh-verify/styles/baseline_vs_t6.diff \
  | grep -c 'color=rgb(0, 0, 0)'
grep '^[+-][^+-]' /tmp/hh-verify/styles/baseline_vs_t6.diff \
  | grep -vc 'color=rgb(0, 0, 0)\|color=rgb(43, 43, 43)'
```

Expected: 第一個指令輸出 `55`（11 元素 × 5 斷點），第二個輸出 `0`。

第二個指令若非 `0`，代表 `body` 的 `color` 意外影響了原本已指定顏色的元素 —— **停止並調查**。

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix: body 補上文字色，未指定顏色的 11 個元素不再落到瀏覽器預設純黑"
```

---

### Task 7: 修正 `title` 字級曲線為單調遞增

**Files:**
- Modify: `index.html`（`.section-title`）

**Interfaces:**
- Consumes: Task 5 的 `.section-title`

現況實測：`18px → 30px(768) → 24px(1024) → 24px(1440) → 30px(1536)`。
平板比筆電大 6px，曲線在 lg 反折。

- [ ] **Step 1: 改為單調**

`.section-title` 原本：

```css
        .section-title {
          @apply text-gold text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl font-light !leading-tight;
        }
```

改為：

```css
        .section-title {
          @apply text-gold text-lg md:text-2xl 2xl:text-3xl font-light !leading-tight;
        }
```

- [ ] **Step 2: 驗證只有 768px 的字級改變**

```bash
./_verify.sh styles t7 && ./_verify.sh sdiff baseline t7
```

預期差異（相對 baseline，含 Task 6 的 11 元素變色）：
768px 的 `.section-title` 元素 `size=30px` → `size=24px`，`lh=37.5px` → `lh=30px`。

精確確認各斷點字級：

```bash
for w in 375 768 1024 1440 1536; do
  printf "%-6s " "${w}px"
  grep -m1 'h3 ' /tmp/hh-verify/styles/t7/$w.txt | grep -oE 'size=[0-9.]+px'
done
```

Expected:

```
375px  size=18px
768px  size=24px
1024px size=24px
1440px size=24px
1536px size=30px
```

單調遞增，無反折。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: section 標題字級曲線改為單調遞增，消除平板反折"
```

---

### Task 8: 統一標題階層與顏色

**Files:**
- Modify: `index.html`（`#materials` 主標與 2 個次標；`#info` 主標）

**Interfaces:**
- Consumes: Task 5 的 `.section-title` / `.subsection-title`

三項改動：
1. `#info` 的「建案資訊」由 `h4` 升為 `h3`
2. `#materials`、`#info` 主標顏色由 `#2B2B2B` 改為金棕 `#7d621a`
3. `#materials` 的品牌名次標改用 `.subsection-title`，比主標小一級

- [ ] **Step 1: `#materials` 主標改用 `.section-title`**

找到：

```html
                  <h3 class="text-ink text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center font-light !leading-tight mb-2">
                    國際頂規 精奢品味
                  </h3>
```

改為：

```html
                  <h3 class="section-title text-center mb-2">
                    國際頂規 精奢品味
                  </h3>
```

- [ ] **Step 2: `#materials` 的 2 個品牌名次標改用 `.subsection-title`**

找到（共 2 處，「日本三菱電梯」與「日本頂級防水隔音氣密窗」）：

```html
                    <h4 class="text-ink text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center !leading-tight font-medium mb-3">
```

改為：

```html
                    <h4 class="subsection-title text-center mb-3">
```

- [ ] **Step 3: 移除 inline style 的那個 h4**

找到：

```html
              <h4 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
```

改為：

```html
              <h4 class="subsection-title mb-4">
```

- [ ] **Step 4: `#info` 主標由 h4 升為 h3 並改用 `.section-title`**

找到：

```html
          <h4
              class="text-ink text-lg md:text-3xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center !tracking-widest !leading-6 lg:!leading-8 pb-2"
```

改為（注意結尾的 `</h4>` 也要改成 `</h3>`）：

```html
          <h3
              class="section-title text-center !tracking-widest pb-2"
```

- [ ] **Step 5: 驗證**

```bash
./_verify.sh styles t8 && ./_verify.sh sdiff baseline t8
```

精確確認：

```bash
# #materials 與 #info 主標應為金棕
for w in 768 1440; do
  echo "--- ${w}px ---"
  sed -n '/## #materials/,/## #vr/p' /tmp/hh-verify/styles/t8/$w.txt | head -3 | sed 's/^ */  /'
  sed -n '/## #info/,/## #form/p'    /tmp/hh-verify/styles/t8/$w.txt | head -2 | sed 's/^ */  /'
done
```

Expected:
- `#materials` 第 1 個元素為 `h3`，`color=rgb(125, 98, 26)`
- `#materials` 第 2 個元素為 `h4`，`size` 比 h3 小一級（1440px：h3=24px，h4=20px）
- `#info` 第 1 個元素為 **`h3`**，`color=rgb(125, 98, 26)`

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "fix: 統一 section 主標階層與顏色，materials 次標降一級"
```

---

### Task 9: 統一 B 類 section 的垂直間距

**Files:**
- Modify: `index.html`（`#materials`、`#school`、`#facility`、`#info` 四個 section）

**Interfaces:**
- Consumes: 無

**只改這四個。** A 類（`#mrt`、`#traffic`、`#park`）的標題位置由 flex 垂直置中決定，
與 padding 無關，**不得改動**。`#vr`、`#team` 已是 96px。
`#aerial`、`#brand`、`#building` 是滿版圖／滿版底色，本就無 `py`。

目標：B 類 section 的桌機標題上方留白統一為 96px。

- [ ] **Step 1: `#materials` — `md:py-20` → `md:py-24`（80 → 96px）**

```html
      <section id="materials" class="relative overflow-hidden bg-white py-12 md:py-20">
```

改為：

```html
      <section id="materials" class="relative overflow-hidden bg-white py-12 md:py-24">
```

- [ ] **Step 2: `#school` — 移除內容層的 `md:py-16`（160 → 96px）**

找到 `#school` 內：

```html
              <div class="w-11/12 md:w-full flex flex-col justify-center items-center gap-4 py-10 md:py-16">
```

改為：

```html
              <div class="w-11/12 md:w-full flex flex-col justify-center items-center gap-4 py-10 md:py-0">
```

- [ ] **Step 3: `#facility` — section 補 `md:py-24`，內容層移除 `md:py-16`（64 → 96px）**

```html
      <section id="facility" class="relative overflow-hidden bg-[url('./src/assets/image/paper.png')] bg-auto bg-repeat" style="background-size: 18%;">
```

改為（加 `md:py-24`）：

```html
      <section id="facility" class="relative overflow-hidden md:py-24 bg-[url('./src/assets/image/paper.png')] bg-auto bg-repeat" style="background-size: 18%;">
```

並把其內容層：

```html
          <div class="w-11/12 md:w-10/12 max-w-7xl flex flex-col justify-center items-center gap-4 py-10 md:py-16">
```

改為：

```html
          <div class="w-11/12 md:w-10/12 max-w-7xl flex flex-col justify-center items-center gap-4 py-10 md:py-0">
```

- [ ] **Step 4: `#info` — `pt-12` → `pt-12 md:pt-24`（上方 48 → 96px）**

**只改上方 padding。** `#info` 的內層已有 `<div class="w-full pb-12">` 提供底部 48px；
若改成 `py-12 md:py-24`，桌機底部會變成 96 + 48 = 144px，與其他 section 不一致。
本 task 的目標是「標題上方留白 96px」，不動底部。

```html
      <section id="info" class="w-full pt-12 flex flex-col justify-center items-center bg-[url('./src/assets/image/paper.png')] bg-auto bg-repeat" style="background-size: 18%;">
```

改為：

```html
      <section id="info" class="w-full pt-12 md:pt-24 flex flex-col justify-center items-center bg-[url('./src/assets/image/paper.png')] bg-auto bg-repeat" style="background-size: 18%;">
```

- [ ] **Step 5: 驗證四個 B 類 section 桌機留白皆為 96px，且 A 類未動**

```bash
./_verify.sh styles t9
echo "=== 1440px 各 section padding-top 與標題距頂 ==="
grep -E '^## #(mrt|traffic|park|school|facility|materials|info|vr|team)' /tmp/hh-verify/styles/t9/1440.txt
```

Expected：`#materials`、`#school`、`#facility`、`#info` 的 `pt=96px`；
`#mrt`、`#traffic`、`#park` 的 `pt=96px`（**與 baseline 相同，未被改動**）。

再確認 A 類標題距頂未變：

```bash
diff <(grep -A1 '^## #mrt' /tmp/hh-verify/styles/baseline/1440.txt) \
     <(grep -A1 '^## #mrt' /tmp/hh-verify/styles/t9/1440.txt) && echo "#mrt 未變"
```

Expected: `#mrt 未變`

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "fix: 統一四個 B 類 section 的桌機垂直留白為 96px"
```

---

### Task 10: 移除驗證 harness

**Files:**
- Delete: `_verify.sh`、`_shot.html`、`_probe.html`
- Modify: `.gitignore`

- [ ] **Step 1: 產生最終快照留存**

```bash
./_verify.sh styles final
cp -r /tmp/hh-verify/styles/final docs/superpowers/
```

- [ ] **Step 2: 人工目視最終結果**

```bash
./_verify.sh snap final-shots || true
open /tmp/hh-verify/final-shots
```

逐一檢視 `materials`、`info`、`school`、`facility` 在 768/1440px 的截圖。
（`vr`、`school`、`park` 的截圖有已知雜訊，僅供目視，不作為斷言。）

- [ ] **Step 3: 刪除 harness 與 .gitignore 條目**

```bash
rm -f _verify.sh _shot.html _probe.html
python3 - <<'PY'
p='.gitignore'; s=open(p,encoding='utf-8').read()
s=s.replace('''
# 臨時驗證 harness（重構完成後刪除）
_verify.sh
_shot.html
_probe.html
''','')
open(p,'w',encoding='utf-8').write(s)
PY
pkill -f "http.server 8123" 2>/dev/null || true
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: 移除臨時驗證 harness，保留最終樣式快照"
```

---

### Task 11: 刪除 `src/assets/fonts/`（獨立步驟，執行前須另行確認）

**Files:**
- Delete: `src/assets/fonts/`（22 個字型檔，137MB）

**此 task 與前面完全無依賴，可單獨執行或永久擱置。執行前必須向使用者確認。**

實測依據（見 spec 2.2.1）：
- 唯一引用來源 `src/fonts.css` 已於 Task 3 刪除，且它本來就從未被載入
- `index.html` 內 0 個 `@font-face`；`thanku.html` 走 Google Fonts CDN
- `fonts.css:80` 引用 `TrajanPro-Regular.ttf`，磁碟檔案實為 `.otf`，該規則從未生效
- 6 個檔案連 `fonts.css` 都未提及
- `Fontspring-DEMO-theseasons-bd.otf` 為 DEMO 授權，不得商業部署

- [ ] **Step 1: 最後確認無任何引用**

```bash
grep -rn "assets/fonts" --include="*.html" --include="*.js" --include="*.css" --include="*.json" . \
  | grep -v node_modules || echo "0 引用"
```

Expected: `0 引用`

- [ ] **Step 2: 刪除**

```bash
git rm -r src/assets/fonts
```

- [ ] **Step 3: 驗證頁面樣式未變**

```bash
./_verify.sh styles t11 && ./_verify.sh sdiff final t11
```

Expected: `PASS`

（若 harness 已於 Task 10 刪除，先 `git checkout HEAD~1 -- _verify.sh _shot.html _probe.html` 取回，驗證後再刪。）

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: 刪除 137MB 未使用的本地字型資產

- src/assets/fonts/ 唯一引用來源 fonts.css 從未被載入
- 頁面實際使用的 Noto Sans TC 來自 Google Fonts CDN
- 含 Fontspring DEMO 授權字型，不得商業部署"
```

註：`.git` 物件仍保有歷史，clone 大小不變。此步驟只縮減 working tree 與部署體積。

---

## 完成後

- 分支 `refactor/typography-tokens` 共 10–11 個 commit
- 使用 superpowers:finishing-a-development-branch 決定如何整合回 `main`
