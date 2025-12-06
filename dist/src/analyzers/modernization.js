import { ModernizationRules } from '../data/modernization-rules.js';
/**
 * 程式碼現代化分析器
 * 掃描程式碼找出可現代化的部分，提供升級建議
 */
export class ModernizationAnalyzer {
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