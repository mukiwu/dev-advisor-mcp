/**
 * API 推薦知識庫
 * 包含常見需求到現代 Web API 的映射，以及 Can I Use feature ID
 */

/**
 * 推薦的 API 資訊
 */
export interface RecommendedApi {
  name: string;
  description: string;
  caniuseId: string;  // Can I Use 的 feature ID
  category: string;
  useCases: string[];
  codeExample: string;
  replacesLibraries?: string[];  // 可取代的舊函式庫
  relatedApis?: string[];  // 相關的 API
  performanceLevel: 'low' | 'medium' | 'high';  // 適合的效能需求
}

/**
 * 需求關鍵字到 API 的映射
 */
export interface KeywordMapping {
  keywords: string[];
  apis: string[];  // API 名稱列表
}

/**
 * API 推薦知識庫
 */
export class ApiRecommendationKnowledge {
  private apis: Map<string, RecommendedApi> = new Map();
  private keywordMappings: KeywordMapping[] = [];

  constructor() {
    this.initializeApis();
    this.initializeKeywordMappings();
  }

  /**
   * 初始化 API 資料
   */
  private initializeApis() {
    const apiList: RecommendedApi[] = [
      // HTTP 請求相關
      {
        name: 'Fetch API',
        description: '現代的 HTTP 請求 API，基於 Promise，支援 streaming',
        caniuseId: 'fetch',
        category: 'HTTP',
        useCases: ['AJAX 請求', 'API 呼叫', '檔案上傳', '資料獲取'],
        codeExample: `const response = await fetch('/api/data');
const data = await response.json();`,
        replacesLibraries: ['jquery', 'axios', 'request', 'superagent', 'node-fetch'],
        relatedApis: ['AbortController', 'Headers', 'Request', 'Response'],
        performanceLevel: 'high'
      },
      {
        name: 'AbortController',
        description: '用於取消 fetch 請求和其他非同步操作',
        caniuseId: 'abortcontroller',
        category: 'HTTP',
        useCases: ['取消請求', '超時處理', '清理操作'],
        codeExample: `const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort(); // 取消請求`,
        performanceLevel: 'medium'
      },

      // DOM 操作相關
      {
        name: 'querySelector/querySelectorAll',
        description: '使用 CSS 選擇器查詢 DOM 元素',
        caniuseId: 'queryselector',
        category: 'DOM',
        useCases: ['DOM 查詢', '元素選取', '事件綁定目標'],
        codeExample: `const el = document.querySelector('.my-class');
const list = document.querySelectorAll('li');`,
        replacesLibraries: ['jquery'],
        performanceLevel: 'high'
      },
      {
        name: 'classList API',
        description: '操作元素的 CSS class',
        caniuseId: 'classlist',
        category: 'DOM',
        useCases: ['添加/移除 class', '切換 class', '檢查 class'],
        codeExample: `element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('expanded');`,
        replacesLibraries: ['jquery'],
        performanceLevel: 'high'
      },
      {
        name: 'MutationObserver',
        description: '監聽 DOM 變化',
        caniuseId: 'mutationobserver',
        category: 'DOM',
        useCases: ['DOM 變化監聽', '動態內容偵測', '第三方腳本監控'],
        codeExample: `const observer = new MutationObserver(mutations => {
  mutations.forEach(m => console.log(m));
});
observer.observe(element, { childList: true, subtree: true });`,
        performanceLevel: 'medium'
      },

      // 視覺觀察相關
      {
        name: 'IntersectionObserver',
        description: '監聽元素進入/離開視窗',
        caniuseId: 'intersectionobserver',
        category: 'Observer',
        useCases: ['懶加載圖片', '無限滾動', '廣告曝光追蹤', '動畫觸發'],
        codeExample: `const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素進入視窗
    }
  });
});
observer.observe(element);`,
        replacesLibraries: ['waypoints', 'scrollmagic'],
        performanceLevel: 'high'
      },
      {
        name: 'ResizeObserver',
        description: '監聽元素大小變化',
        caniuseId: 'resizeobserver',
        category: 'Observer',
        useCases: ['響應式元件', '容器查詢', '圖表自適應'],
        codeExample: `const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    console.log(entry.contentRect.width);
  });
});
observer.observe(element);`,
        performanceLevel: 'medium'
      },

      // 儲存相關
      {
        name: 'localStorage',
        description: '永久本地儲存',
        caniuseId: 'namevalue-storage',
        category: 'Storage',
        useCases: ['使用者偏好', '快取資料', '離線支援'],
        codeExample: `localStorage.setItem('key', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('key'));`,
        replacesLibraries: ['js-cookie', 'store.js'],
        performanceLevel: 'high'
      },
      {
        name: 'sessionStorage',
        description: '會話本地儲存',
        caniuseId: 'namevalue-storage',
        category: 'Storage',
        useCases: ['暫存表單資料', '會話狀態', '頁面間傳遞資料'],
        codeExample: `sessionStorage.setItem('key', value);
const value = sessionStorage.getItem('key');`,
        performanceLevel: 'high'
      },
      {
        name: 'IndexedDB',
        description: '瀏覽器內建的 NoSQL 資料庫',
        caniuseId: 'indexeddb',
        category: 'Storage',
        useCases: ['大量資料儲存', '離線應用', '快取 API 回應'],
        codeExample: `const request = indexedDB.open('myDB', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  // 使用資料庫
};`,
        performanceLevel: 'high'
      },

      // 媒體相關
      {
        name: 'getUserMedia',
        description: '存取攝影機和麥克風',
        caniuseId: 'stream',
        category: 'Media',
        useCases: ['視訊通話', '錄音', '拍照', 'AR 應用'],
        codeExample: `const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
videoElement.srcObject = stream;`,
        performanceLevel: 'high'
      },
      {
        name: 'MediaRecorder',
        description: '錄製媒體串流',
        caniuseId: 'mediarecorder',
        category: 'Media',
        useCases: ['螢幕錄製', '錄音', '視訊錄製'],
        codeExample: `const recorder = new MediaRecorder(stream);
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.start();`,
        performanceLevel: 'high'
      },
      {
        name: 'Web Audio API',
        description: '高階音訊處理',
        caniuseId: 'audio-api',
        category: 'Media',
        useCases: ['音效處理', '音樂可視化', '遊戲音效', '即時音訊'],
        codeExample: `const audioCtx = new AudioContext();
const oscillator = audioCtx.createOscillator();
oscillator.connect(audioCtx.destination);
oscillator.start();`,
        performanceLevel: 'high'
      },
      {
        name: 'Canvas API',
        description: '2D 繪圖 API',
        caniuseId: 'canvas',
        category: 'Graphics',
        useCases: ['圖片處理', '圖表繪製', '遊戲開發', '資料可視化'],
        codeExample: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillRect(10, 10, 100, 100);`,
        performanceLevel: 'high'
      },
      {
        name: 'WebGL',
        description: '3D 繪圖 API',
        caniuseId: 'webgl',
        category: 'Graphics',
        useCases: ['3D 視覺化', '遊戲開發', 'GPU 運算'],
        codeExample: `const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
// WebGL 初始化和繪製`,
        performanceLevel: 'high'
      },

      // 非同步處理
      {
        name: 'Promise',
        description: '非同步程式設計的基礎',
        caniuseId: 'promises',
        category: 'Async',
        useCases: ['非同步操作', '錯誤處理', '鏈式呼叫'],
        codeExample: `const promise = new Promise((resolve, reject) => {
  // 非同步操作
  resolve(result);
});
promise.then(data => console.log(data));`,
        replacesLibraries: ['bluebird', 'q', 'when'],
        performanceLevel: 'high'
      },
      {
        name: 'async/await',
        description: '更簡潔的非同步語法',
        caniuseId: 'async-functions',
        category: 'Async',
        useCases: ['非同步函式', '錯誤處理', '順序執行'],
        codeExample: `async function fetchData() {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}`,
        replacesLibraries: ['async', 'co'],
        performanceLevel: 'high'
      },
      {
        name: 'Web Workers',
        description: '背景執行緒處理',
        caniuseId: 'webworkers',
        category: 'Async',
        useCases: ['CPU 密集運算', '資料處理', '背景任務'],
        codeExample: `const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);`,
        performanceLevel: 'high'
      },

      // URL 和路由
      {
        name: 'URL API',
        description: 'URL 解析和建構',
        caniuseId: 'url',
        category: 'URL',
        useCases: ['URL 解析', '查詢參數處理', 'URL 建構'],
        codeExample: `const url = new URL('https://example.com/path?foo=bar');
console.log(url.searchParams.get('foo')); // 'bar'`,
        replacesLibraries: ['url-parse', 'query-string'],
        performanceLevel: 'high'
      },
      {
        name: 'URLSearchParams',
        description: '處理 URL 查詢參數',
        caniuseId: 'urlsearchparams',
        category: 'URL',
        useCases: ['解析查詢字串', '建構查詢參數', '表單序列化'],
        codeExample: `const params = new URLSearchParams('foo=bar&baz=qux');
params.get('foo'); // 'bar'
params.append('new', 'value');
params.toString(); // 'foo=bar&baz=qux&new=value'`,
        replacesLibraries: ['querystring', 'qs'],
        performanceLevel: 'high'
      },
      {
        name: 'History API',
        description: '瀏覽器歷史操作',
        caniuseId: 'history',
        category: 'URL',
        useCases: ['SPA 路由', '頁面狀態管理', '返回/前進控制'],
        codeExample: `history.pushState({ page: 1 }, '', '/page/1');
window.onpopstate = (e) => console.log(e.state);`,
        performanceLevel: 'high'
      },

      // 事件和通訊
      {
        name: 'CustomEvent',
        description: '自定義事件',
        caniuseId: 'customevent',
        category: 'Events',
        useCases: ['元件通訊', '發布/訂閱模式', '解耦模組'],
        codeExample: `const event = new CustomEvent('myEvent', { detail: { data: 123 } });
element.dispatchEvent(event);
element.addEventListener('myEvent', (e) => console.log(e.detail));`,
        replacesLibraries: ['eventemitter3', 'mitt'],
        performanceLevel: 'high'
      },
      {
        name: 'BroadcastChannel',
        description: '跨分頁/視窗通訊',
        caniuseId: 'broadcastchannel',
        category: 'Events',
        useCases: ['多分頁同步', '跨視窗通訊', '共享狀態'],
        codeExample: `const channel = new BroadcastChannel('my_channel');
channel.postMessage('Hello from another tab');
channel.onmessage = (e) => console.log(e.data);`,
        performanceLevel: 'medium'
      },
      {
        name: 'WebSocket',
        description: '雙向即時通訊',
        caniuseId: 'websockets',
        category: 'Communication',
        useCases: ['即時聊天', '即時通知', '協作編輯', '遊戲'],
        codeExample: `const ws = new WebSocket('wss://example.com/socket');
ws.onmessage = (e) => console.log(e.data);
ws.send('Hello Server');`,
        replacesLibraries: ['socket.io-client'],
        performanceLevel: 'high'
      },
      {
        name: 'Server-Sent Events',
        description: '伺服器推送事件',
        caniuseId: 'eventsource',
        category: 'Communication',
        useCases: ['即時更新', '通知推送', '股票報價'],
        codeExample: `const source = new EventSource('/events');
source.onmessage = (e) => console.log(e.data);`,
        performanceLevel: 'medium'
      },

      // 檔案處理
      {
        name: 'File API',
        description: '檔案讀取和處理',
        caniuseId: 'fileapi',
        category: 'File',
        useCases: ['檔案上傳預覽', '讀取本地檔案', '拖放上傳'],
        codeExample: `const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result);
reader.readAsText(file);`,
        performanceLevel: 'high'
      },
      {
        name: 'Blob',
        description: '二進位資料處理',
        caniuseId: 'blobbuilder',
        category: 'File',
        useCases: ['檔案下載', '資料轉換', '圖片處理'],
        codeExample: `const blob = new Blob([data], { type: 'text/plain' });
const url = URL.createObjectURL(blob);`,
        performanceLevel: 'high'
      },
      {
        name: 'Clipboard API',
        description: '剪貼簿操作',
        caniuseId: 'async-clipboard',
        category: 'File',
        useCases: ['複製文字', '貼上內容', '剪貼簿監聽'],
        codeExample: `await navigator.clipboard.writeText('Hello');
const text = await navigator.clipboard.readText();`,
        performanceLevel: 'medium'
      },

      // 地理位置
      {
        name: 'Geolocation API',
        description: '地理位置存取',
        caniuseId: 'geolocation',
        category: 'Location',
        useCases: ['定位服務', '地圖應用', '本地搜尋'],
        codeExample: `navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err)
);`,
        performanceLevel: 'medium'
      },

      // 通知
      {
        name: 'Notification API',
        description: '系統通知',
        caniuseId: 'notifications',
        category: 'Notification',
        useCases: ['推送通知', '提醒', '訊息提示'],
        codeExample: `const permission = await Notification.requestPermission();
if (permission === 'granted') {
  new Notification('Hello!', { body: 'This is a notification' });
}`,
        performanceLevel: 'low'
      },

      // 日期時間
      {
        name: 'Intl.DateTimeFormat',
        description: '國際化日期格式化',
        caniuseId: 'internationalization',
        category: 'DateTime',
        useCases: ['日期格式化', '本地化顯示', '時區轉換'],
        codeExample: `const formatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric'
});
formatter.format(new Date()); // "2024年1月15日"`,
        replacesLibraries: ['moment', 'dayjs', 'date-fns'],
        performanceLevel: 'high'
      },
      {
        name: 'Intl.RelativeTimeFormat',
        description: '相對時間格式化',
        caniuseId: 'mdn-javascript_builtins_intl_relativetimeformat',
        category: 'DateTime',
        useCases: ['相對時間顯示', '「幾分鐘前」格式'],
        codeExample: `const rtf = new Intl.RelativeTimeFormat('zh-TW');
rtf.format(-1, 'day'); // "1 天前"
rtf.format(2, 'hour'); // "2 小時後"`,
        replacesLibraries: ['moment', 'timeago.js'],
        performanceLevel: 'high'
      },

      // 數字格式化
      {
        name: 'Intl.NumberFormat',
        description: '國際化數字格式化',
        caniuseId: 'internationalization',
        category: 'Format',
        useCases: ['貨幣格式', '數字本地化', '百分比格式'],
        codeExample: `const formatter = new Intl.NumberFormat('zh-TW', {
  style: 'currency', currency: 'TWD'
});
formatter.format(1234.5); // "NT$1,234.50"`,
        replacesLibraries: ['numeral', 'accounting.js'],
        performanceLevel: 'high'
      },

      // 效能監測
      {
        name: 'Performance API',
        description: '效能測量',
        caniuseId: 'performance-now',
        category: 'Performance',
        useCases: ['效能監測', '載入時間測量', '程式碼效能分析'],
        codeExample: `performance.mark('start');
// 執行操作
performance.mark('end');
performance.measure('myOperation', 'start', 'end');
console.log(performance.getEntriesByName('myOperation'));`,
        performanceLevel: 'high'
      },

      // 加密
      {
        name: 'Web Crypto API',
        description: '加密操作',
        caniuseId: 'cryptography',
        category: 'Security',
        useCases: ['資料加密', '雜湊計算', '數位簽章', 'UUID 生成'],
        codeExample: `// 生成 UUID
const uuid = crypto.randomUUID();

// SHA-256 雜湊
const hashBuffer = await crypto.subtle.digest('SHA-256', data);`,
        replacesLibraries: ['uuid', 'crypto-js'],
        performanceLevel: 'high'
      },

      // 表單驗證
      {
        name: 'Constraint Validation API',
        description: '表單驗證',
        caniuseId: 'form-validation',
        category: 'Form',
        useCases: ['表單驗證', '自訂錯誤訊息', '即時驗證'],
        codeExample: `const input = document.querySelector('input');
input.setCustomValidity('請輸入有效的值');
if (!input.checkValidity()) {
  input.reportValidity();
}`,
        performanceLevel: 'high'
      },

      // 動畫
      {
        name: 'requestAnimationFrame',
        description: '動畫渲染',
        caniuseId: 'requestanimationframe',
        category: 'Animation',
        useCases: ['流暢動畫', '遊戲迴圈', '視覺效果'],
        codeExample: `function animate() {
  // 更新動畫
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);`,
        performanceLevel: 'high'
      },
      {
        name: 'Web Animations API',
        description: 'JavaScript 動畫控制',
        caniuseId: 'web-animation',
        category: 'Animation',
        useCases: ['複雜動畫', '動畫控制', '互動效果'],
        codeExample: `element.animate([
  { transform: 'translateX(0)' },
  { transform: 'translateX(100px)' }
], {
  duration: 1000,
  iterations: Infinity
});`,
        replacesLibraries: ['jquery', 'velocity', 'anime.js'],
        performanceLevel: 'high'
      },

      // CSS 相關
      {
        name: 'CSS Grid',
        description: '二維佈局系統',
        caniuseId: 'css-grid',
        category: 'CSS',
        useCases: ['頁面佈局', '網格系統', '響應式設計'],
        codeExample: `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
        replacesLibraries: ['bootstrap', 'foundation'],
        performanceLevel: 'high'
      },
      {
        name: 'CSS Flexbox',
        description: '一維佈局系統',
        caniuseId: 'flexbox',
        category: 'CSS',
        useCases: ['元件佈局', '對齊', '分配空間'],
        codeExample: `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
        replacesLibraries: ['bootstrap'],
        performanceLevel: 'high'
      },
      {
        name: 'CSS Custom Properties',
        description: 'CSS 變數',
        caniuseId: 'css-variables',
        category: 'CSS',
        useCases: ['主題切換', '動態樣式', '設計系統'],
        codeExample: `:root {
  --primary-color: #007bff;
}
.button {
  background: var(--primary-color);
}`,
        performanceLevel: 'high'
      }
    ];

    for (const api of apiList) {
      this.apis.set(api.name, api);
    }
  }

