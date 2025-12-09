export const id = 361;
export const ids = [361];
export const modules = {

/***/ 64973:
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 64973;
module.exports = webpackEmptyContext;

/***/ }),

/***/ 5805:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  runAllAnalyses: () => (/* binding */ runAllAnalyses)
});

// UNUSED EXPORTS: runCompatibilityAnalysis, runModernizationAnalysis

;// CONCATENATED MODULE: ./dist/src/data/modernization-rules.js
/**
 * 現代化規則資料庫
 */
class ModernizationRules {
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
;// CONCATENATED MODULE: ./dist/src/analyzers/modernization.js

/**
 * 程式碼現代化分析器
 * 掃描程式碼找出可現代化的部分，提供升級建議
 */
class ModernizationAnalyzer {
    parser;
    rules;
    constructor(parser) {
        this.parser = parser;
        this.rules = new ModernizationRules();
    }
    /**
     * 分析專案的現代化機會
     */
    async analyze(projectPath, includePatterns, excludePatterns) {
        // 解析專案檔案
        const parsedFiles = await this.parser.parseProject(projectPath, includePatterns, excludePatterns);
        // 分析每個檔案
        const fileAnalysis = [];
        const allSuggestions = [];
        for (const file of parsedFiles) {
            const result = this.analyzeFile(file);
            fileAnalysis.push(result);
            allSuggestions.push(...result.suggestions);
        }
        // 彙總分析結果
        const summary = this.generateSummary(fileAnalysis, allSuggestions);
        const riskAssessment = this.assessRisk(allSuggestions);
        return {
            summary,
            suggestions: allSuggestions,
            fileAnalysis,
            riskAssessment
        };
    }
    /**
     * 分析單一檔案
     */
    analyzeFile(file) {
        const suggestions = [];
        const legacyPatterns = [];
        const modernizableApis = [];
        // 分析 imports - 檢查過時的函式庫
        this.analyzeImports(file.imports, suggestions, legacyPatterns);
        // 分析 API 呼叫 - 檢查可現代化的 API
        this.analyzeApiCalls(file.apiCalls, suggestions, modernizableApis);
        // 分析 AST 模式 - 檢查程式碼模式
        this.analyzeCodePatterns(file.ast, suggestions, legacyPatterns);
        return {
            filePath: file.filePath,
            suggestions,
            legacyPatterns,
            modernizableApis
        };
    }
    /**
     * 分析 import 語句
     */
    analyzeImports(imports, suggestions, legacyPatterns) {
        for (const imp of imports) {
            const rule = this.rules.getLibraryRule(imp.source);
            if (rule) {
                suggestions.push({
                    id: `modernize-${imp.source}`,
                    type: 'library-replacement',
                    title: `升級 ${imp.source} 到 ${rule.modernAlternative}`,
                    description: rule.reason,
                    currentCode: `import ... from '${imp.source}';`,
                    modernCode: rule.migrationExample,
                    location: imp.loc,
                    impact: rule.impact,
                    difficulty: rule.difficulty,
                    breaking: rule.breaking
                });
                if (rule.deprecated) {
                    legacyPatterns.push({
                        type: 'outdated-library',
                        pattern: imp.source,
                        description: `${imp.source} 已過時，建議使用 ${rule.modernAlternative}`,
                        location: imp.loc || { line: 0, column: 0 },
                        severity: rule.severity || 'medium'
                    });
                }
            }
        }
    }
    /**
     * 分析 API 呼叫
     */
    analyzeApiCalls(apiCalls, suggestions, modernizableApis) {
        for (const call of apiCalls) {
            const apiName = call.method ? `${call.api}.${call.method}` : call.api;
            const rule = this.rules.getApiRule(apiName);
            if (rule) {
                suggestions.push({
                    id: `api-${apiName}`,
                    type: 'api-modernization',
                    title: `使用現代 ${rule.modernAlternative} 替代 ${apiName}`,
                    description: rule.reason,
                    currentCode: this.generateApiCallCode(call),
                    modernCode: rule.migrationExample,
                    location: call.loc,
                    impact: rule.impact,
                    difficulty: rule.difficulty,
                    breaking: rule.breaking
                });
                modernizableApis.push({
                    currentApi: apiName,
                    modernApi: rule.modernAlternative,
                    reason: rule.reason,
                    compatibility: rule.compatibility || '現代瀏覽器',
                    migrationComplexity: rule.difficulty,
                    location: call.loc || { line: 0, column: 0 }
                });
            }
        }
    }
    /**
     * 分析程式碼模式
     */
    analyzeCodePatterns(ast, suggestions, legacyPatterns) {
        // 檢查常見的過時模式
        this.findCallbackPatterns(ast, suggestions);
        this.findVarDeclarations(ast, suggestions, legacyPatterns);
        this.findIIFEPatterns(ast, suggestions);
        this.findForLoopPatterns(ast, suggestions);
    }
    /**
     * 檢查回調函式模式，建議使用 Promise/async-await
     */
    findCallbackPatterns(ast, suggestions) {
        this.traverseAST(ast, (node) => {
            if (node.type === 'CallExpression' && node.arguments?.length > 0) {
                const lastArg = node.arguments[node.arguments.length - 1];
                // 檢測函式作為最後一個參數的回調模式
                if (lastArg?.type === 'FunctionExpression' && !lastArg.async) {
                    const params = lastArg.params || [];
                    // 檢查是否是 error-first callback 模式 (err, result)
                    const isErrorFirstCallback = params.length >= 2 &&
                        params[0]?.name?.toLowerCase().match(/^(err|error|e)$/);
                    // 檢查是否是常見的異步 API 回調
                    const calleeName = this.getCalleeName(node.callee);
                    const asyncPatterns = [
                        'readFile', 'writeFile', 'readdir', 'stat', 'mkdir', 'unlink',
                        'request', 'get', 'post', 'put', 'delete',
                        'query', 'execute', 'find', 'save',
                        'setTimeout', 'setInterval'
                    ];
                    const isAsyncPattern = asyncPatterns.some(p => calleeName.toLowerCase().includes(p.toLowerCase()));
                    if (isErrorFirstCallback || isAsyncPattern) {
                        const funcName = this.getCalleeName(node.callee);
                        suggestions.push({
                            id: `callback-to-promise-${node.loc?.start?.line || 0}`,
                            type: 'pattern-modernization',
                            title: '將回調函式轉換為 Promise/async-await',
                            description: isErrorFirstCallback
                                ? '偵測到 error-first callback 模式，建議使用 Promise 包裝或使用原生 Promise API'
                                : `偵測到 ${funcName} 使用回調模式，建議使用 Promise 版本的 API`,
                            currentCode: `${funcName}(..., function(${params.map((p) => p.name || 'arg').join(', ')}) {\n  // callback logic\n});`,
                            modernCode: isErrorFirstCallback
                                ? `// 使用 Promise 包裝\nconst result = await new Promise((resolve, reject) => {\n  ${funcName}(..., (err, result) => {\n    if (err) reject(err);\n    else resolve(result);\n  });\n});\n\n// 或使用 util.promisify (Node.js)\nimport { promisify } from 'util';\nconst ${funcName}Async = promisify(${funcName});\nconst result = await ${funcName}Async(...);`
                                : `// 使用 async/await\nconst result = await ${funcName}Async(...);\n\n// 或使用 Promise\n${funcName}(...).then(result => {\n  // handle result\n}).catch(err => {\n  // handle error\n});`,
                            location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined,
                            impact: { performance: 0, bundle: 0, maintainability: 4 },
                            difficulty: 'moderate',
                            breaking: true
                        });
                    }
                }
            }
        });
    }
    /**
     * 取得呼叫者名稱
     */
    getCalleeName(callee) {
        if (!callee)
            return 'unknown';
        if (callee.type === 'Identifier') {
            return callee.name || 'unknown';
        }
        if (callee.type === 'MemberExpression') {
            const obj = this.getCalleeName(callee.object);
            const prop = callee.property?.name || callee.property?.value || 'unknown';
            return `${obj}.${prop}`;
        }
        return 'unknown';
    }
    /**
     * 檢查 var 宣告，建議使用 let/const
     */
    findVarDeclarations(ast, suggestions, legacyPatterns) {
        this.traverseAST(ast, (node) => {
            if (node.type === 'VariableDeclaration' && node.kind === 'var') {
                const suggestion = node.declarations?.some((d) => d.init && (d.init.type === 'FunctionExpression' || d.init.type === 'ArrowFunctionExpression')) ? 'const' : 'let';
                suggestions.push({
                    id: `var-to-${suggestion}`,
                    type: 'syntax-modernization',
                    title: `將 var 改為 ${suggestion}`,
                    description: `使用 ${suggestion} 可提供更好的作用域控制和意圖表達`,
                    currentCode: `var ${node.declarations?.[0]?.id?.name || 'variable'} = ...`,
                    modernCode: `${suggestion} ${node.declarations?.[0]?.id?.name || 'variable'} = ...`,
                    location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined,
                    impact: { performance: 0, bundle: 0, maintainability: 2 },
                    difficulty: 'trivial',
                    breaking: false
                });
                legacyPatterns.push({
                    type: 'inefficient-pattern',
                    pattern: 'var declaration',
                    description: '使用 var 宣告變數，建議改用 let 或 const',
                    location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : { line: 0, column: 0 },
                    severity: 'low'
                });
            }
        });
    }
    /**
     * 檢查 IIFE 模式，建議使用模組
     */
    findIIFEPatterns(ast, suggestions) {
        this.traverseAST(ast, (node) => {
            // 檢測 IIFE: (function() { ... })() 或 (() => { ... })()
            if (node.type === 'CallExpression') {
                const callee = node.callee;
                // 檢查是否是 IIFE 模式
                const isIIFE = (
                // (function() {})()
                (callee.type === 'FunctionExpression') ||
                    // (() => {})()
                    (callee.type === 'ArrowFunctionExpression') ||
                    // (function() {})() 被括號包裹
                    (callee.type === 'SequenceExpression' &&
                        callee.expressions?.some((e) => e.type === 'FunctionExpression' || e.type === 'ArrowFunctionExpression')));
                if (isIIFE) {
                    // 檢查 IIFE 內部是否有 window.xxx = 或 global.xxx = 的賦值（模組模式）
                    const hasModulePattern = this.checkForModulePattern(callee.body);
                    // 檢查是否只是用於隔離作用域
                    const hasPrivateVars = this.checkForPrivateVariables(callee.body);
                    suggestions.push({
                        id: `iife-to-module-${node.loc?.start?.line || 0}`,
                        type: 'pattern-modernization',
                        title: '將 IIFE 轉換為 ES6 模組',
                        description: hasModulePattern
                            ? '偵測到 IIFE 模組模式 (將方法掛載到 window/global)，建議轉換為 ES6 模組的 export/import'
                            : hasPrivateVars
                                ? '偵測到 IIFE 用於隔離私有變數，在 ES6 模組中每個檔案已有獨立作用域，可直接使用模組'
                                : '偵測到 IIFE，如果用於隔離作用域，可考慮使用區塊作用域 ({ let/const }) 或模組',
                        currentCode: `(function() {
  var privateVar = 'secret';
  ${hasModulePattern ? "window.MyModule = { ... };" : "// private logic"}
})();`,
                        modernCode: hasModulePattern
                            ? `// myModule.js
const privateVar = 'secret';

export function publicMethod() {
  return privateVar;
}

// main.js
import { publicMethod } from './myModule.js';`
                            : `// 使用區塊作用域
{
  const privateVar = 'secret';
  // logic here
}

// 或使用 ES6 模組 (推薦)
// module.js
const privateVar = 'secret';
export const result = doSomething(privateVar);`,
                        location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined,
                        impact: { performance: 0, bundle: 0, maintainability: 4 },
                        difficulty: hasModulePattern ? 'moderate' : 'simple',
                        breaking: hasModulePattern
                    });
                }
            }
        });
    }
    /**
     * 檢查是否有模組模式 (window.xxx = 或 global.xxx =)
     */
    checkForModulePattern(body) {
        if (!body)
            return false;
        let hasModulePattern = false;
        this.traverseAST(body, (node) => {
            if (node.type === 'AssignmentExpression' &&
                node.left?.type === 'MemberExpression') {
                const obj = node.left.object;
                if (obj?.type === 'Identifier' &&
                    (obj.name === 'window' || obj.name === 'global' || obj.name === 'self')) {
                    hasModulePattern = true;
                }
            }
        });
        return hasModulePattern;
    }
    /**
     * 檢查是否有私有變數宣告
     */
    checkForPrivateVariables(body) {
        if (!body)
            return false;
        let hasPrivateVars = false;
        this.traverseAST(body, (node) => {
            if (node.type === 'VariableDeclaration') {
                hasPrivateVars = true;
            }
        });
        return hasPrivateVars;
    }
    /**
     * 檢查 for 迴圈，建議使用現代迭代方法
     */
    findForLoopPatterns(ast, suggestions) {
        this.traverseAST(ast, (node) => {
            // 檢測傳統 for 迴圈: for (let i = 0; i < arr.length; i++)
            if (node.type === 'ForStatement') {
                const analysis = this.analyzeForLoop(node);
                if (analysis.isConvertible) {
                    suggestions.push({
                        id: `for-to-${analysis.suggestedMethod}-${node.loc?.start?.line || 0}`,
                        type: 'pattern-modernization',
                        title: `將 for 迴圈轉換為 ${analysis.suggestedMethod}()`,
                        description: analysis.reason || `傳統 for 迴圈可使用陣列方法 ${analysis.suggestedMethod}() 取代，程式碼更簡潔、可讀性更高`,
                        currentCode: `for (let i = 0; i < ${analysis.arrayName || 'array'}.length; i++) {
  ${analysis.loopAction || '// loop body'}
}`,
                        modernCode: this.generateModernLoopCode(analysis),
                        location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined,
                        impact: { performance: 0, bundle: 0, maintainability: 4 },
                        difficulty: 'simple',
                        breaking: false
                    });
                }
            }
            // 檢測 for...in 迴圈用於陣列 (反模式)
            if (node.type === 'ForInStatement') {
                suggestions.push({
                    id: `for-in-to-for-of-${node.loc?.start?.line || 0}`,
                    type: 'pattern-modernization',
                    title: '考慮將 for...in 改為 for...of 或陣列方法',
                    description: 'for...in 會遍歷所有可枚舉屬性（包括原型鏈），對於陣列應使用 for...of 或陣列方法',
                    currentCode: `for (const key in object) {
  // iterating
}`,
                    modernCode: `// 對於陣列，使用 for...of
for (const item of array) {
  // process item
}

// 對於物件，使用 Object.entries/keys/values
for (const [key, value] of Object.entries(object)) {
  // process key and value
}

// 或使用 forEach
Object.entries(object).forEach(([key, value]) => {
  // process key and value
});`,
                    location: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined,
                    impact: { performance: 5, bundle: 0, maintainability: 3 },
                    difficulty: 'simple',
                    breaking: false
                });
            }
        });
    }
    /**
     * 分析 for 迴圈是否可轉換
     */
    analyzeForLoop(node) {
        const { init, test, update, body } = node;
        // 檢查基本結構
        if (!init || !test || !update || !body) {
            return { isConvertible: false, suggestedMethod: 'forEach' };
        }
        // 檢查是否是標準的 for (let i = 0; i < arr.length; i++) 模式
        // 初始化: let/var i = 0
        if (init.type !== 'VariableDeclaration' ||
            !init.declarations?.[0]?.init ||
            init.declarations[0].init.value !== 0) {
            return { isConvertible: false, suggestedMethod: 'forEach' };
        }
        const iteratorName = init.declarations[0].id?.name;
        // 測試條件: i < arr.length
        let arrayName = '';
        if (test.type === 'BinaryExpression' && (test.operator === '<' || test.operator === '<=')) {
            if (test.right?.type === 'MemberExpression' &&
                test.right.property?.name === 'length') {
                arrayName = this.getCalleeName(test.right.object);
            }
        }
        if (!arrayName) {
            return { isConvertible: false, suggestedMethod: 'forEach' };
        }
        // 分析迴圈體
        const bodyStatements = body.type === 'BlockStatement' ? body.body : [body];
        let hasPush = false;
        let hasConditional = false;
        let hasReturn = false;
        let hasBreak = false;
        let pushTarget = '';
        let loopAction = '';
        this.traverseAST(body, (childNode) => {
            // 檢查 push 操作
            if (childNode.type === 'CallExpression' &&
                childNode.callee?.type === 'MemberExpression' &&
                childNode.callee.property?.name === 'push') {
                hasPush = true;
                pushTarget = this.getCalleeName(childNode.callee.object);
            }
            // 檢查條件判斷
            if (childNode.type === 'IfStatement') {
                hasConditional = true;
            }
            // 檢查提前返回
            if (childNode.type === 'ReturnStatement') {
                hasReturn = true;
            }
            // 檢查 break
            if (childNode.type === 'BreakStatement') {
                hasBreak = true;
            }
        });
        // 根據模式決定建議的方法
        if (hasReturn || hasBreak) {
            return {
                isConvertible: true,
                suggestedMethod: 'find',
                reason: '迴圈包含提前退出，可能適合使用 find()、some() 或 every()',
                arrayName,
                loopAction: 'if (condition) return item;'
            };
        }
        if (hasPush && hasConditional) {
            return {
                isConvertible: true,
                suggestedMethod: 'filter',
                reason: '迴圈包含條件判斷後 push 元素，適合使用 filter()',
                arrayName,
                loopAction: `if (condition) ${pushTarget}.push(${arrayName}[i]);`
            };
        }
        if (hasPush) {
            return {
                isConvertible: true,
                suggestedMethod: 'map',
                reason: '迴圈將處理結果 push 到新陣列，適合使用 map()',
                arrayName,
                loopAction: `${pushTarget}.push(transform(${arrayName}[i]));`
            };
        }
        return {
            isConvertible: true,
            suggestedMethod: 'forEach',
            reason: '標準迭代迴圈，可使用 forEach() 或 for...of',
            arrayName,
            loopAction: `// process ${arrayName}[i]`
        };
    }
    /**
     * 生成現代迴圈程式碼
     */
    generateModernLoopCode(analysis) {
        const arr = analysis.arrayName || 'array';
        switch (analysis.suggestedMethod) {
            case 'map':
                return `const result = ${arr}.map(item => {
  // transform item
  return transformedItem;
});`;
            case 'filter':
                return `const result = ${arr}.filter(item => {
  // return true to keep item
  return condition;
});`;
            case 'find':
                return `const found = ${arr}.find(item => {
  // return true when item matches
  return condition;
});

// 或使用 some() 檢查是否存在
const exists = ${arr}.some(item => condition);`;
            case 'reduce':
                return `const result = ${arr}.reduce((acc, item) => {
  // accumulate result
  return acc + item;
}, initialValue);`;
            case 'forEach':
            default:
                return `${arr}.forEach(item => {
  // process item
});

// 或使用 for...of (支援 break/continue)
for (const item of ${arr}) {
  // process item
}`;
        }
    }
    /**
     * 生成摘要資訊
     */
    generateSummary(fileAnalysis, suggestions) {
        const totalFiles = fileAnalysis.length;
        const totalSuggestions = suggestions.length;
        const potentialPerformanceGain = suggestions.reduce((total, s) => total + (s.impact?.performance || 0), 0);
        const bundleSizeReduction = suggestions.reduce((total, s) => total + (s.impact?.bundle || 0), 0);
        return {
            totalFiles,
            totalSuggestions,
            potentialPerformanceGain,
            bundleSizeReduction
        };
    }
    /**
     * 評估現代化風險
     */
    assessRisk(suggestions) {
        const breakingChanges = suggestions
            .filter(s => s.breaking)
            .map(s => ({
            type: s.type,
            description: s.description,
            impact: s.difficulty === 'complex' ? 'critical' : 'major',
            mitigation: `請詳細測試 ${s.title} 的變更`
        }));
        const compatibilityIssues = []; // TODO: 實作相容性檢查
        const complexSuggestions = suggestions.filter(s => s.difficulty === 'complex').length;
        const moderateSuggestions = suggestions.filter(s => s.difficulty === 'moderate').length;
        const estimatedHours = complexSuggestions * 8 +
            moderateSuggestions * 2 +
            (suggestions.length - complexSuggestions - moderateSuggestions) * 0.5;
        const overallRisk = breakingChanges.length > 5 ? 'high' :
            breakingChanges.length > 2 ? 'medium' : 'low';
        return {
            overallRisk: overallRisk,
            breakingChanges,
            compatibilityIssues,
            migrationEffort: {
                estimatedHours,
                complexity: estimatedHours > 40 ? 'high' : estimatedHours > 16 ? 'medium' : 'low',
                priority: overallRisk === 'low' && estimatedHours < 16 ? 'high' : 'medium'
            }
        };
    }
    /**
     * 生成 API 呼叫程式碼
     */
    generateApiCallCode(call) {
        const args = call.arguments?.map(arg => typeof arg === 'string' ? `'${arg}'` : JSON.stringify(arg)).join(', ') || '';
        if (call.method) {
            return `${call.api}.${call.method}(${args})`;
        }
        else {
            return `${call.api}(${args})`;
        }
    }
    /**
     * 遍歷 AST
     */
    traverseAST(node, visitor) {
        if (!node || typeof node !== 'object')
            return;
        visitor(node);
        for (const key in node) {
            const child = node[key];
            if (child && typeof child === 'object') {
                if (Array.isArray(child)) {
                    for (const item of child) {
                        if (item && typeof item === 'object' && item.type) {
                            this.traverseAST(item, visitor);
                        }
                    }
                }
                else if (child.type) {
                    this.traverseAST(child, visitor);
                }
            }
        }
    }
}
//# sourceMappingURL=modernization.js.map
// EXTERNAL MODULE: ./node_modules/browserslist/index.js
var browserslist = __webpack_require__(77913);
;// CONCATENATED MODULE: ./dist/src/analyzers/compatibility.js
/**
 * API 相容性分析器
 * 分析專案中使用的 API 與目標瀏覽器的相容性
 */

/**
 * API 到 Can I Use ID 的映射
 */
const API_TO_CANIUSE_MAP = {
    // Fetch & Network
    'fetch': 'fetch',
    'AbortController': 'abortcontroller',
    'Headers': 'fetch',
    'Request': 'fetch',
    'Response': 'fetch',
    // DOM APIs
    'querySelector': 'queryselector',
    'querySelectorAll': 'queryselector',
    'classList': 'classlist',
    'MutationObserver': 'mutationobserver',
    'IntersectionObserver': 'intersectionobserver',
    'ResizeObserver': 'resizeobserver',
    // Storage
    'localStorage': 'namevalue-storage',
    'sessionStorage': 'namevalue-storage',
    'indexedDB': 'indexeddb',
    'IndexedDB': 'indexeddb',
    // Media
    'getUserMedia': 'stream',
    'MediaRecorder': 'mediarecorder',
    'AudioContext': 'audio-api',
    'WebAudioAPI': 'audio-api',
    // Graphics
    'canvas': 'canvas',
    'getContext': 'canvas',
    'WebGL': 'webgl',
    'WebGL2': 'webgl2',
    // Async
    'Promise': 'promises',
    'async': 'async-functions',
    'await': 'async-functions',
    'Worker': 'webworkers',
    'SharedWorker': 'sharedworkers',
    'ServiceWorker': 'serviceworkers',
    // URL
    'URL': 'url',
    'URLSearchParams': 'urlsearchparams',
    'history.pushState': 'history',
    'history.replaceState': 'history',
    // Events
    'CustomEvent': 'customevent',
    'BroadcastChannel': 'broadcastchannel',
    'WebSocket': 'websockets',
    'EventSource': 'eventsource',
    // File
    'FileReader': 'fileapi',
    'Blob': 'blobbuilder',
    'File': 'fileapi',
    'clipboard': 'async-clipboard',
    'navigator.clipboard': 'async-clipboard',
    // Location
    'geolocation': 'geolocation',
    'navigator.geolocation': 'geolocation',
    // Notification
    'Notification': 'notifications',
    // Intl
    'Intl.DateTimeFormat': 'internationalization',
    'Intl.NumberFormat': 'internationalization',
    'Intl.RelativeTimeFormat': 'mdn-javascript_builtins_intl_relativetimeformat',
    'Intl.PluralRules': 'intl-pluralrules',
    // Performance
    'performance.now': 'high-resolution-time',
    'performance.mark': 'user-timing',
    'performance.measure': 'user-timing',
    'PerformanceObserver': 'performance-observer',
    // Crypto
    'crypto.randomUUID': 'mdn-api_crypto_randomuuid',
    'crypto.subtle': 'cryptography',
    'SubtleCrypto': 'cryptography',
    // Animation
    'requestAnimationFrame': 'requestanimationframe',
    'animate': 'web-animation',
    'Animation': 'web-animation',
    // CSS Features (detected via API)
    'CSS.supports': 'css-supports-api',
    'matchMedia': 'matchmedia',
    // Other
    'Proxy': 'proxy',
    'Reflect': 'proxy',
    'Symbol': 'es6',
    'Map': 'es6',
    'Set': 'es6',
    'WeakMap': 'es6',
    'WeakSet': 'es6',
    'for...of': 'es6',
    'let': 'let',
    'const': 'const',
    'arrow functions': 'arrow-functions',
    'template literals': 'template-literals',
    'destructuring': 'es6',
    'spread operator': 'es6',
    'rest parameters': 'rest-parameters',
    'default parameters': 'es6',
    'class': 'es6-class',
    'Array.from': 'array-from',
    'Array.includes': 'array-includes',
    'Object.assign': 'object-assign',
    'Object.entries': 'object-entries',
    'Object.values': 'object-values',
    'String.includes': 'es6',
    'String.startsWith': 'es6',
    'String.endsWith': 'es6',
    'String.padStart': 'pad-start-end',
    'String.padEnd': 'pad-start-end',
    'Array.flat': 'array-flat',
    'Array.flatMap': 'array-flat',
    'Object.fromEntries': 'object-fromentries',
    'globalThis': 'mdn-javascript_builtins_globalthis',
    'BigInt': 'bigint',
    'Optional chaining': 'mdn-javascript_operators_optional_chaining',
    'Nullish coalescing': 'mdn-javascript_operators_nullish_coalescing',
};
/**
 * 已知的全域 Web API（單一識別符）
 * 這些是確定的瀏覽器原生 API，不是自訂函數
 */
const KNOWN_GLOBAL_APIS = new Set([
    'fetch',
    'Promise',
    'Worker',
    'SharedWorker',
    'ServiceWorker',
    'WebSocket',
    'EventSource',
    'Blob',
    'File',
    'FileReader',
    'URL',
    'URLSearchParams',
    'FormData',
    'Headers',
    'Request',
    'Response',
    'AbortController',
    'AbortSignal',
    'CustomEvent',
    'MutationObserver',
    'IntersectionObserver',
    'ResizeObserver',
    'PerformanceObserver',
    'MessageChannel',
    'MessagePort',
    'BroadcastChannel',
    'Notification',
    'Intl',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Symbol',
    'Proxy',
    'Reflect',
    'BigInt',
    'AudioContext',
    'MediaRecorder',
    'MediaStream',
    'ImageData',
    'ImageBitmap',
    'OffscreenCanvas',
    'TextEncoder',
    'TextDecoder',
    'DOMParser',
    'XMLSerializer',
    'XPathEvaluator',
]);
/**
 * 已知的 Web API 物件（用於方法呼叫判斷）
 */
const KNOWN_WEB_API_OBJECTS = new Set([
    'document',
    'window',
    'navigator',
    'location',
    'history',
    'screen',
    'console',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'crypto',
    'performance',
    'caches',
    'fetch',
    'Promise',
    'Array',
    'Object',
    'String',
    'Number',
    'Math',
    'Date',
    'JSON',
    'Intl',
    'Reflect',
    'Proxy',
    'URL',
    'URLSearchParams',
    'FormData',
    'Headers',
    'Request',
    'Response',
    'Blob',
    'File',
    'FileReader',
    'Worker',
    'WebSocket',
    'EventSource',
    'Notification',
    'AudioContext',
    'CanvasRenderingContext2D',
    'WebGLRenderingContext',
    'MediaRecorder',
]);
/**
 * 瀏覽器名稱映射
 */
const BROWSER_NAME_MAP = {
    'chrome': 'Chrome',
    'firefox': 'Firefox',
    'safari': 'Safari',
    'edge': 'Edge',
    'ie': 'Internet Explorer',
    'opera': 'Opera',
    'ios_saf': 'iOS Safari',
    'android': 'Android Browser',
    'samsung': 'Samsung Internet',
    'op_mini': 'Opera Mini',
    'op_mob': 'Opera Mobile',
    'and_chr': 'Chrome for Android',
    'and_ff': 'Firefox for Android',
    'and_uc': 'UC Browser',
    'kaios': 'KaiOS Browser',
};
/**
 * 相容性分析器
 */
class CompatibilityAnalyzer {
    parser;
    canIUseService;
    constructor(parser, canIUseService) {
        this.parser = parser;
        this.canIUseService = canIUseService;
    }
    /**
     * 分析專案的 API 相容性
     */
    async analyze(projectPath, includePatterns, excludePatterns, browserslistConfig) {
        // 1. 解析 browserslist 配置，取得目標瀏覽器
        const { targetBrowsers, query } = this.parseBrowserslistConfig(projectPath, browserslistConfig);
        // 2. 解析專案程式碼
        const parsedFiles = await this.parser.parseProject(projectPath, includePatterns, excludePatterns);
        // 3. 收集所有使用的 API
        const apiUsageMap = this.collectApiUsage(parsedFiles);
        // 4. 轉換目標瀏覽器為 CanIUse 格式
        const browserVersions = this.convertBrowserVersions(targetBrowsers);
        // 5. 檢查每個 API 的相容性
        const issues = [];
        const fileAnalysis = [];
        for (const [api, locations] of apiUsageMap.entries()) {
            const caniuseId = this.getCaniuseId(api);
            if (!caniuseId)
                continue;
            try {
                const compatibility = await this.canIUseService.checkCompatibility(caniuseId, browserVersions);
                if (compatibility.notSupported.length > 0 || compatibility.partialSupport.length > 0) {
                    const issue = this.createIssue(api, caniuseId, locations, compatibility);
                    issues.push(issue);
                }
            }
            catch (error) {
                // 忽略無法查詢的 API
                console.warn(`無法查詢 ${api} 的相容性:`, error);
            }
        }
        // 6. 按檔案分組問題
        for (const file of parsedFiles) {
            const fileIssues = issues.filter(issue => issue.locations.some(loc => loc.file === file.filePath));
            const apisUsed = Array.from(new Set(file.apiCalls.map(call => call.method ? `${call.api}.${call.method}` : call.api)));
            fileAnalysis.push({
                filePath: file.filePath,
                apisUsed,
                issues: fileIssues
            });
        }
        // 7. 生成 Polyfill 建議
        const polyfillRecommendations = this.generatePolyfillRecommendations(issues);
        // 8. 計算摘要
        const summary = this.generateSummary(apiUsageMap.size, issues);
        return {
            summary,
            targetBrowsers,
            browserslistQuery: query,
            issues,
            polyfillRecommendations,
            fileAnalysis
        };
    }
    /**
     * 解析 browserslist 配置
     */
    parseBrowserslistConfig(projectPath, configString) {
        let query;
        let browsers;
        try {
            if (configString) {
                // 使用傳入的配置
                query = configString;
                browsers = browserslist(configString);
            }
            else {
                // 自動偵測專案配置
                browsers = browserslist(undefined, { path: projectPath });
                query = 'defaults (from project config)';
            }
        }
        catch (error) {
            // 使用預設配置
            query = 'defaults';
            browsers = browserslist('defaults');
        }
        // 解析瀏覽器版本
        const targetBrowsers = browsers.map(browser => {
            const [name, version] = browser.split(' ');
            return {
                name: name.toLowerCase(),
                version,
                displayName: `${BROWSER_NAME_MAP[name.toLowerCase()] || name} ${version}`
            };
        });
        // 去重並按瀏覽器名稱分組，只保留最低版本
        const browserMap = new Map();
        for (const browser of targetBrowsers) {
            const existing = browserMap.get(browser.name);
            if (!existing || parseFloat(browser.version) < parseFloat(existing.version)) {
                browserMap.set(browser.name, browser);
            }
        }
        return {
            targetBrowsers: Array.from(browserMap.values()),
            query
        };
    }
    /**
     * 收集專案中使用的 API
     */
    collectApiUsage(files) {
        const apiUsage = new Map();
        for (const file of files) {
            for (const call of file.apiCalls) {
                const apiName = call.method ? `${call.api}.${call.method}` : call.api;
                // 過濾掉明顯不是 Web API 的呼叫
                if (this.isWebApi(apiName)) {
                    const locations = apiUsage.get(apiName) || [];
                    locations.push({
                        file: file.filePath,
                        line: call.loc?.line || 0,
                        column: call.loc?.column || 0
                    });
                    apiUsage.set(apiName, locations);
                }
            }
        }
        return apiUsage;
    }
    /**
     * 判斷是否是 Web API
     * 使用嚴格匹配，避免誤判專案自訂函數
     */
    isWebApi(apiName) {
        // 排除明顯的自訂函數（小寫字母開頭的單一函數名）
        if (/^[a-z][a-zA-Z0-9]*$/.test(apiName) && !KNOWN_GLOBAL_APIS.has(apiName)) {
            return false;
        }
        // 排除常見的自訂函數模式
        const excludePatterns = [
            /^(get|set|create|update|delete|fetch|load|save|handle|on|render|use)[A-Z]/, // 自訂函數命名
            /^_/, // 私有函數
            /\$$/, // jQuery 風格
            /^(is|has|can|should|will|did)[A-Z]/, // 判斷函數
            /^(init|setup|config|process|parse|format|validate|transform)/i, // 工具函數
        ];
        // 如果是單一識別符（無點號），檢查是否為排除模式
        if (!apiName.includes('.')) {
            if (excludePatterns.some(pattern => pattern.test(apiName))) {
                return false;
            }
        }
        // 檢查是否在映射表中（精確匹配）
        if (API_TO_CANIUSE_MAP[apiName])
            return true;
        // 檢查是否是已知的 Web API 物件方法呼叫
        const parts = apiName.split('.');
        if (parts.length >= 2) {
            const [obj, method] = parts;
            // 精確匹配物件名稱
            if (KNOWN_WEB_API_OBJECTS.has(obj)) {
                return true;
            }
            // 檢查完整的 API 路徑
            const fullPath = `${obj}.${method}`;
            if (API_TO_CANIUSE_MAP[fullPath]) {
                return true;
            }
        }
        return false;
    }
    /**
     * 取得 Can I Use ID
     * 使用精確匹配，避免誤判
     */
    getCaniuseId(apiName) {
        // 1. 直接精確匹配
        if (API_TO_CANIUSE_MAP[apiName]) {
            return API_TO_CANIUSE_MAP[apiName];
        }
        // 2. 嘗試匹配物件名稱（如 fetch, Promise）
        const parts = apiName.split('.');
        if (parts.length >= 1) {
            const obj = parts[0];
            if (API_TO_CANIUSE_MAP[obj]) {
                return API_TO_CANIUSE_MAP[obj];
            }
        }
        // 3. 嘗試匹配完整路徑（如 navigator.geolocation）
        if (parts.length >= 2) {
            const fullPath = `${parts[0]}.${parts[1]}`;
            if (API_TO_CANIUSE_MAP[fullPath]) {
                return API_TO_CANIUSE_MAP[fullPath];
            }
        }
        // 4. 不再使用模糊匹配，避免誤判
        return null;
    }
    /**
     * 轉換瀏覽器版本格式
     */
    convertBrowserVersions(browsers) {
        const versions = {};
        for (const browser of browsers) {
            // 只取主要瀏覽器
            if (['chrome', 'firefox', 'safari', 'edge', 'ie', 'opera', 'ios_saf', 'android'].includes(browser.name)) {
                versions[browser.name] = browser.version;
            }
        }
        return versions;
    }
    /**
     * 建立相容性問題
     */
    createIssue(api, caniuseId, locations, compatibility) {
        // 計算嚴重程度
        let severity;
        if (compatibility.notSupported.length >= 3) {
            severity = 'critical';
        }
        else if (compatibility.notSupported.length >= 1) {
            severity = 'high';
        }
        else if (compatibility.partialSupport.length >= 2) {
            severity = 'medium';
        }
        else {
            severity = 'low';
        }
        return {
            api,
            caniuseId,
            locations,
            globalSupport: compatibility.globalSupport,
            unsupportedBrowsers: compatibility.notSupported,
            partiallySupportedBrowsers: compatibility.partialSupport,
            polyfillAvailable: compatibility.polyfillAvailable,
            polyfillUrl: compatibility.polyfillUrl,
            severity,
            recommendation: compatibility.recommendation
        };
    }
    /**
     * 生成 Polyfill 建議
     */
    generatePolyfillRecommendations(issues) {
        const recommendations = [];
        const seen = new Set();
        for (const issue of issues) {
            if (issue.polyfillAvailable && issue.polyfillUrl && !seen.has(issue.api)) {
                seen.add(issue.api);
                recommendations.push({
                    api: issue.api,
                    polyfillUrl: issue.polyfillUrl,
                    cdnScript: `<script src="${issue.polyfillUrl}"></script>`,
                    npmPackage: this.getNpmPackage(issue.api),
                    affectedBrowsers: issue.unsupportedBrowsers
                });
            }
        }
        return recommendations;
    }
    /**
     * 取得 npm 套件名稱
     */
    getNpmPackage(api) {
        const npmPackages = {
            'fetch': 'whatwg-fetch',
            'Promise': 'es6-promise',
            'IntersectionObserver': 'intersection-observer',
            'ResizeObserver': 'resize-observer-polyfill',
            'MutationObserver': 'mutationobserver-shim',
            'URLSearchParams': 'url-search-params-polyfill',
            'AbortController': 'abortcontroller-polyfill',
            'CustomEvent': 'custom-event-polyfill',
            'Symbol': 'core-js/features/symbol',
            'Map': 'core-js/features/map',
            'Set': 'core-js/features/set',
            'Array.from': 'core-js/features/array/from',
            'Array.includes': 'core-js/features/array/includes',
            'Object.assign': 'core-js/features/object/assign',
            'Object.entries': 'core-js/features/object/entries',
            'String.includes': 'core-js/features/string/includes',
        };
        return npmPackages[api];
    }
    /**
     * 生成摘要資訊
     */
    generateSummary(totalApis, issues) {
        const incompatibleApis = issues.filter(i => i.unsupportedBrowsers.length > 0).length;
        const partiallyCompatibleApis = issues.filter(i => i.unsupportedBrowsers.length === 0 && i.partiallySupportedBrowsers.length > 0).length;
        const compatibleApis = totalApis - incompatibleApis - partiallyCompatibleApis;
        const polyfillsNeeded = issues.filter(i => i.polyfillAvailable).length;
        // 計算整體相容性百分比
        const overallCompatibility = totalApis > 0
            ? Math.round((compatibleApis / totalApis) * 100)
            : 100;
        return {
            totalApisAnalyzed: totalApis,
            compatibleApis,
            incompatibleApis,
            partiallyCompatibleApis,
            overallCompatibility,
            polyfillsNeeded
        };
    }
}
/**
 * 格式化相容性報告
 */
function formatCompatibilityReport(analysis, format = 'markdown') {
    switch (format) {
        case 'json':
            return JSON.stringify(analysis, null, 2);
        case 'html':
            return formatAsHtml(analysis);
        case 'text':
            return formatAsText(analysis);
        case 'markdown':
        default:
            return formatAsMarkdown(analysis);
    }
}
/**
 * 格式化為 Markdown
 */
function formatAsMarkdown(analysis) {
    const { summary, targetBrowsers, browserslistQuery, issues, polyfillRecommendations } = analysis;
    let report = `# 🔍 API 相容性分析報告\n\n`;
    // 摘要
    report += `## 📊 執行摘要\n\n`;
    report += createAsciiTable(['指標', '數值'], [
        ['分析的 API 數量', String(summary.totalApisAnalyzed)],
        ['完全相容', String(summary.compatibleApis)],
        ['部分相容', String(summary.partiallyCompatibleApis)],
        ['不相容', String(summary.incompatibleApis)],
        ['整體相容性', `${summary.overallCompatibility}%`],
        ['需要 Polyfill', String(summary.polyfillsNeeded)],
    ]);
    report += `\n`;
    // 目標瀏覽器
    report += `## 🎯 目標瀏覽器\n\n`;
    report += `**Browserslist 查詢**: \`${browserslistQuery}\`\n\n`;
    if (targetBrowsers.length > 0) {
        report += createAsciiTable(['瀏覽器', '最低版本'], targetBrowsers.map(browser => [
            BROWSER_NAME_MAP[browser.name] || browser.name,
            browser.version
        ]));
        report += `\n`;
    }
    // 相容性問題
    if (issues.length > 0) {
        report += `## ⚠️ 相容性問題\n\n`;
        // 按嚴重程度分組
        const criticalIssues = issues.filter(i => i.severity === 'critical');
        const highIssues = issues.filter(i => i.severity === 'high');
        const mediumIssues = issues.filter(i => i.severity === 'medium');
        const lowIssues = issues.filter(i => i.severity === 'low');
        if (criticalIssues.length > 0) {
            report += `### 🔴 嚴重問題 (${criticalIssues.length})\n\n`;
            report += formatIssueTable(criticalIssues);
        }
        if (highIssues.length > 0) {
            report += `### 🟠 高風險問題 (${highIssues.length})\n\n`;
            report += formatIssueTable(highIssues);
        }
        if (mediumIssues.length > 0) {
            report += `### 🟡 中風險問題 (${mediumIssues.length})\n\n`;
            report += formatIssueTable(mediumIssues);
        }
        if (lowIssues.length > 0) {
            report += `### 🟢 低風險問題 (${lowIssues.length})\n\n`;
            report += formatIssueTable(lowIssues);
        }
    }
    else {
        report += `## ✅ 無相容性問題\n\n`;
        report += `恭喜！所有使用的 API 在目標瀏覽器中都完全支援。\n\n`;
    }
    // Polyfill 建議
    if (polyfillRecommendations.length > 0) {
        report += `## 📦 Polyfill 建議\n\n`;
        for (const rec of polyfillRecommendations) {
            report += `### ${rec.api}\n\n`;
            report += `**受影響的瀏覽器**: ${rec.affectedBrowsers.join(', ')}\n\n`;
            report += `**CDN 引入**:\n\`\`\`html\n${rec.cdnScript}\n\`\`\`\n\n`;
            if (rec.npmPackage) {
                report += `**npm 套件**: \`${rec.npmPackage}\`\n\n`;
            }
        }
        // 統一 Polyfill 方案
        report += `### 💡 統一 Polyfill 方案\n\n`;
        report += `使用 [polyfill.io](https://polyfill.io) 自動按需載入 polyfill：\n\n`;
        report += `\`\`\`html\n<script src="https://polyfill.io/v3/polyfill.min.js?features=${polyfillRecommendations.map(r => r.api).join('%2C')}"></script>\n\`\`\`\n\n`;
    }
    // 結論
    report += `## 📝 總結\n\n`;
    if (summary.overallCompatibility >= 90) {
        report += `✅ 專案的 API 相容性良好，整體相容性達 ${summary.overallCompatibility}%。\n`;
    }
    else if (summary.overallCompatibility >= 70) {
        report += `⚠️ 專案存在一些相容性問題，建議加入必要的 polyfill。\n`;
    }
    else {
        report += `❌ 專案存在較多相容性問題，建議仔細評估目標瀏覽器需求或加入 polyfill。\n`;
    }
    if (polyfillRecommendations.length > 0) {
        report += `\n建議加入 ${polyfillRecommendations.length} 個 polyfill 以提升相容性。\n`;
    }
    return report;
}
/**
 * 建立 GitHub Flavored Markdown 表格（在 GitHub 評論中正確顯示）
 */
function createAsciiTable(headers, rows) {
    // 轉義表格中的管道符號，避免破壞表格結構
    const escapeCell = (cell) => {
        return cell.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    };
    // 建立表頭
    const headerRow = '| ' + headers.map(escapeCell).join(' | ') + ' |';
    // 建立分隔線（GitHub Markdown 表格需要至少 3 個破折號）
    const separator = '| ' + headers.map(() => '---').join(' | ') + ' |';
    // 建立資料行
    const dataRows = rows.map(row => {
        return '| ' + row.map(cell => escapeCell(cell || '')).join(' | ') + ' |';
    });
    // 組合表格
    let table = '\n';
    table += headerRow + '\n';
    table += separator + '\n';
    table += dataRows.join('\n') + '\n';
    table += '\n';
    return table;
}
/**
 * 格式化問題表格
 */
function formatIssueTable(issues) {
    const headers = ['API', '全球支援率', '不支援的瀏覽器', 'Polyfill'];
    const rows = issues.map(issue => {
        const browsers = issue.unsupportedBrowsers.slice(0, 3).join(', ') || '-';
        const more = issue.unsupportedBrowsers.length > 3 ? ` (+${issue.unsupportedBrowsers.length - 3})` : '';
        const polyfill = issue.polyfillAvailable ? '✅ 可用' : '❌ 無';
        return [issue.api, `${issue.globalSupport.toFixed(1)}%`, `${browsers}${more}`, polyfill];
    });
    return createAsciiTable(headers, rows) + '\n';
}
/**
 * 格式化為純文字
 */
function formatAsText(analysis) {
    const { summary, targetBrowsers, issues, polyfillRecommendations } = analysis;
    let report = `API 相容性分析報告\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `執行摘要\n`;
    report += `-`.repeat(30) + '\n';
    report += `分析的 API: ${summary.totalApisAnalyzed}\n`;
    report += `完全相容: ${summary.compatibleApis}\n`;
    report += `不相容: ${summary.incompatibleApis}\n`;
    report += `整體相容性: ${summary.overallCompatibility}%\n\n`;
    report += `目標瀏覽器\n`;
    report += `-`.repeat(30) + '\n';
    for (const browser of targetBrowsers) {
        report += `- ${BROWSER_NAME_MAP[browser.name] || browser.name} ${browser.version}\n`;
    }
    report += '\n';
    if (issues.length > 0) {
        report += `相容性問題 (${issues.length})\n`;
        report += `-`.repeat(30) + '\n';
        for (const issue of issues) {
            report += `[${issue.severity.toUpperCase()}] ${issue.api}\n`;
            report += `  不支援: ${issue.unsupportedBrowsers.join(', ')}\n`;
            report += `  Polyfill: ${issue.polyfillAvailable ? '可用' : '無'}\n\n`;
        }
    }
    return report;
}
/**
 * 格式化為 HTML
 */
function formatAsHtml(analysis) {
    const { summary, targetBrowsers, issues, polyfillRecommendations } = analysis;
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 相容性分析報告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .stat { text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .stat-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f0f0f0; }
    .critical { background: #fee2e2; }
    .high { background: #fef3c7; }
    .medium { background: #fef9c3; }
    .low { background: #dcfce7; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>🔍 API 相容性分析報告</h1>
  
  <div class="summary">
    <h2>執行摘要</h2>
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${summary.totalApisAnalyzed}</div>
        <div class="stat-label">分析的 API</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: ${summary.overallCompatibility >= 80 ? '#16a34a' : '#dc2626'}">${summary.overallCompatibility}%</div>
        <div class="stat-label">整體相容性</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.polyfillsNeeded}</div>
        <div class="stat-label">需要 Polyfill</div>
      </div>
    </div>
  </div>

  <h2>目標瀏覽器</h2>
  <table>
    <tr><th>瀏覽器</th><th>最低版本</th></tr>
    ${targetBrowsers.map(b => `<tr><td>${BROWSER_NAME_MAP[b.name] || b.name}</td><td>${b.version}</td></tr>`).join('')}
  </table>

  ${issues.length > 0 ? `
  <h2>相容性問題</h2>
  <table>
    <tr><th>API</th><th>嚴重程度</th><th>不支援的瀏覽器</th><th>Polyfill</th></tr>
    ${issues.map(i => `<tr class="${i.severity}"><td><code>${i.api}</code></td><td>${i.severity}</td><td>${i.unsupportedBrowsers.join(', ')}</td><td>${i.polyfillAvailable ? '✅' : '❌'}</td></tr>`).join('')}
  </table>
  ` : '<h2>✅ 無相容性問題</h2>'}

</body>
</html>`;
}
//# sourceMappingURL=compatibility.js.map
// EXTERNAL MODULE: ./node_modules/@typescript-eslint/parser/dist/index.js
var dist = __webpack_require__(62721);
// EXTERNAL MODULE: ./node_modules/glob/dist/esm/index.js + 15 modules
var esm = __webpack_require__(86893);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(79896);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(16928);
;// CONCATENATED MODULE: ./dist/src/parsers/index.js




/**
 * TypeScript/JavaScript 程式碼解析器
 */
class CodeParser {
    supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
    /**
     * 解析專案中的所有支援的檔案
     */
    async parseProject(projectPath, includePatterns = ['**/*.{js,ts,jsx,tsx}'], excludePatterns = ['node_modules/**', 'dist/**', 'build/**']) {
        const files = await this.findFiles(projectPath, includePatterns, excludePatterns);
        const results = [];
        for (const file of files) {
            try {
                const parsed = await this.parseFile(file);
                if (parsed) {
                    results.push(parsed);
                }
            }
            catch (error) {
                console.warn(`無法解析檔案 ${file}:`, error instanceof Error ? error.message : error);
            }
        }
        return results;
    }
    /**
     * 解析單一檔案
     */
    async parseFile(filePath) {
        if (!(0,external_fs_.existsSync)(filePath)) {
            throw new Error(`檔案不存在: ${filePath}`);
        }
        const ext = (0,external_path_.extname)(filePath);
        if (!this.supportedExtensions.includes(ext)) {
            return null;
        }
        const content = (0,external_fs_.readFileSync)(filePath, 'utf-8');
        return this.parseCode(content, filePath);
    }
    /**
     * 解析程式碼字串
     */
    parseCode(code, filePath) {
        try {
            // 使用 TypeScript ESLint Parser 解析
            const ast = (0,dist/* parse */.qg)(code, {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                    globalReturn: false
                },
                loc: true,
                range: true,
                comment: true,
                attachComments: true
            });
            // 分析 AST 提取資訊
            const imports = this.extractImports(ast);
            const exports = this.extractExports(ast);
            const functions = this.extractFunctions(ast);
            const apiCalls = this.extractApiCalls(ast);
            const dependencies = this.extractDependencies(imports);
            return {
                filePath: filePath || '<unknown>',
                ast,
                imports,
                exports,
                functions,
                apiCalls,
                dependencies
            };
        }
        catch (error) {
            throw new Error(`解析失敗: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 搜尋檔案
     */
    async findFiles(projectPath, includePatterns, excludePatterns) {
        const files = [];
        for (const pattern of includePatterns) {
            try {
                const matches = await (0,esm/* glob */.TI)(pattern, {
                    cwd: (0,external_path_.resolve)(projectPath),
                    ignore: excludePatterns,
                    absolute: true
                });
                files.push(...matches);
            }
            catch (error) {
                console.warn(`搜尋模式 ${pattern} 失敗:`, error);
            }
        }
        // 去重並排序
        return [...new Set(files)].sort();
    }
    /**
     * 提取 import 語句資訊 (支援 ES Module 和 CommonJS)
     */
    extractImports(ast) {
        const imports = [];
        this.traverseAST(ast, (node) => {
            // ES Module: import ... from '...'
            if (node.type === 'ImportDeclaration') {
                const source = node.source?.value;
                if (!source)
                    return;
                const specifiers = (node.specifiers || []).map((spec) => {
                    if (spec.type === 'ImportDefaultSpecifier') {
                        return {
                            imported: 'default',
                            local: spec.local?.name || '',
                            type: 'default'
                        };
                    }
                    else if (spec.type === 'ImportNamespaceSpecifier') {
                        return {
                            imported: '*',
                            local: spec.local?.name || '',
                            type: 'namespace'
                        };
                    }
                    else if (spec.type === 'ImportSpecifier') {
                        return {
                            imported: spec.imported?.name || '',
                            local: spec.local?.name || '',
                            type: 'named'
                        };
                    }
                    return null;
                }).filter(Boolean);
                imports.push({
                    source,
                    specifiers,
                    isTypeOnly: node.importKind === 'type',
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
            // CommonJS: require('...')
            if (node.type === 'CallExpression' &&
                node.callee?.type === 'Identifier' &&
                node.callee.name === 'require' &&
                node.arguments?.[0]?.type === 'Literal' &&
                typeof node.arguments[0].value === 'string') {
                const source = node.arguments[0].value;
                let specifiers = [];
                // 檢查 require 的使用方式
                // 1. const x = require('...') - default import
                // 2. const { a, b } = require('...') - named imports
                // 3. require('...') - side effect import
                // 找到父節點來判斷使用方式
                const parent = this.findParentNode(ast, node);
                if (parent?.type === 'VariableDeclarator') {
                    const id = parent.id;
                    // const { a, b } = require('...')
                    if (id?.type === 'ObjectPattern') {
                        specifiers = (id.properties || [])
                            .filter((prop) => prop.type === 'Property')
                            .map((prop) => ({
                            imported: prop.key?.name || prop.key?.value || '',
                            local: prop.value?.name || prop.key?.name || '',
                            type: 'named'
                        }));
                    }
                    // const x = require('...')
                    else if (id?.type === 'Identifier') {
                        specifiers = [{
                                imported: 'default',
                                local: id.name,
                                type: 'default'
                            }];
                    }
                }
                // 避免重複添加 (同一位置的 require)
                const existingImport = imports.find(imp => imp.source === source &&
                    imp.loc?.line === node.loc?.start?.line);
                if (!existingImport) {
                    imports.push({
                        source,
                        specifiers,
                        isTypeOnly: false,
                        loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                    });
                }
            }
        });
        return imports;
    }
    /**
     * 找到指定節點的父節點
     */
    findParentNode(ast, targetNode) {
        let parent = null;
        const search = (node, parentNode) => {
            if (node === targetNode) {
                parent = parentNode;
                return true;
            }
            for (const key in node) {
                const child = node[key];
                if (child && typeof child === 'object') {
                    if (Array.isArray(child)) {
                        for (const item of child) {
                            if (item && typeof item === 'object' && item.type) {
                                if (search(item, node))
                                    return true;
                            }
                        }
                    }
                    else if (child.type) {
                        if (search(child, node))
                            return true;
                    }
                }
            }
            return false;
        };
        search(ast, null);
        return parent;
    }
    /**
     * 提取 export 語句資訊
     */
    extractExports(ast) {
        const exports = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'ExportDefaultDeclaration') {
                exports.push({
                    name: 'default',
                    type: 'default',
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
            else if (node.type === 'ExportNamedDeclaration') {
                if (node.declaration) {
                    // export function/class/variable
                    const name = node.declaration.id?.name || node.declaration.name;
                    if (name) {
                        exports.push({
                            name,
                            type: 'named',
                            loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                        });
                    }
                }
                else if (node.specifiers) {
                    // export { ... }
                    for (const spec of node.specifiers) {
                        if (spec.type === 'ExportSpecifier') {
                            exports.push({
                                name: spec.exported?.name || '',
                                type: 'named',
                                loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                            });
                        }
                    }
                }
            }
        });
        return exports;
    }
    /**
     * 提取函式資訊
     */
    extractFunctions(ast) {
        const functions = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                const name = node.id?.name || '<anonymous>';
                const parameters = (node.params || []).map((param) => param.name || param.type);
                functions.push({
                    name,
                    parameters,
                    isAsync: node.async === true,
                    isArrow: false,
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
            else if (node.type === 'ArrowFunctionExpression') {
                const parameters = (node.params || []).map((param) => param.name || param.type);
                functions.push({
                    name: '<arrow>',
                    parameters,
                    isAsync: node.async === true,
                    isArrow: true,
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
        });
        return functions;
    }
    /**
     * 提取 API 呼叫資訊
     */
    extractApiCalls(ast) {
        const apiCalls = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'CallExpression') {
                let api = '';
                let method;
                if (node.callee.type === 'Identifier') {
                    // 函式呼叫: func()
                    api = node.callee.name;
                }
                else if (node.callee.type === 'MemberExpression') {
                    // 方法呼叫: obj.method()
                    const object = this.getNodeName(node.callee.object);
                    const property = this.getNodeName(node.callee.property);
                    api = object;
                    method = property;
                }
                if (api) {
                    apiCalls.push({
                        api,
                        method,
                        arguments: (node.arguments || []).map((arg) => this.getNodeValue(arg)),
                        loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                    });
                }
            }
        });
        return apiCalls;
    }
    /**
     * 提取依賴項目
     */
    extractDependencies(imports) {
        const deps = new Set();
        for (const imp of imports) {
            // 只收集外部依賴 (不是相對路徑)
            if (!imp.source.startsWith('.') && !imp.source.startsWith('/')) {
                // 處理 scoped packages (如 @types/node)
                const parts = imp.source.split('/');
                if (parts[0].startsWith('@')) {
                    deps.add(`${parts[0]}/${parts[1]}`);
                }
                else {
                    deps.add(parts[0]);
                }
            }
        }
        return Array.from(deps).sort();
    }
    /**
     * 遍歷 AST
     */
    traverseAST(node, visitor) {
        visitor(node);
        for (const key in node) {
            const child = node[key];
            if (child && typeof child === 'object') {
                if (Array.isArray(child)) {
                    for (const item of child) {
                        if (item && typeof item === 'object' && item.type) {
                            this.traverseAST(item, visitor);
                        }
                    }
                }
                else if (child.type) {
                    this.traverseAST(child, visitor);
                }
            }
        }
    }
    /**
     * 取得節點名稱
     */
    getNodeName(node) {
        if (!node)
            return '';
        switch (node.type) {
            case 'Identifier':
                return node.name || '';
            case 'MemberExpression':
                const obj = this.getNodeName(node.object);
                const prop = this.getNodeName(node.property);
                return obj && prop ? `${obj}.${prop}` : '';
            case 'ThisExpression':
                return 'this';
            default:
                return node.type;
        }
    }
    /**
     * 取得節點值
     */
    getNodeValue(node) {
        if (!node)
            return null;
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return node.name;
            case 'ArrayExpression':
                return (node.elements || []).map((el) => this.getNodeValue(el));
            case 'ObjectExpression':
                const obj = {};
                for (const prop of node.properties || []) {
                    if (prop.type === 'Property') {
                        const key = this.getNodeValue(prop.key);
                        const value = this.getNodeValue(prop.value);
                        obj[key] = value;
                    }
                }
                return obj;
            default:
                return `<${node.type}>`;
        }
    }
}
//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./dist/src/utils/report-formatter.js
/**
 * 報告生成器
 */
class ReportFormatter {
    /**
     * 格式化現代化分析報告
     */
    formatModernizationReport(analysis, format = 'markdown') {
        switch (format) {
            case 'markdown':
                return this.formatMarkdownReport(analysis);
            case 'json':
                return this.formatJsonReport(analysis);
            case 'html':
                return this.formatHtmlReport(analysis);
            case 'text':
                return this.formatTextReport(analysis);
            default:
                throw new Error(`不支援的格式: ${format}`);
        }
    }
    /**
     * 格式化為 Markdown 報告
     */
    formatMarkdownReport(analysis) {
        const { summary, suggestions, fileAnalysis, riskAssessment } = analysis;
        let report = '# 程式碼現代化分析報告\n\n';
        // 執行摘要
        report += '## 📊 執行摘要\n\n';
        report += `- **掃描檔案數量**: ${summary.totalFiles} 個檔案\n`;
        report += `- **發現建議數量**: ${summary.totalSuggestions} 項\n`;
        report += `- **潛在效能提升**: ${summary.potentialPerformanceGain}%\n`;
        report += `- **檔案大小減少**: ${summary.bundleSizeReduction}KB\n\n`;
        // 風險評估
        report += '## ⚠️ 風險評估\n\n';
        report += `- **整體風險等級**: ${this.getRiskIcon(riskAssessment.overallRisk)} ${riskAssessment.overallRisk.toUpperCase()}\n`;
        report += `- **預估工時**: ${riskAssessment.migrationEffort.estimatedHours} 小時\n`;
        report += `- **複雜度**: ${riskAssessment.migrationEffort.complexity.toUpperCase()}\n`;
        report += `- **優先順序**: ${riskAssessment.migrationEffort.priority.toUpperCase()}\n\n`;
        if (riskAssessment.breakingChanges.length > 0) {
            report += '### 💥 破壞性變更警告\n\n';
            for (const change of riskAssessment.breakingChanges) {
                report += `- **${change.type}**: ${change.description}\n`;
                report += `  - 影響等級: ${change.impact.toUpperCase()}\n`;
                report += `  - 緩解方案: ${change.mitigation}\n\n`;
            }
        }
        // 現代化建議摘要
        if (suggestions.length > 0) {
            report += '## 🚀 主要現代化建議\n\n';
            // 按類型分組建議
            const groupedSuggestions = this.groupSuggestionsByType(suggestions);
            for (const [type, typeSuggestions] of groupedSuggestions) {
                report += `### ${this.getTypeIcon(type)} ${this.getTypeDisplayName(type)}\n\n`;
                for (const suggestion of typeSuggestions.slice(0, 5)) { // 只顯示前 5 個
                    report += `#### ${suggestion.title}\n`;
                    report += `${suggestion.description}\n\n`;
                    report += '**目前程式碼:**\n';
                    report += '```javascript\n';
                    report += suggestion.currentCode;
                    report += '\n```\n\n';
                    report += '**現代化版本:**\n';
                    report += '```javascript\n';
                    report += suggestion.modernCode;
                    report += '\n```\n\n';
                    report += `- 💪 **效能提升**: ${suggestion.impact?.performance || 0}%\n`;
                    report += `- 📦 **檔案減少**: ${suggestion.impact?.bundle || 0}KB\n`;
                    report += `- 🛠️ **維護性**: ${suggestion.impact?.maintainability || 0}/5\n`;
                    report += `- ⚡ **實作難度**: ${suggestion.difficulty.toUpperCase()}\n`;
                    report += `- 💥 **破壞性變更**: ${suggestion.breaking ? '是' : '否'}\n\n`;
                    if (suggestion.location) {
                        report += `📍 位置: 第 ${suggestion.location.line} 行\n\n`;
                    }
                    report += '---\n\n';
                }
                if (typeSuggestions.length > 5) {
                    report += `*以及其他 ${typeSuggestions.length - 5} 項 ${this.getTypeDisplayName(type)} 建議...*\n\n`;
                }
            }
        }
        // 檔案詳細分析
        if (fileAnalysis.length > 0) {
            report += '## 📁 檔案詳細分析\n\n';
            // 只顯示有建議的檔案，並限制數量
            const filesWithSuggestions = fileAnalysis
                .filter(file => file.suggestions.length > 0)
                .slice(0, 10); // 只顯示前 10 個檔案
            for (const file of filesWithSuggestions) {
                report += `### 📄 ${file.filePath}\n`;
                report += `發現 ${file.suggestions.length} 項現代化機會\n\n`;
                // 顯示該檔案的建議摘要
                const topSuggestions = file.suggestions.slice(0, 3);
                for (const suggestion of topSuggestions) {
                    report += `- **${suggestion.title}** (難度: ${suggestion.difficulty})\n`;
                }
                if (file.suggestions.length > 3) {
                    report += `- *以及其他 ${file.suggestions.length - 3} 項建議...*\n`;
                }
                report += '\n';
            }
            if (fileAnalysis.filter(f => f.suggestions.length > 0).length > 10) {
                const remaining = fileAnalysis.filter(f => f.suggestions.length > 0).length - 10;
                report += `*以及其他 ${remaining} 個檔案有現代化機會...*\n\n`;
            }
        }
        // 實作建議
        report += '## 📋 實作建議\n\n';
        report += '### 優先順序建議\n\n';
        const highPriority = suggestions.filter(s => (s.impact?.performance || 0) > 15 ||
            (s.impact?.bundle || 0) > 30 ||
            s.type === 'library-replacement');
        if (highPriority.length > 0) {
            report += '#### 🔥 高優先順序 (建議立即處理)\n';
            for (const suggestion of highPriority.slice(0, 5)) {
                report += `- ${suggestion.title}\n`;
            }
            report += '\n';
        }
        const lowRisk = suggestions.filter(s => !s.breaking && s.difficulty === 'trivial');
        if (lowRisk.length > 0) {
            report += '#### ✅ 低風險快速改善 (可先處理)\n';
            for (const suggestion of lowRisk.slice(0, 5)) {
                report += `- ${suggestion.title}\n`;
            }
            report += '\n';
        }
        // 結論
        report += '## 🎯 結論\n\n';
        if (summary.totalSuggestions === 0) {
            report += '🎉 恭喜！您的程式碼已經相當現代化，沒有發現需要立即處理的現代化機會。\n\n';
        }
        else if (riskAssessment.overallRisk === 'low') {
            report += '✨ 您的程式碼有不錯的現代化潛力，且風險相對較低。建議逐步實施這些改善。\n\n';
        }
        else {
            report += '⚡ 發現多項現代化機會，建議制定詳細的移轉計畫，優先處理高影響、低風險的項目。\n\n';
        }
        report += `總計可能節省 ${summary.bundleSizeReduction}KB 檔案大小，提升 ${summary.potentialPerformanceGain}% 效能。\n\n`;
        report += '---\n';
        report += '*此報告由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成*\n';
        return report;
    }
    /**
     * 格式化為 JSON 報告
     */
    formatJsonReport(analysis) {
        return JSON.stringify(analysis, null, 2);
    }
    /**
     * 格式化為 HTML 報告
     */
    formatHtmlReport(analysis) {
        const { summary, suggestions, riskAssessment } = analysis;
        let html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>程式碼現代化分析報告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .suggestion { background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .code-block { background: #f6f8fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 10px 0; overflow-x: auto; }
        .risk-high { color: #dc3545; }
        .risk-medium { color: #ffc107; }
        .risk-low { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 程式碼現代化分析報告</h1>
        <p>智慧分析您的程式碼，發現現代化機會</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${summary.totalFiles}</div>
            <div>掃描檔案</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalSuggestions}</div>
            <div>現代化建議</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.potentialPerformanceGain}%</div>
            <div>效能提升</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.bundleSizeReduction}KB</div>
            <div>檔案減少</div>
        </div>
    </div>

    <h2>⚠️ 風險評估</h2>
    <p class="risk-${riskAssessment.overallRisk}">
        整體風險等級: <strong>${riskAssessment.overallRisk.toUpperCase()}</strong>
    </p>
    <p>預估工時: ${riskAssessment.migrationEffort.estimatedHours} 小時</p>
`;
        if (suggestions.length > 0) {
            html += '<h2>🎯 主要建議</h2>';
            for (const suggestion of suggestions.slice(0, 10)) {
                html += `
        <div class="suggestion">
            <h3>${suggestion.title}</h3>
            <p>${suggestion.description}</p>

            <h4>目前程式碼:</h4>
            <div class="code-block"><pre><code>${this.escapeHtml(suggestion.currentCode)}</code></pre></div>

            <h4>現代化版本:</h4>
            <div class="code-block"><pre><code>${this.escapeHtml(suggestion.modernCode)}</code></pre></div>

            <div style="display: flex; gap: 20px; margin-top: 15px;">
                <span>💪 效能: +${suggestion.impact?.performance || 0}%</span>
                <span>📦 檔案: -${suggestion.impact?.bundle || 0}KB</span>
                <span>⚡ 難度: ${suggestion.difficulty}</span>
                <span>💥 破壞性: ${suggestion.breaking ? '是' : '否'}</span>
            </div>
        </div>`;
            }
        }
        html += `
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #6c757d; text-align: center;">
        此報告由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成
    </footer>
</body>
</html>`;
        return html;
    }
    /**
     * 格式化為純文字報告
     */
    formatTextReport(analysis) {
        const { summary, suggestions, riskAssessment } = analysis;
        let report = '程式碼現代化分析報告\n';
        report += '='.repeat(50) + '\n\n';
        report += '執行摘要:\n';
        report += `---------\n`;
        report += `掃描檔案數量: ${summary.totalFiles}\n`;
        report += `現代化建議: ${summary.totalSuggestions}\n`;
        report += `潜在效能提升: ${summary.potentialPerformanceGain}%\n`;
        report += `檔案大小減少: ${summary.bundleSizeReduction}KB\n\n`;
        report += `風險評估: ${riskAssessment.overallRisk.toUpperCase()}\n`;
        report += `預估工時: ${riskAssessment.migrationEffort.estimatedHours} 小時\n\n`;
        if (suggestions.length > 0) {
            report += '主要建議:\n';
            report += '---------\n';
            for (const suggestion of suggestions.slice(0, 5)) {
                report += `${suggestion.title}\n`;
                report += `${suggestion.description}\n`;
                report += `難度: ${suggestion.difficulty}, 破壞性: ${suggestion.breaking ? '是' : '否'}\n`;
                report += '-'.repeat(40) + '\n';
            }
        }
        return report;
    }
    /**
     * 按類型分組建議
     */
    groupSuggestionsByType(suggestions) {
        const groups = new Map();
        for (const suggestion of suggestions) {
            const type = suggestion.type;
            if (!groups.has(type)) {
                groups.set(type, []);
            }
            groups.get(type).push(suggestion);
        }
        // 按優先順序排序類型
        const sortedGroups = new Map();
        const typeOrder = ['library-replacement', 'api-modernization', 'syntax-modernization', 'pattern-modernization'];
        for (const type of typeOrder) {
            if (groups.has(type)) {
                sortedGroups.set(type, groups.get(type));
            }
        }
        return sortedGroups;
    }
    /**
     * 取得類型圖示
     */
    getTypeIcon(type) {
        const icons = {
            'library-replacement': '📚',
            'api-modernization': '🔄',
            'syntax-modernization': '✨',
            'pattern-modernization': '🎨'
        };
        return icons[type] || '🔧';
    }
    /**
     * 取得類型顯示名稱
     */
    getTypeDisplayName(type) {
        const names = {
            'library-replacement': '函式庫替換',
            'api-modernization': 'API 現代化',
            'syntax-modernization': '語法現代化',
            'pattern-modernization': '模式現代化'
        };
        return names[type] || type;
    }
    /**
     * 取得風險圖示
     */
    getRiskIcon(risk) {
        const icons = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🔴'
        };
        return icons[risk] || '⚪';
    }
    /**
     * HTML 轉義
     * 將特殊字元轉換為 HTML entities，防止 XSS 攻擊
     */
    escapeHtml(text) {
        if (!text)
            return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
//# sourceMappingURL=report-formatter.js.map
;// CONCATENATED MODULE: ./dist/src/services/caniuse-service.js
/**
 * Can I Use API 服務
 * 動態查詢瀏覽器相容性資料
 */
/**
 * Can I Use 服務
 */
class CanIUseService {
    // 官方 Can I Use GitHub 資料來源（主要）
    dataUrls = [
        'https://raw.githubusercontent.com/Fyrd/caniuse/main/data.json',
        'https://cdn.jsdelivr.net/npm/caniuse-db@latest/data.json',
        'https://raw.githubusercontent.com/nicxvan/caniuse/main/fulldata-json/data-2.0.json'
    ];
    cachedData = null;
    cacheTime = 0;
    cacheDuration = 24 * 60 * 60 * 1000; // 24 小時
    /**
     * 載入 Can I Use 資料（支援 fallback）
     */
    async loadData() {
        // 檢查快取
        if (this.cachedData && Date.now() - this.cacheTime < this.cacheDuration) {
            return this.cachedData;
        }
        let lastError = null;
        // 嘗試所有資料來源
        for (const url of this.dataUrls) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'DevAdvisor-MCP/1.0'
                    }
                });
                if (!response.ok) {
                    lastError = new Error(`Can I Use 資料載入失敗: ${response.status} (${url})`);
                    continue;
                }
                this.cachedData = await response.json();
                this.cacheTime = Date.now();
                return this.cachedData;
            }
            catch (error) {
                lastError = error;
                console.warn(`嘗試載入 ${url} 失敗，嘗試下一個來源...`);
            }
        }
        // 所有來源都失敗
        console.error('所有 Can I Use 資料來源都載入失敗:', lastError);
        throw new Error(`Can I Use 資料載入失敗: 所有資料來源都無法存取`);
    }
    /**
     * 搜尋功能
     */
    async searchFeature(query) {
        const data = await this.loadData();
        const features = data.data || {};
        const lowerQuery = query.toLowerCase();
        const matches = [];
        for (const [id, feature] of Object.entries(features)) {
            let score = 0;
            // 完全匹配 ID
            if (id.toLowerCase() === lowerQuery) {
                score = 100;
            }
            // ID 包含查詢
            else if (id.toLowerCase().includes(lowerQuery)) {
                score = 80;
            }
            // 標題匹配
            else if (feature.title?.toLowerCase().includes(lowerQuery)) {
                score = 60;
            }
            // 描述匹配
            else if (feature.description?.toLowerCase().includes(lowerQuery)) {
                score = 40;
            }
            // 關鍵字匹配
            else if (feature.keywords?.toLowerCase().includes(lowerQuery)) {
                score = 30;
            }
            if (score > 0) {
                matches.push({ id, score });
            }
        }
        // 按分數排序並返回 ID
        return matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(m => m.id);
    }
    /**
     * 取得功能的瀏覽器支援資料
     */
    async getFeatureSupport(featureId) {
        const data = await this.loadData();
        const feature = data.data?.[featureId];
        if (!feature) {
            // 嘗試搜尋
            const matches = await this.searchFeature(featureId);
            if (matches.length > 0) {
                return this.getFeatureSupport(matches[0]);
            }
            return null;
        }
        const browsers = data.agents || {};
        return {
            featureId,
            title: feature.title || featureId,
            description: feature.description || '',
            status: feature.status || 'other',
            usage: this.calculateGlobalUsage(feature, browsers),
            categories: feature.categories || [],
            browsers: this.parseBrowserSupport(feature.stats, browsers),
            notes: this.parseNotes(feature.notes_by_num),
            links: feature.links?.map((l) => ({ url: l.url, title: l.title })),
            mdnUrl: feature.mdn_url,
            specUrl: feature.spec
        };
    }
    /**
     * 計算全球使用率
     */
    calculateGlobalUsage(feature, browsers) {
        // 簡化計算：基於主要瀏覽器的支援狀況
        const stats = feature.stats || {};
        let supportedUsage = 0;
        const majorBrowsers = ['chrome', 'firefox', 'safari', 'edge'];
        for (const browser of majorBrowsers) {
            const browserStats = stats[browser] || {};
            const latestVersion = Object.keys(browserStats).pop();
            if (latestVersion) {
                const support = browserStats[latestVersion];
                if (support?.startsWith('y') || support === 'y') {
                    supportedUsage += 25; // 每個主要瀏覽器約 25%
                }
                else if (support?.startsWith('a')) {
                    supportedUsage += 15;
                }
            }
        }
        return Math.min(supportedUsage, 100);
    }
    /**
     * 解析瀏覽器支援資料
     */
    parseBrowserSupport(stats, browsers) {
        const browserList = ['chrome', 'firefox', 'safari', 'edge', 'ie', 'opera', 'ios_saf', 'android', 'samsung'];
        const result = {};
        for (const browser of browserList) {
            const browserStats = stats?.[browser] || {};
            const versions = Object.entries(browserStats);
            // 找到第一個支援的版本
            let sinceVersion;
            let currentSupport = 'n';
            let hasPartialSupport = false;
            for (const [version, support] of versions) {
                if (support.startsWith('y') && !sinceVersion) {
                    sinceVersion = version;
                }
                if (support.startsWith('a')) {
                    hasPartialSupport = true;
                }
            }
            // 取得最新版本的支援狀態
            const latestVersion = versions[versions.length - 1];
            if (latestVersion) {
                const [, support] = latestVersion;
                currentSupport = support.charAt(0) || 'u';
            }
            result[browser] = {
                supported: currentSupport === 'y' || currentSupport === 'a',
                partialSupport: hasPartialSupport || currentSupport === 'a',
                sinceVersion,
                currentSupport
            };
        }
        return result;
    }
    /**
     * 解析備註
     */
    parseNotes(notesByNum) {
        if (!notesByNum)
            return undefined;
        return Object.values(notesByNum).slice(0, 5);
    }
    /**
     * 檢查 API 在目標瀏覽器中的相容性
     */
    async checkCompatibility(featureId, targetBrowsers = {
        chrome: '90',
        firefox: '88',
        safari: '14',
        edge: '90'
    }) {
        const support = await this.getFeatureSupport(featureId);
        if (!support) {
            return {
                feature: featureId,
                globalSupport: 0,
                supported: [],
                notSupported: Object.keys(targetBrowsers),
                partialSupport: [],
                recommendation: `找不到 ${featureId} 的相容性資料，建議查詢 MDN 文件`,
                polyfillAvailable: false
            };
        }
        const supported = [];
        const notSupported = [];
        const partialSupport = [];
        for (const [browser, targetVersion] of Object.entries(targetBrowsers)) {
            const browserSupport = support.browsers[browser];
            if (!browserSupport) {
                notSupported.push(browser);
                continue;
            }
            if (browserSupport.supported) {
                if (browserSupport.sinceVersion) {
                    const sinceNum = parseFloat(browserSupport.sinceVersion);
                    const targetNum = parseFloat(targetVersion);
                    if (sinceNum <= targetNum) {
                        if (browserSupport.partialSupport) {
                            partialSupport.push(`${browser} >= ${browserSupport.sinceVersion}`);
                        }
                        else {
                            supported.push(`${browser} >= ${browserSupport.sinceVersion}`);
                        }
                    }
                    else {
                        notSupported.push(`${browser} < ${browserSupport.sinceVersion}`);
                    }
                }
                else {
                    supported.push(browser);
                }
            }
            else {
                notSupported.push(browser);
            }
        }
        // 生成建議
        let recommendation = '';
        if (notSupported.length === 0) {
            recommendation = '✅ 所有目標瀏覽器都支援此功能';
        }
        else if (supported.length === 0) {
            recommendation = '❌ 此功能在目標瀏覽器中不受支援，需要 polyfill 或替代方案';
        }
        else {
            recommendation = `⚠️ 部分瀏覽器不支援：${notSupported.join(', ')}。建議提供 fallback 或使用 polyfill`;
        }
        return {
            feature: support.title,
            globalSupport: support.usage,
            supported,
            notSupported,
            partialSupport,
            recommendation,
            polyfillAvailable: this.checkPolyfillAvailable(featureId),
            polyfillUrl: this.getPolyfillUrl(featureId)
        };
    }
    /**
     * 檢查是否有 polyfill
     */
    checkPolyfillAvailable(featureId) {
        const polyfillableFeatures = [
            'fetch', 'promise', 'array-includes', 'object-assign',
            'string-includes', 'array-find', 'array-from', 'symbol',
            'map', 'set', 'weakmap', 'weakset', 'proxy', 'reflect',
            'intersectionobserver', 'resizeobserver', 'mutationobserver',
            'customelements', 'shadowdom', 'template', 'dialog'
        ];
        return polyfillableFeatures.some(f => featureId.toLowerCase().includes(f));
    }
    /**
     * 取得 polyfill URL
     */
    getPolyfillUrl(featureId) {
        // polyfill.io 服務
        const polyfillIoFeatures = {
            'fetch': 'fetch',
            'promise': 'Promise',
            'array-includes': 'Array.prototype.includes',
            'object-assign': 'Object.assign',
            'string-includes': 'String.prototype.includes',
            'array-find': 'Array.prototype.find',
            'array-from': 'Array.from',
            'symbol': 'Symbol',
            'map': 'Map',
            'set': 'Set',
            'weakmap': 'WeakMap',
            'weakset': 'WeakSet',
            'intersectionobserver': 'IntersectionObserver',
            'resizeobserver': 'ResizeObserver',
        };
        for (const [key, polyfillName] of Object.entries(polyfillIoFeatures)) {
            if (featureId.toLowerCase().includes(key)) {
                return `https://polyfill.io/v3/polyfill.min.js?features=${polyfillName}`;
            }
        }
        return undefined;
    }
    /**
     * 批次檢查多個功能的相容性
     */
    async checkMultipleFeatures(featureIds, targetBrowsers) {
        const reports = [];
        for (const featureId of featureIds) {
            const report = await this.checkCompatibility(featureId, targetBrowsers);
            reports.push(report);
        }
        return reports;
    }
    /**
     * 取得特定類別的功能列表
     */
    async getFeaturesByCategory(category) {
        const data = await this.loadData();
        const features = data.data || {};
        const matches = [];
        const lowerCategory = category.toLowerCase();
        for (const [id, feature] of Object.entries(features)) {
            const categories = feature.categories || [];
            if (categories.some((c) => c.toLowerCase().includes(lowerCategory))) {
                matches.push(id);
            }
        }
        return matches;
    }
}
/**
 * API 名稱到 Can I Use ID 的映射
 * 用於從常見的 API 呼叫名稱查詢對應的 caniuse feature ID
 */
