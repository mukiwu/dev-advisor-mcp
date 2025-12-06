/**
 * 現代化分析器單元測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModernizationAnalyzer } from '../../analyzers/modernization.js';
import { CodeParser } from '../../parsers/index.js';

describe('ModernizationAnalyzer', () => {
  let analyzer: ModernizationAnalyzer;
  let parser: CodeParser;

  beforeEach(() => {
    parser = new CodeParser();
    analyzer = new ModernizationAnalyzer(parser);
  });

  describe('var 宣告檢測', () => {
    it('應該檢測 var 宣告並建議使用 let/const', () => {
      const code = `var x = 1; var y = 2;`;
      const parsed = parser.parseCode(code, 'test.js');
      
      // 使用 private 方法需要用 type assertion
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('var-to') && s.type === 'syntax-modernization'
      )).toBe(true);
    });

    it('應該為函式賦值建議使用 const', () => {
      const code = `var myFunc = function() { return 1; };`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id === 'var-to-const'
      )).toBe(true);
    });
  });

  describe('函式庫檢測', () => {
    it('應該檢測 jQuery import', () => {
      const code = `import $ from 'jquery';`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('jquery') && s.type === 'library-replacement'
      )).toBe(true);
    });

    it('應該檢測 Moment.js import', () => {
      const code = `import moment from 'moment';`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('moment') && s.type === 'library-replacement'
      )).toBe(true);
    });

    it('應該檢測 Lodash import', () => {
      const code = `import _ from 'lodash';`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('lodash') && s.type === 'library-replacement'
      )).toBe(true);
    });
  });

  describe('IIFE 檢測', () => {
    it('應該檢測 IIFE 模式', () => {
      const code = `(function() { var x = 1; })();`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('iife-to-module')
      )).toBe(true);
    });

    it('應該檢測箭頭函式 IIFE', () => {
      const code = `(() => { const x = 1; })();`;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('iife-to-module')
      )).toBe(true);
    });
  });

  describe('for 迴圈檢測', () => {
    it('應該檢測可轉換為 forEach 的 for 迴圈', () => {
      const code = `
        const arr = [1, 2, 3];
        for (let i = 0; i < arr.length; i++) {
          console.log(arr[i]);
        }
      `;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('for-to-') && s.type === 'pattern-modernization'
      )).toBe(true);
    });

    it('應該檢測 for...in 迴圈', () => {
      const code = `
        const obj = { a: 1 };
        for (const key in obj) {
          console.log(key);
        }
      `;
      const parsed = parser.parseCode(code, 'test.js');
      const result = (analyzer as any).analyzeFile(parsed);
      
      expect(result.suggestions.some((s: any) => 
        s.id.includes('for-in-to-for-of')
      )).toBe(true);
    });
  });

  describe('風險評估', () => {
    it('低風險變更應該回傳低風險等級', () => {
      const suggestions = [
        { breaking: false, difficulty: 'trivial', type: 'syntax-modernization' }
      ];
      const risk = (analyzer as any).assessRisk(suggestions);
      
      expect(risk.overallRisk).toBe('low');
    });

    it('多個破壞性變更應該回傳高風險等級', () => {
      const suggestions = Array(10).fill({ 
        breaking: true, 
        difficulty: 'complex',
        type: 'library-replacement'
      });
      const risk = (analyzer as any).assessRisk(suggestions);
      
      expect(risk.overallRisk).toBe('high');
    });

    it('應該正確計算預估工時', () => {
      const suggestions = [
        { breaking: true, difficulty: 'complex' },   // 8 hours
        { breaking: true, difficulty: 'moderate' },  // 2 hours
        { breaking: false, difficulty: 'simple' },   // 0.5 hours
        { breaking: false, difficulty: 'trivial' }   // 0.5 hours
      ];
      const risk = (analyzer as any).assessRisk(suggestions);
      
      expect(risk.migrationEffort.estimatedHours).toBe(11); // 8 + 2 + 0.5 + 0.5
    });
  });
});

describe('CodeParser', () => {
  let parser: CodeParser;

  beforeEach(() => {
    parser = new CodeParser();
  });

  describe('ES Module 解析', () => {
    it('應該解析 default import', () => {
      const code = `import React from 'react';`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.imports).toHaveLength(1);
      expect(result.imports[0].source).toBe('react');
      expect(result.imports[0].specifiers[0].type).toBe('default');
    });

    it('應該解析 named imports', () => {
      const code = `import { useState, useEffect } from 'react';`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.imports).toHaveLength(1);
      expect(result.imports[0].specifiers).toHaveLength(2);
      expect(result.imports[0].specifiers[0].imported).toBe('useState');
    });

    it('應該解析 namespace import', () => {
      const code = `import * as React from 'react';`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.imports[0].specifiers[0].type).toBe('namespace');
    });
  });

  describe('CommonJS 解析', () => {
    it('應該解析 require()', () => {
      const code = `const fs = require('fs');`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.imports.some(i => i.source === 'fs')).toBe(true);
    });

    it('應該解析解構 require()', () => {
      const code = `const { readFile, writeFile } = require('fs');`;
      const result = parser.parseCode(code, 'test.js');
      
      const fsImport = result.imports.find(i => i.source === 'fs');
      expect(fsImport).toBeDefined();
      expect(fsImport?.specifiers.some(s => s.imported === 'readFile')).toBe(true);
    });
  });

  describe('函式解析', () => {
    it('應該解析函式宣告', () => {
      const code = `function myFunc(a, b) { return a + b; }`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.functions.some(f => f.name === 'myFunc')).toBe(true);
    });

    it('應該解析 async 函式', () => {
      const code = `async function fetchData() { return await fetch('/api'); }`;
      const result = parser.parseCode(code, 'test.js');
      
      const asyncFunc = result.functions.find(f => f.name === 'fetchData');
      expect(asyncFunc?.isAsync).toBe(true);
    });

    it('應該解析箭頭函式', () => {
      const code = `const add = (a, b) => a + b;`;
      const result = parser.parseCode(code, 'test.js');
      
      expect(result.functions.some(f => f.isArrow)).toBe(true);
    });
  });

  describe('API 呼叫解析', () => {
    it('應該解析方法呼叫', () => {
      const code = `document.getElementById('app');`;
      const result = parser.parseCode(code, 'test.js');
      
      const call = result.apiCalls.find(c => 
        c.api === 'document' && c.method === 'getElementById'
      );
      expect(call).toBeDefined();
    });

    it('應該解析函式呼叫', () => {
      const code = `console.log('hello');`;
      const result = parser.parseCode(code, 'test.js');
      
      const call = result.apiCalls.find(c => 
        c.api === 'console' && c.method === 'log'
      );
      expect(call).toBeDefined();
    });
  });
});