  /**
   * 初始化關鍵字映射
   */
  private initializeKeywordMappings() {
    this.keywordMappings = [
      // HTTP 請求
      {
        keywords: ['http', 'ajax', 'api', 'fetch', 'request', '請求', '呼叫', 'rest', 'get', 'post', 'put', 'delete'],
        apis: ['Fetch API', 'AbortController']
      },
      // DOM 操作
      {
        keywords: ['dom', 'element', '元素', 'query', 'selector', '選擇器', 'jquery', '查詢'],
        apis: ['querySelector/querySelectorAll', 'classList API', 'MutationObserver']
      },
      // 懶加載/滾動
      {
        keywords: ['lazy', 'scroll', 'infinite', '懶加載', '滾動', '無限', 'viewport', '視窗'],
        apis: ['IntersectionObserver', 'ResizeObserver']
      },
      // 儲存
      {
        keywords: ['storage', 'cache', 'store', '儲存', '快取', 'offline', '離線', 'local', 'session'],
        apis: ['localStorage', 'sessionStorage', 'IndexedDB']
      },
      // 影片/音訊/媒體
      {
        keywords: ['video', 'audio', 'media', 'camera', 'webcam', 'microphone', '影片', '音訊', '媒體', '攝影機', '麥克風', '錄製', 'record', 'stream'],
        apis: ['getUserMedia', 'MediaRecorder', 'Web Audio API', 'Canvas API']
      },
      // 圖形/圖片
      {
        keywords: ['image', 'canvas', 'draw', 'graphic', '圖片', '繪圖', '圖形', '畫布', 'chart', '圖表', '視覺化'],
        apis: ['Canvas API', 'WebGL']
      },
      // 3D
      {
        keywords: ['3d', 'webgl', 'three', 'opengl', 'gpu'],
        apis: ['WebGL']
      },
      // 非同步
      {
        keywords: ['async', 'await', 'promise', 'callback', '非同步', '回調', 'concurrent', '並發'],
        apis: ['Promise', 'async/await', 'Web Workers']
      },
      // 背景處理
      {
        keywords: ['worker', 'background', 'thread', '背景', '執行緒', 'heavy', 'cpu', 'intensive'],
        apis: ['Web Workers']
      },
      // URL/路由
      {
        keywords: ['url', 'query', 'param', 'route', 'history', '路由', '參數', 'navigation', 'spa'],
        apis: ['URL API', 'URLSearchParams', 'History API']
      },
      // 事件/通訊
      {
        keywords: ['event', 'emit', 'pubsub', 'broadcast', '事件', '通訊', 'message', 'communication'],
        apis: ['CustomEvent', 'BroadcastChannel']
      },
      // 即時通訊
      {
        keywords: ['realtime', 'websocket', 'socket', 'chat', 'live', '即時', '聊天', 'push'],
        apis: ['WebSocket', 'Server-Sent Events']
      },
      // 檔案
      {
        keywords: ['file', 'upload', 'download', 'blob', '檔案', '上傳', '下載', 'drag', 'drop'],
        apis: ['File API', 'Blob', 'Clipboard API']
      },
      // 剪貼簿
      {
        keywords: ['clipboard', 'copy', 'paste', '剪貼簿', '複製', '貼上'],
        apis: ['Clipboard API']
      },
      // 地理位置
      {
        keywords: ['geo', 'location', 'gps', 'map', '地理', '位置', '地圖', '定位'],
        apis: ['Geolocation API']
      },
      // 通知
      {
        keywords: ['notification', 'alert', 'push', '通知', '提醒', '推播'],
        apis: ['Notification API']
      },
      // 日期時間
      {
        keywords: ['date', 'time', 'moment', 'format', '日期', '時間', '格式化', 'timezone', '時區'],
        apis: ['Intl.DateTimeFormat', 'Intl.RelativeTimeFormat']
      },
      // 數字格式
      {
        keywords: ['number', 'currency', 'format', '數字', '貨幣', '格式', 'percent', '百分比'],
        apis: ['Intl.NumberFormat']
      },
      // 效能
      {
        keywords: ['performance', 'measure', 'benchmark', '效能', '測量', '監控'],
        apis: ['Performance API']
      },
      // 加密/安全
      {
        keywords: ['crypto', 'encrypt', 'hash', 'uuid', 'random', '加密', '雜湊', '隨機'],
        apis: ['Web Crypto API']
      },
      // 表單
      {
        keywords: ['form', 'validate', 'input', '表單', '驗證', '輸入'],
        apis: ['Constraint Validation API']
      },
      // 動畫
      {
        keywords: ['animation', 'animate', 'motion', '動畫', '效果', 'transition', 'game', '遊戲'],
        apis: ['requestAnimationFrame', 'Web Animations API']
      },
      // CSS 佈局
      {
        keywords: ['layout', 'grid', 'flex', 'css', '佈局', '排版', 'responsive', '響應式'],
        apis: ['CSS Grid', 'CSS Flexbox', 'CSS Custom Properties']
      },
      // 主題
      {
        keywords: ['theme', 'dark', 'light', '主題', '深色', '淺色', 'variable', '變數'],
        apis: ['CSS Custom Properties']
      }
    ];
  }