const API_NAME_TO_CANIUSE = {
    // Fetch & Network
    'fetch': 'fetch',
    'AbortController': 'abortcontroller',
    'Headers': 'fetch',
    'Request': 'fetch',
    'Response': 'fetch',
    // DOM APIs
    'querySelector': 'queryselector',
    'querySelectorAll': 'queryselector',
    'classList': 'classlist',
    'MutationObserver': 'mutationobserver',
    'IntersectionObserver': 'intersectionobserver',
    'ResizeObserver': 'resizeobserver',
    // Storage
    'localStorage': 'namevalue-storage',
    'sessionStorage': 'namevalue-storage',
    'indexedDB': 'indexeddb',
    'IndexedDB': 'indexeddb',
    // Media
    'getUserMedia': 'stream',
    'MediaRecorder': 'mediarecorder',
    'AudioContext': 'audio-api',
    // Graphics
    'canvas': 'canvas',
    'getContext': 'canvas',
    'WebGL': 'webgl',
    'WebGL2': 'webgl2',
    // Async
    'Promise': 'promises',
    'Worker': 'webworkers',
    'SharedWorker': 'sharedworkers',
    'ServiceWorker': 'serviceworkers',
    // URL
    'URL': 'url',
    'URLSearchParams': 'urlsearchparams',
    // Events
    'CustomEvent': 'customevent',
    'BroadcastChannel': 'broadcastchannel',
    'WebSocket': 'websockets',
    'EventSource': 'eventsource',
    // File
    'FileReader': 'fileapi',
    'Blob': 'blobbuilder',
    'File': 'fileapi',
    // Location & Notification
    'geolocation': 'geolocation',
    'Notification': 'notifications',
    // Intl
    'Intl.DateTimeFormat': 'internationalization',
    'Intl.NumberFormat': 'internationalization',
    // Crypto
    'crypto.randomUUID': 'mdn-api_crypto_randomuuid',
    'crypto.subtle': 'cryptography',
    // Animation
    'requestAnimationFrame': 'requestanimationframe',
    'animate': 'web-animation',
    // ES6+
    'Proxy': 'proxy',
    'Symbol': 'es6',
    'Map': 'es6',
    'Set': 'es6',
    'WeakMap': 'es6',
    'WeakSet': 'es6',
    'Array.from': 'array-from',
    'Array.includes': 'array-includes',
    'Object.assign': 'object-assign',
    'Object.entries': 'object-entries',
    'Object.values': 'object-values',
    'String.padStart': 'pad-start-end',
    'String.padEnd': 'pad-start-end',
    'Array.flat': 'array-flat',
    'Array.flatMap': 'array-flat',
    'BigInt': 'bigint',
};
/**
 * 從 API 名稱取得 Can I Use ID
 */
