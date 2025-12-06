/**
 * 檔案分析快取系統
 * 避免重複解析未修改的檔案，提升大型專案的分析效能
 */
import { ParsedFile } from '../parsers/index.js';
/**
 * 快取統計
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
}
/**
 * 檔案快取管理器
 */
export declare class FileCache {
    private cache;
    private stats;
    private cacheDir;
    private cacheFile;
    private maxAge;
    private maxSize;
    constructor(options?: {
        cacheDir?: string;
        maxAge?: number;
        maxSize?: number;
    });
    /**
     * 計算檔案內容的雜湊值
     */
    private getFileHash;
    /**
     * 取得檔案的修改時間
     */
    private getFileMtime;
    /**
     * 從快取取得分析結果
     */
    get(filePath: string, content: string): ParsedFile | null;
    /**
     * 快速檢查（只用修改時間，不計算雜湊）
     */
    quickCheck(filePath: string): ParsedFile | null;
    /**
     * 儲存分析結果到快取
     */
    set(filePath: string, content: string, result: ParsedFile): void;
    /**
     * 清除指定檔案的快取
     */
    invalidate(filePath: string): void;
    /**
     * 清除所有快取
     */
    clear(): void;
    /**
     * 清除過期的快取項目
     */
    private evictOldEntries;
    /**
     * 取得快取統計
     */
    getStats(): CacheStats & {
        hitRate: string;
    };
    /**
     * 將快取持久化到磁碟
     */
    saveToDisk(): void;
    /**
     * 從磁碟載入快取元資料（只載入 hash 和 mtime，不載入結果）
     */
    loadFromDisk(): void;
}
export declare function getGlobalCache(): FileCache;
export declare function resetGlobalCache(): void;
export {};
//# sourceMappingURL=cache.d.ts.map