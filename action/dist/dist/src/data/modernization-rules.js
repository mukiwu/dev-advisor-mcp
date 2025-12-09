/**
 * 現代化規則資料庫
 */
export class ModernizationRules {
    libraryRules = new Map();
    apiRules = new Map();
    constructor() {
        this.initializeLibraryRules();
        this.initializeApiRules();
    }
    /**
     * 初始化函式庫規則
     */
    initializeLibraryRules() {
        const rules = [
            // jQuery 相關 - 最大的 bundle 減少機會
            ['jquery', {
                    name: 'jQuery',
                    modernAlternative: '原生 DOM API / 現代框架',
                    reason: 'jQuery (約85KB) 在現代瀏覽器中已不再必要，原生 API 已足夠強大，可大幅減少 bundle 大小',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 15, bundle: 85, maintainability: 3 },
                    difficulty: 'moderate',
                    breaking: true,
                    deprecated: false,
                    severity: 'medium',
                    migrationExample: `// 舊版
$('#element').addClass('active');
$('.items').each(function() { ... });

// 現代版
document.getElementById('element').classList.add('active');
document.querySelectorAll('.items').forEach(el => { ... });`,
                    references: ['https://youmightnotneedjquery.com/']
                }],
            // Moment.js
            ['moment', {
                    name: 'Moment.js',
                    modernAlternative: 'Date-fns / Dayjs / 原生 Temporal API',
                    reason: 'Moment.js 體積過大且不支援 tree-shaking，現代替代方案更輕量',
                    compatibility: '現代瀏覽器支援',
                    impact: { performance: 25, bundle: 65, maintainability: 4 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: true,
                    severity: 'high',
                    migrationExample: `// 舊版 (Moment.js)
moment().format('YYYY-MM-DD');

// 現代版 (Date-fns)
import { format } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');

// 未來 (Temporal)
Temporal.now.plainDateISO().toString();`,
                    references: ['https://momentjs.com/docs/#/-project-status/']
                }],
            // Lodash
            ['lodash', {
                    name: 'Lodash',
                    modernAlternative: '原生 JavaScript 方法',
                    reason: '許多 Lodash 功能現在已有原生支援，可減少依賴',
                    compatibility: 'ES2015+ 瀏覽器',
                    impact: { performance: 10, bundle: 50, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版 (Lodash)
_.map(array, fn);
_.filter(array, predicate);

// 現代版 (原生)
array.map(fn);
array.filter(predicate);`,
                    references: ['https://youmightnotneedlodash.com/']
                }],
            // Request (已棄用)
            ['request', {
                    name: 'Request',
                    modernAlternative: 'node-fetch / axios / 原生 fetch',
                    reason: 'Request 已棄用，建議使用現代 HTTP 客戶端',
                    compatibility: 'Node.js + 現代瀏覽器',
                    impact: { performance: 20, bundle: 30, maintainability: 4 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: true,
                    severity: 'high',
                    migrationExample: `// 舊版 (Request)
request.get(url, callback);

// 現代版 (fetch)
const response = await fetch(url);
const data = await response.json();`,
                    references: ['https://github.com/request/request/issues/3142']
                }],
            // Left-pad (安全性問題)
            ['left-pad', {
                    name: 'left-pad',
                    modernAlternative: 'String.prototype.padStart()',
                    reason: '原生方法已支援，無需額外依賴',
                    compatibility: 'ES2017+ 瀏覽器',
                    impact: { performance: 5, bundle: 1, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const leftPad = require('left-pad');
leftPad('hello', 10, '0');

// 現代版
'hello'.padStart(10, '0');`,
                }],
            // Core-js polyfills
            ['core-js', {
                    name: 'core-js',
                    modernAlternative: '選擇性 polyfill 或原生支援',
                    reason: '根據目標瀏覽器選擇必要的 polyfill，避免過度 polyfill',
                    compatibility: '根據 browserslist 決定',
                    impact: { performance: 30, bundle: 100, maintainability: 3 },
                    difficulty: 'moderate',
                    breaking: false,
                    deprecated: false,
                    severity: 'medium',
                    migrationExample: `// 分析：檢查 browserslist 設定
// 只載入必要的 polyfill
import 'core-js/stable/array/includes'; // 僅在需要時載入`,
                }],
            // Underscore.js (類似 Lodash)
            ['underscore', {
                    name: 'Underscore.js',
                    modernAlternative: '原生 JavaScript 方法',
                    reason: 'Underscore.js 的大部分功能現在已有原生支援',
                    compatibility: 'ES5+ 瀏覽器',
                    impact: { performance: 8, bundle: 25, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版 (Underscore)
_.each(array, fn);
_.map(array, fn);

// 現代版
array.forEach(fn);
array.map(fn);`,
                }],
            // Bluebird Promise
            ['bluebird', {
                    name: 'Bluebird',
                    modernAlternative: '原生 Promise',
                    reason: '原生 Promise 已支援大部分功能，Bluebird 在現代環境中已非必要',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 5, bundle: 45, maintainability: 2 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版 (Bluebird)
const Promise = require('bluebird');
Promise.map(items, fn);

// 現代版
Promise.all(items.map(fn));

// 或使用 for await...of
for await (const result of asyncIterator) { ... }`,
                }],
            // Async.js
            ['async', {
                    name: 'Async.js',
                    modernAlternative: 'async/await + Promise',
                    reason: 'async/await 語法提供更簡潔的非同步控制流程',
                    compatibility: 'ES2017+ 瀏覽器',
                    impact: { performance: 0, bundle: 20, maintainability: 4 },
                    difficulty: 'moderate',
                    breaking: true,
                    deprecated: false,
                    severity: 'medium',
                    migrationExample: `// 舊版 (Async.js)
async.waterfall([fn1, fn2, fn3], callback);
async.parallel([task1, task2], callback);

// 現代版
// waterfall
const result1 = await fn1();
const result2 = await fn2(result1);
const result3 = await fn3(result2);

// parallel
const [res1, res2] = await Promise.all([task1(), task2()]);`,
                }],
            // uuid
            ['uuid', {
                    name: 'uuid',
                    modernAlternative: 'crypto.randomUUID()',
                    reason: '瀏覽器和 Node.js 現已支援原生 UUID 生成',
                    compatibility: 'Chrome 92+, Firefox 95+, Safari 15.4+, Node.js 19+',
                    impact: { performance: 2, bundle: 8, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版 (uuid)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();

// 現代版
const id = crypto.randomUUID();`,
                }],
            // is-number / is-array 等小型工具
            ['is-number', {
                    name: 'is-number',
                    modernAlternative: 'typeof + Number.isFinite()',
                    reason: '原生方法已可完成相同功能',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 0, bundle: 1, maintainability: 1 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const isNumber = require('is-number');
isNumber(value);

// 現代版
typeof value === 'number' && Number.isFinite(value);`,
                }],
            ['is-array', {
                    name: 'is-array',
                    modernAlternative: 'Array.isArray()',
                    reason: '原生 Array.isArray() 方法已存在多年',
                    compatibility: '所有瀏覽器 (IE9+)',
                    impact: { performance: 0, bundle: 1, maintainability: 1 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const isArray = require('is-array');
isArray(value);

// 現代版
Array.isArray(value);`,
                }],
            // object-assign
            ['object-assign', {
                    name: 'object-assign',
                    modernAlternative: 'Object.assign() 或展開運算子',
                    reason: '原生 Object.assign() 和展開運算子已廣泛支援',
                    compatibility: 'ES2015+ 瀏覽器',
                    impact: { performance: 0, bundle: 2, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const assign = require('object-assign');
assign({}, obj1, obj2);

// 現代版
Object.assign({}, obj1, obj2);
// 或
{ ...obj1, ...obj2 };`,
                }],
            // array-flatten
            ['array-flatten', {
                    name: 'array-flatten',
                    modernAlternative: 'Array.prototype.flat()',
                    reason: '原生 flat() 方法已廣泛支援',
                    compatibility: 'ES2019+ 瀏覽器',
                    impact: { performance: 0, bundle: 2, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const flatten = require('array-flatten');
flatten([1, [2, [3]]]);

// 現代版
[1, [2, [3]]].flat(Infinity);  // 完全展平
[1, [2, [3]]].flat(1);         // 展平一層`,
                }],
            // classnames / clsx
            ['classnames', {
                    name: 'classnames',
                    modernAlternative: '模板字串或原生陣列方法',
                    reason: '簡單場景可用模板字串處理，但 classnames 在複雜場景仍很有用',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 2, maintainability: 1 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
import classNames from 'classnames';
classNames('foo', { bar: true, baz: false });

// 現代版 (簡單場景)
const classes = ['foo', isBar && 'bar', isBaz && 'baz'].filter(Boolean).join(' ');

// 或使用模板字串
\`foo \${isBar ? 'bar' : ''} \${isBaz ? 'baz' : ''}\`.trim();`,
                }],
            // querystring
            ['querystring', {
                    name: 'querystring',
                    modernAlternative: 'URLSearchParams',
                    reason: 'URLSearchParams 是瀏覽器原生 API，Node.js 也支援',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 2, bundle: 5, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: true,
                    severity: 'medium',
                    migrationExample: `// 舊版 (querystring)
const qs = require('querystring');
qs.parse('foo=bar&baz=qux');
qs.stringify({ foo: 'bar' });

// 現代版
const params = new URLSearchParams('foo=bar&baz=qux');
params.get('foo'); // 'bar'

const search = new URLSearchParams({ foo: 'bar' });
search.toString(); // 'foo=bar'`,
                }],
            // node-fetch (在 Node.js 18+)
            ['node-fetch', {
                    name: 'node-fetch',
                    modernAlternative: '原生 fetch (Node.js 18+)',
                    reason: 'Node.js 18+ 已內建 fetch API',
                    compatibility: 'Node.js 18+',
                    impact: { performance: 5, bundle: 15, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    severity: 'low',
                    migrationExample: `// 舊版
const fetch = require('node-fetch');
const response = await fetch(url);

// 現代版 (Node.js 18+)
// 直接使用，無需 import
const response = await fetch(url);`,
                    references: ['https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch']
                }]
        ];
        for (const [key, rule] of rules) {
            this.libraryRules.set(key, rule);
        }
    }
    /**
     * 初始化 API 規則
     */
    initializeApiRules() {
        const rules = [
            // XMLHttpRequest → fetch
            ['XMLHttpRequest', {
                    name: 'XMLHttpRequest',
                    modernAlternative: 'fetch API',
                    reason: 'fetch API 提供更現代、Promise 化的 HTTP 介面',
                    compatibility: '現代瀏覽器 (IE 需要 polyfill)',
                    impact: { performance: 10, bundle: 0, maintainability: 4 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: false,
                    migrationExample: `// 舊版
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    callback(JSON.parse(xhr.responseText));
  }
};
xhr.send();

// 現代版
const response = await fetch('/api/data');
const data = await response.json();`,
                }],
            // setTimeout callback → Promise
            ['setTimeout', {
                    name: 'setTimeout (callback pattern)',
                    modernAlternative: 'Promise-based timer',
                    reason: '避免回調地獄，提供更好的錯誤處理',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版 (回調模式)
function delay(ms, callback) {
  setTimeout(callback, ms);
}

// 現代版 (Promise)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
await delay(1000);`,
                }],
            // document.getElementById → querySelector
            ['document.getElementById', {
                    name: 'document.getElementById',
                    modernAlternative: 'document.querySelector',
                    reason: 'querySelector 提供更一致的 API 和更強大的選擇能力',
                    compatibility: '所有現代瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
const element = document.getElementById('myId');

// 現代版 (可選)
const element = document.querySelector('#myId');`,
                }],
            // addEventListener → modern event handling
            ['attachEvent', {
                    name: 'attachEvent',
                    modernAlternative: 'addEventListener',
                    reason: 'attachEvent 是 IE 特有的過時 API',
                    compatibility: 'IE 已不再支援',
                    impact: { performance: 0, bundle: -2, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: true,
                    severity: 'high',
                    migrationExample: `// 舊版 (IE only)
element.attachEvent('onclick', handler);

// 現代版
element.addEventListener('click', handler);`,
                }],
            // var → let/const
            ['var', {
                    name: 'var declarations',
                    modernAlternative: 'let/const',
                    reason: 'let/const 提供更好的作用域控制，避免 hoisting 問題',
                    compatibility: 'ES2015+ 瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 3 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
var name = 'John';
var age = 30;

// 現代版
const name = 'John';  // 不會改變
let age = 30;         // 可能改變`,
                }],
            // for loop → array methods
            ['for', {
                    name: 'traditional for loops',
                    modernAlternative: 'Array methods (map, filter, forEach)',
                    reason: '陣列方法更具表達性，減少錯誤機會',
                    compatibility: 'ES5+ 瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 4 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
const result = [];
for (let i = 0; i < items.length; i++) {
  if (items[i].active) {
    result.push(items[i].name);
  }
}

// 現代版
const result = items
  .filter(item => item.active)
  .map(item => item.name);`,
                }],
            // document.write - 危險的 API
            ['document.write', {
                    name: 'document.write',
                    modernAlternative: 'DOM API (innerHTML, appendChild)',
                    reason: 'document.write 會覆蓋整個頁面，在異步情況下特別危險',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 10, bundle: 0, maintainability: 5 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: true,
                    severity: 'high',
                    migrationExample: `// 舊版 (危險)
document.write('<h1>Hello</h1>');

// 現代版
document.body.innerHTML = '<h1>Hello</h1>';
// 或
const h1 = document.createElement('h1');
h1.textContent = 'Hello';
document.body.appendChild(h1);`,
                }],
            // eval - 安全風險
            ['eval', {
                    name: 'eval',
                    modernAlternative: 'Function 構造函數或其他安全替代方案',
                    reason: 'eval 有嚴重的安全風險 (XSS)，且影響效能優化',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 20, bundle: 0, maintainability: 5 },
                    difficulty: 'moderate',
                    breaking: true,
                    deprecated: false,
                    severity: 'high',
                    migrationExample: `// 舊版 (危險)
const result = eval('2 + 2');
const fn = eval('(function() { return x + y; })');

// 現代版
// 對於數學計算，直接使用 JavaScript
const result = 2 + 2;

// 對於動態函式，使用 Function 構造函數 (仍需謹慎)
const fn = new Function('x', 'y', 'return x + y');

// 對於 JSON，使用 JSON.parse
const data = JSON.parse(jsonString);`,
                }],
            // with - 已棄用
            ['with', {
                    name: 'with statement',
                    modernAlternative: '解構賦值或直接存取',
                    reason: 'with 語句在 strict mode 中被禁止，且會造成作用域混淆',
                    compatibility: '所有瀏覽器 (但 strict mode 禁止)',
                    impact: { performance: 5, bundle: 0, maintainability: 4 },
                    difficulty: 'simple',
                    breaking: true,
                    deprecated: true,
                    severity: 'high',
                    migrationExample: `// 舊版 (已棄用)
with (obj) {
  console.log(a, b, c);
}

// 現代版 - 解構賦值
const { a, b, c } = obj;
console.log(a, b, c);`,
                }],
            // arguments - 建議使用 rest parameters
            ['arguments', {
                    name: 'arguments object',
                    modernAlternative: 'Rest parameters (...args)',
                    reason: 'Rest parameters 是真正的陣列，語法更清晰',
                    compatibility: 'ES2015+ 瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// 現代版
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}`,
                }],
            // innerHTML 安全警告
            ['innerHTML', {
                    name: 'innerHTML',
                    modernAlternative: 'textContent 或 DOM API',
                    reason: '使用 innerHTML 插入使用者輸入可能導致 XSS 攻擊',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 2 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    severity: 'medium',
                    migrationExample: `// 舊版 (有 XSS 風險)
element.innerHTML = userInput;

// 現代版 - 純文字
element.textContent = userInput;

// 現代版 - 需要 HTML 時使用 DOM API
const p = document.createElement('p');
p.textContent = userInput;
element.appendChild(p);

// 或使用 DOMPurify 清理 HTML
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(htmlContent);`,
                }],
            // new Array() → []
            ['new Array', {
                    name: 'new Array()',
                    modernAlternative: '陣列字面量 []',
                    reason: '陣列字面量更簡潔，且避免 new Array(n) 的歧義',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 1 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
const arr = new Array(1, 2, 3);
const empty = new Array();

// 現代版
const arr = [1, 2, 3];
const empty = [];

// 注意：new Array(5) 會建立長度為 5 的稀疏陣列
// 如需建立填充陣列，使用：
const filled = Array.from({ length: 5 }, (_, i) => i);`,
                }],
            // new Object() → {}
            ['new Object', {
                    name: 'new Object()',
                    modernAlternative: '物件字面量 {}',
                    reason: '物件字面量更簡潔明瞭',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 1 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: false,
                    migrationExample: `// 舊版
const obj = new Object();
obj.name = 'John';

// 現代版
const obj = { name: 'John' };`,
                }],
            // String.prototype.substr → substring/slice
            ['substr', {
                    name: 'String.prototype.substr()',
                    modernAlternative: 'substring() 或 slice()',
                    reason: 'substr() 已被標記為遺留功能，建議使用 substring() 或 slice()',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false,
                    deprecated: true,
                    severity: 'low',
                    migrationExample: `// 舊版 (遺留)
str.substr(start, length);

// 現代版
str.substring(start, start + length);
// 或
str.slice(start, start + length);`,
                }],
            // Date 建構函數字串解析
            ['Date.parse', {
                    name: 'Date 字串解析',
                    modernAlternative: '明確的日期解析或使用 Temporal API',
                    reason: 'Date 字串解析在不同瀏覽器中行為不一致',
                    compatibility: '所有瀏覽器',
                    impact: { performance: 0, bundle: 0, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false,
                    deprecated: false,
                    severity: 'medium',
                    migrationExample: `// 舊版 (行為不一致)
new Date('2024-01-15');
Date.parse('Jan 15, 2024');

// 現代版 - 明確指定
new Date(2024, 0, 15); // 月份從 0 開始

// 或使用 ISO 8601 格式 (最可靠)
new Date('2024-01-15T00:00:00.000Z');

// 未來：使用 Temporal API
// Temporal.PlainDate.from('2024-01-15');`,
                }]
        ];
        for (const [key, rule] of rules) {
            this.apiRules.set(key, rule);
        }
    }
    /**
     * 取得函式庫規則
     */
    getLibraryRule(libraryName) {
        return this.libraryRules.get(libraryName);
    }
    /**
     * 取得 API 規則
     */
    getApiRule(apiName) {
        return this.apiRules.get(apiName);
    }
    /**
     * 取得所有函式庫規則
     */
    getAllLibraryRules() {
        return new Map(this.libraryRules);
    }
    /**
     * 取得所有 API 規則
     */
    getAllApiRules() {
        return new Map(this.apiRules);
    }
    /**
     * 搜尋相關規則
     */
    searchRules(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        // 搜尋函式庫規則
        for (const [key, rule] of this.libraryRules) {
            if (key.toLowerCase().includes(lowerQuery) ||
                rule.name.toLowerCase().includes(lowerQuery) ||
                rule.modernAlternative.toLowerCase().includes(lowerQuery)) {
                results.push(rule);
            }
        }
        // 搜尋 API 規則
        for (const [key, rule] of this.apiRules) {
            if (key.toLowerCase().includes(lowerQuery) ||
                rule.name.toLowerCase().includes(lowerQuery) ||
                rule.modernAlternative.toLowerCase().includes(lowerQuery)) {
                results.push(rule);
            }
        }
        return results;
    }
    /**
     * 新增自定義規則
     */
    addLibraryRule(name, rule) {
        this.libraryRules.set(name, rule);
    }
    /**
     * 新增 API 規則
     */
    addApiRule(name, rule) {
        this.apiRules.set(name, rule);
    }
    /**
     * 取得統計資訊
     */
    getStatistics() {
        const libraryCount = this.libraryRules.size;
        const apiCount = this.apiRules.size;
        let deprecatedCount = 0;
        let highImpactCount = 0;
        for (const rule of [...this.libraryRules.values(), ...this.apiRules.values()]) {
            if (rule.deprecated)
                deprecatedCount++;
            if (rule.impact.performance > 20 || rule.impact.bundle > 50)
                highImpactCount++;
        }
        return {
            totalRules: libraryCount + apiCount,
            libraryRules: libraryCount,
            apiRules: apiCount,
            deprecatedRules: deprecatedCount,
            highImpactRules: highImpactCount
        };
    }
}
//# sourceMappingURL=modernization-rules.js.map