function getCaniuseIdFromApiName(apiName) {
    // 直接匹配
    if (API_NAME_TO_CANIUSE[apiName]) {
        return API_NAME_TO_CANIUSE[apiName];
    }
    // 嘗試匹配部分名稱
    for (const [key, value] of Object.entries(API_NAME_TO_CANIUSE)) {
        if (apiName.includes(key) || key.includes(apiName)) {
            return value;
        }
    }
    return null;
}
/**
 * 建立 Can I Use 服務實例
 */
function createCanIUseService() {
    return new CanIUseService();
}
//# sourceMappingURL=caniuse-service.js.map
;// CONCATENATED MODULE: ./action/analyzer.js

/**
 * 分析執行器
 * 直接調用分析器類別，不依賴 MCP 協議
 */







/**
 * 執行現代化分析
 */
async function runModernizationAnalysis(projectPath, includePatterns, excludePatterns) {
  const parser = new CodeParser();
  const analyzer = new ModernizationAnalyzer(parser);
  const formatter = new ReportFormatter();

  const analysis = await analyzer.analyze(projectPath, includePatterns, excludePatterns);
  const report = formatter.formatModernizationReport(analysis, 'markdown');

  return {
    analysis,
    report,
    summary: {
      totalFiles: analysis.summary.totalFiles,
      totalSuggestions: analysis.summary.totalSuggestions,
      performanceGain: analysis.summary.potentialPerformanceGain,
      bundleReduction: analysis.summary.bundleSizeReduction,
      risk: analysis.riskAssessment.overallRisk
    }
  };
}

