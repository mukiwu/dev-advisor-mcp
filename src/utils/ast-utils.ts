/**
 * AST 工具函式
 * 提供共用的 AST 遍歷和分析功能
 */

export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  range?: [number, number];
  [key: string]: any;
}

/**
 * 遍歷 AST 樹
 */
export function traverseAST(node: ASTNode | null | undefined, visitor: (node: ASTNode) => void): void {
  if (!node || typeof node !== 'object') return;

  visitor(node);

  for (const key in node) {
    const child = node[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && item.type) {
            traverseAST(item, visitor);
          }
        }
      } else if (child.type) {
        traverseAST(child, visitor);
      }
    }
  }
}

/**
 * 取得節點名稱
 */
export function getNodeName(node: ASTNode | null | undefined): string {
  if (!node) return '';

  switch (node.type) {
    case 'Identifier':
      return node.name || '';
    case 'MemberExpression':
      const obj = getNodeName(node.object);
      const prop = getNodeName(node.property);
      return obj && prop ? `${obj}.${prop}` : obj || prop;
    case 'ThisExpression':
      return 'this';
    case 'Literal':
      return String(node.value);
    default:
      return node.type;
  }
}

/**
 * 取得節點值
 */
export function getNodeValue(node: ASTNode | null | undefined): any {
  if (!node) return null;

  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Identifier':
      return node.name;
    case 'ArrayExpression':
      return (node.elements || []).map((el: any) => getNodeValue(el));
    case 'ObjectExpression':
      const obj: Record<string, any> = {};
      for (const prop of node.properties || []) {
        if (prop.type === 'Property') {
          const key = getNodeValue(prop.key);
          const value = getNodeValue(prop.value);
          obj[key] = value;
        }
      }
      return obj;
    case 'TemplateLiteral':
      return node.quasis?.map((q: any) => q.value?.raw || '').join('${...}') || '';
    default:
      return `<${node.type}>`;
  }
}

/**
 * 檢查節點是否是特定類型的函式
 */
export function isFunction(node: ASTNode): boolean {
  return ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type);
}

/**
 * 檢查節點是否是 IIFE (立即執行函式表達式)
 */
export function isIIFE(node: ASTNode): boolean {
  if (node.type !== 'CallExpression') return false;
  
  const callee = node.callee;
  if (!callee) return false;
  
  // (function() {})() 或 (() => {})()
  if (callee.type === 'FunctionExpression' || callee.type === 'ArrowFunctionExpression') {
    return true;
  }
  
  // (function() {})() 被括號包裹的情況
  if (callee.type === 'SequenceExpression' && callee.expressions?.length === 1) {
    const expr = callee.expressions[0];
    return expr.type === 'FunctionExpression' || expr.type === 'ArrowFunctionExpression';
  }
  
  return false;
}

/**
 * 檢查是否是 error-first callback 模式
 * callback(err, result) 格式
 */
export function isErrorFirstCallback(params: ASTNode[]): boolean {
  if (params.length < 1) return false;
  
  const firstParam = params[0];
  if (firstParam.type !== 'Identifier') return false;
  
  const name = firstParam.name?.toLowerCase() || '';
  return name.includes('err') || name === 'e' || name === 'error';
}

/**
 * 檢查是否是可轉換為陣列方法的 for 迴圈
 */
export function isConvertibleForLoop(node: ASTNode): { 
  convertible: boolean; 
  suggestedMethod?: 'map' | 'filter' | 'forEach' | 'reduce' | 'find' | 'some' | 'every';
  reason?: string;
} {
  if (node.type !== 'ForStatement') {
    return { convertible: false };
  }

  // 檢查是否是標準的 for (let i = 0; i < arr.length; i++) 模式
  const init = node.init;
  const test = node.test;
  const update = node.update;
  const body = node.body;

  if (!init || !test || !update || !body) {
    return { convertible: false };
  }

  // 檢查初始化是否是 let/var i = 0
  if (init.type !== 'VariableDeclaration') {
    return { convertible: false };
  }

  // 檢查是否有 .length 比較
  if (test.type !== 'BinaryExpression' || 
      (test.operator !== '<' && test.operator !== '<=')) {
    return { convertible: false };
  }

  // 檢查是否是 i++ 或 i += 1
  if (update.type !== 'UpdateExpression' && update.type !== 'AssignmentExpression') {
    return { convertible: false };
  }

  // 分析迴圈體來決定建議的方法
  const bodyStatements = body.type === 'BlockStatement' ? body.body : [body];
  
  // 檢查是否有 push 操作 (可能是 map 或 filter)
  let hasPush = false;
  let hasConditional = false;
  let hasReturn = false;

  traverseAST(body, (childNode) => {
    if (childNode.type === 'CallExpression') {
      const callee = childNode.callee;
      if (callee?.type === 'MemberExpression' && 
          callee.property?.name === 'push') {
        hasPush = true;
      }
    }
    if (childNode.type === 'IfStatement') {
      hasConditional = true;
    }
    if (childNode.type === 'ReturnStatement') {
      hasReturn = true;
    }
  });

  if (hasPush && hasConditional) {
    return { 
      convertible: true, 
      suggestedMethod: 'filter',
      reason: '迴圈包含條件判斷和 push 操作，可使用 filter'
    };
  }
  
  if (hasPush) {
    return { 
      convertible: true, 
      suggestedMethod: 'map',
      reason: '迴圈包含 push 操作，可使用 map'
    };
  }

  if (hasReturn) {
    return { 
      convertible: true, 
      suggestedMethod: 'find',
      reason: '迴圈包含提前返回，可使用 find 或 some'
    };
  }

  return { 
    convertible: true, 
    suggestedMethod: 'forEach',
    reason: '標準迴圈模式，可使用 forEach'
  };
}

/**
 * 生成位置資訊
 */
export function getLocation(node: ASTNode): { line: number; column: number } | undefined {
  if (node.loc) {
    return { line: node.loc.start.line, column: node.loc.start.column };
  }
  return undefined;
}


