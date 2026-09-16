# 🎓 AIoT-DA 課程實作（第一堂課）｜ 許嘉修的個人專屬時間與生活主頁 (Personal Page)

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=flat-square)
![Author](https://img.shields.io/badge/Author-%E8%A8%B1%E5%98%89%E4%BF%AE-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Tech_Stack-HTML5_%7C_CSS3_%7C_JavaScript-blue?style=flat-square)
![Course](https://img.shields.io/badge/Course-AIoT--DA_Class_1-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

> 👤 **專題作者**：**許嘉修 (Chia-Hsiu Hsu)**  
> 📚 **所屬課程**：**AIoT-DA（人工智慧物聯網與資料分析）— 第一堂課 (Class 1)** 實作成果。  
> 🎯 **專題定位**：打造兼具**極簡科技毛玻璃美學 (Glassmorphism)**、**實時時間監測 (Live Time Now)** 與 **個人高效生活/學習管理** 的專屬個人主頁 (Personal Page)。

---

## 🌐 線上展示 (Live Demo)

- 🔗 **線上即時預覽網址 (GitHub Pages)**:  
  **`https://<你的GitHub帳號>.github.io/personal-time-web/`**  
  *(將 `<你的GitHub帳號>` 替換為您的 GitHub Username，推送後開啟 GitHub Pages 即可立即線上存取)*

- ⚡ **本地免伺服器即時開啟**:  
  直接於 Windows 檔案總管進入專案目錄，雙擊 **[`index.html`](index.html)** 即可在任何瀏覽器中秒開體驗完整功能（支援離線使用）。

---

## 🎯 課堂核心目標與學習成果 (Class 1 Summary)

第一堂課著重於**純前端無依賴（Vanilla Web）架構設計**與**個人化互動頁面開發**：
1. **現代響應式前端基礎**：運用語意化 HTML5 結構搭配純 Vanilla CSS，不依賴龐大框架，實現輕量、秒開、高效能的個人主頁。
2. **極致視覺美學實踐**：實作 Dark/Light 深淺色動態主題切換、深色極光背景光暈、毛玻璃（`backdrop-filter: blur`）與精準字型排版。
3. **高精度時間與動畫事件驅動**：利用 JavaScript 的 `requestAnimationFrame` 與日期物件，打造毫秒級高精確度即時時鐘與平滑掃秒類比機械鐘。
4. **無伺服器本機數據持久化**：使用瀏覽器 `localStorage` API，將個人化設定、計時日誌與每日行程永久保存在使用者本機端。

---

## 🌟 個人主頁專屬功能 (Personal Page Highlights)

本專案精簡聚焦於**個人專屬主頁 (Personal Page)** 核心體驗，移除冗餘雜項，全心專注於個人學習與時間管理：

### 1. 個人身分與動態問候 (Personal Identity & Profile)
- **個人暱稱與自訂頭像**：支援自訂個人暱稱、頭像色彩漸層與個人專屬座右銘（例如：「*專注當下，日拱一卒*」）。
- **實時環境感知問候語**：依據早晨 (🌅)、上午 (☀️)、中午 (🍱)、下午 (☕)、傍晚 (🌆) 及深夜 (🌙) 自動切換專屬問候，營造溫暖親切的個人空間氛圍。

### 2. 現在時間核心專區 (Hero: Live Time Now)
- **超巨幅數位即時時鐘**：大字體動態呈現時、分、秒，精準顯示目前所在時間。
- **動態毫秒計時器 (`.00` ~ `.99`)**：即時跳動毫秒顯示，感受時間流動的節奏（支援一鍵開關）。
- **奢華機械質感類比鐘 (Analog Clock)**：SVG 錶盤搭配平滑旋轉的時針、分針與動態掃秒紅指針。
- **完整曆法與進度資訊**：完整顯示年月日、星期幾、**年度第幾週**與**年度第幾天**，並提供**今日 24 小時時間已流逝百分比進度條**。
- **快捷工具列**：
  - 📋 **複製時間**：一鍵複製格式化時間戳至剪貼簿。
  - ⛶ **全螢幕模式**：一鍵切換純淨全螢幕時鐘，適合專注學習或桌面展示。
  - ⏱️ **12H / 24H 制切換**：隨心切換 24 小時制或 12 小時 (AM/PM) 顯示。
  - 📍 **全球主要時區切換**：台北、東京、倫敦、紐約、雪梨等世界城市時間無延遲對照。

### 3. 個人學習專注管理 (Personal Focus & Pomodoro)
- **番茄鐘工作法 (Pomodoro Technique)**：
  - 25 分鐘專注模式 (Focus)
  - 5 分鐘短暫放鬆 (Short Break)
  - 15 分鐘充分休息 (Long Break)
- **動態環狀進度光條**：SVG 圓環隨倒數平滑收縮，外帶流光效果。
- **Web Audio API 柔和鈴聲**：專注或休息結束時播放純合成音階提示（可隨時靜音）。
- **今日專注輪次統計**：累計今日完成的番茄鐘次數。

### 4. 個人活動與時間投入日誌 (Time Tracker & Analytics)
- **即時碼錶打卡**：隨時輸入手邊正在進行的事務（例如：*AIoT 程式開發*、*數據整理*）。
- **分類標籤選取**：💻 工作、📚 學習、⚡ 程式、📖 閱讀、☕ 休閒。
- **今日投入時間視覺化分析**：動態長條圖即時統計各分類今日投入的分鐘數與佔比。
- **歷史記錄列表**：條列最近打卡項目，支援單筆刪除與數據清空。

### 5. 個人今日日程時間軸 (Daily Timeline & Task Planner)
- **24小時時間軸視覺化光帶**：以彩色色塊呈現今日全天各時段的行程分配，並附帶一條紅色指針標註**「目前當下所在時刻」**。
- **日程新增與規劃**：自訂開始時間、結束時間、行程內容與分類標籤。
- **任務勾選清單**：完成事項即時勾選劃掉，並動態統計今日任務完成率。

---

## 📂 專案檔案架構

```text
personal-web-time/
├── index.html      # 主網頁結構（語意化 HTML5、無障礙標籤、Hero 時鐘區與各功能卡片）
├── style.css       # 樣式設計系統（毛玻璃 Glassmorphism、CSS 自訂變數、響應式排版）
├── app.js          # 核心前端邏輯（實時時鐘迴圈、類比時針旋轉、番茄鐘、LocalStorage 資料管理）
├── README.md       # 專案介紹與課程實作總結（含 Live Demo 連結）
└── .gitignore      # Git 版本控制忽略檔清單
```

---

## 🛠️ 技術特點

| 模組 | 使用技術 | 特色說明 |
| :--- | :--- | :--- |
| **結構與排版** | HTML5 / CSS Grid & Flexbox | 支援手機、平板與寬螢幕電腦自適應響應式佈局 |
| **主題設計** | CSS Custom Properties (Variables) | 一鍵切換 Dark 深色極光科技感 / Light 淺色極簡風 |
| **時鐘與指針** | `requestAnimationFrame` + SVG | 高更新頻率實現絲滑指針旋轉與實時毫秒跳動 |
| **提示音效** | Web Audio API | 原生音訊合成技術，無須外部音檔，體積輕巧零延遲 |
| **數據持久化** | Browser `localStorage` | 所有個人化設定、打卡紀錄、日程皆永久保留於本機 |

---

## 🚀 如何發佈至 GitHub Pages

1. 在 GitHub 建立一個名為 `personal-time-web` 的新公開儲存庫。
2. 將本資料夾中之所有檔案上傳或推送至儲存庫的 `main` 分支。
3. 進入儲存庫頁面 ➔ 點選 **Settings** ➔ 左側選單 **Pages**。
4. 在 **Build and deployment** 下將 Branch 設定為 `main`、資料夾維持 `/(root)` ➔ 點選 **Save**。
5. 等待 1~2 分鐘，即可透過 Live Demo 網址 `https://<你的GitHub帳號>.github.io/personal-time-web/` 瀏覽您的專屬個人主頁！

---

*AIoT-DA 課程 — Class 1 課堂個人專屬網頁實作完成* ✨