/**
 * 執行相容性分析
 */
async function runCompatibilityAnalysis(projectPath, includePatterns, excludePatterns, browserslistConfig) {
  const parser = new CodeParser();
  const canIUseService = new CanIUseService();
  const analyzer = new CompatibilityAnalyzer(parser, canIUseService);

  const analysis = await analyzer.analyze(
    projectPath,
    includePatterns,
    excludePatterns,
    browserslistConfig || undefined
  );

  const report = formatCompatibilityReport(analysis, 'markdown');

  return {
    analysis,
    report,
    summary: {
      totalApis: analysis.summary.totalApisAnalyzed,
      compatibleApis: analysis.summary.compatibleApis,
      incompatibleApis: analysis.summary.incompatibleApis,
      overallCompatibility: analysis.summary.overallCompatibility,
      polyfillsNeeded: analysis.summary.polyfillsNeeded
    }
  };
}

/**
 * 執行所有分析
 */
async function runAllAnalyses(options) {
  const {
    projectPath,
    includePatterns,
    excludePatterns,
    browserslistConfig,
    enableModernization,
    enableCompatibility
  } = options;

  const results = {
    modernization: null,
    compatibility: null,
    errors: []
  };

  // 執行現代化分析
  if (enableModernization) {
    try {
      results.modernization = await runModernizationAnalysis(
        projectPath,
        includePatterns,
        excludePatterns
      );
    } catch (error) {
      results.errors.push({
        type: 'modernization',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // 執行相容性分析
  if (enableCompatibility) {
    try {
      results.compatibility = await runCompatibilityAnalysis(
        projectPath,
        includePatterns,
        excludePatterns,
        browserslistConfig
      );
    } catch (error) {
      results.errors.push({
        type: 'compatibility',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}



/***/ })

};

//# sourceMappingURL=361.index.js.map