  /**
   * 根據需求描述推薦 API
   */
  recommendApis(requirement: string, performanceLevel?: 'low' | 'medium' | 'high'): RecommendedApi[] {
    const lowerReq = requirement.toLowerCase();
    const matchedApiNames = new Set<string>();

    // 根據關鍵字匹配
    for (const mapping of this.keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (lowerReq.includes(keyword.toLowerCase())) {
          for (const apiName of mapping.apis) {
            matchedApiNames.add(apiName);
          }
        }
      }
    }

    // 直接搜尋 API 名稱
    for (const [name, api] of this.apis) {
      if (lowerReq.includes(name.toLowerCase()) ||
          api.useCases.some(uc => lowerReq.includes(uc.toLowerCase())) ||
          api.description.toLowerCase().includes(lowerReq)) {
        matchedApiNames.add(name);
      }
    }

    // 取得匹配的 API 資料
    let results: RecommendedApi[] = [];
    for (const name of matchedApiNames) {
      const api = this.apis.get(name);
      if (api) {
        results.push(api);
      }
    }

    // 根據效能需求過濾
    if (performanceLevel === 'high') {
      results = results.filter(api => api.performanceLevel === 'high');
    } else if (performanceLevel === 'low') {
      // low 需求可以使用任何 API
    }

    return results;
  }

  /**
   * 取得 API 資訊
   */
  getApi(name: string): RecommendedApi | undefined {
    return this.apis.get(name);
  }

  /**
   * 取得所有 API
   */
  getAllApis(): RecommendedApi[] {
    return Array.from(this.apis.values());
  }

  /**
   * 根據 Can I Use ID 取得 API
   */
  getApiByCaniuseId(caniuseId: string): RecommendedApi | undefined {
    for (const api of this.apis.values()) {
      if (api.caniuseId === caniuseId) {
        return api;
      }
    }
    return undefined;
  }
}






