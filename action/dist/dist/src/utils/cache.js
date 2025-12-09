/**
 * 檔案分析快取系統
 * 避免重複解析未修改的檔案，提升大型專案的分析效能
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
/**
 * 檔案快取管理器
 */
export class FileCache {
    cache = new Map();
    stats = { hits: 0, misses: 0, size: 0 };
    cacheDir;
    cacheFile;
    maxAge; // 快取有效期（毫秒）
    maxSize; // 最大快取項目數
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || '.devadvisor-cache';
        this.cacheFile = join(this.cacheDir, 'analysis-cache.json');
        this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 預設 24 小時
        this.maxSize = options.maxSize || 1000; // 預設最多 1000 個項目
    }
    /**
     * 計算檔案內容的雜湊值
     */
    getFileHash(content) {
        return createHash('md5').update(content).digest('hex');
    }
    /**
     * 取得檔案的修改時間
     */
    getFileMtime(filePath) {
        try {
            return statSync(filePath).mtimeMs;
        }
        catch {
            return 0;
        }
    }
    /**
     * 從快取取得分析結果
     */
    get(filePath, content) {
        const entry = this.cache.get(filePath);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        // 檢查快取是否過期
        const now = Date.now();
        if (now - entry.timestamp > this.maxAge) {
            this.cache.delete(filePath);
            this.stats.misses++;
            return null;
        }
        // 檢查檔案是否已修改（透過雜湊比較）
        const currentHash = this.getFileHash(content);
        if (entry.hash !== currentHash) {
            this.cache.delete(filePath);
            this.stats.misses++;
            return null;
        }
        // 快取命中
        this.stats.hits++;
        return entry.result;
    }
    /**
     * 快速檢查（只用修改時間，不計算雜湊）
     */
    quickCheck(filePath) {
        const entry = this.cache.get(filePath);
        if (!entry) {
            return null;
        }
        // 檢查修改時間
        const currentMtime = this.getFileMtime(filePath);
        if (currentMtime !== entry.mtime) {
            return null;
        }
        return entry.result;
    }
    /**
     * 儲存分析結果到快取
     */
    set(filePath, content, result) {
        // 檢查快取大小，必要時清理舊項目
        if (this.cache.size >= this.maxSize) {
            this.evictOldEntries();
        }
        this.cache.set(filePath, {
            hash: this.getFileHash(content),
            mtime: this.getFileMtime(filePath),
            result,
            timestamp: Date.now()
        });
        this.stats.size = this.cache.size;
    }
    /**
     * 清除指定檔案的快取
     */
    invalidate(filePath) {
        this.cache.delete(filePath);
        this.stats.size = this.cache.size;
    }
    /**
     * 清除所有快取
     */
    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, size: 0 };
    }
    /**
     * 清除過期的快取項目
     */
    evictOldEntries() {
        const now = Date.now();
        const entriesToDelete = [];
        // 找出過期的項目
        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > this.maxAge) {
                entriesToDelete.push(key);
            }
        }
        // 如果過期項目不足以釋放空間，刪除最舊的項目
        if (entriesToDelete.length < this.maxSize * 0.1) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = Math.floor(this.maxSize * 0.2); // 移除 20%
            for (let i = 0; i < toRemove && i < entries.length; i++) {
                entriesToDelete.push(entries[i][0]);
            }
        }
        // 執行刪除
        for (const key of entriesToDelete) {
            this.cache.delete(key);
        }
        this.stats.size = this.cache.size;
    }
    /**
     * 取得快取統計
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0
            ? `${((this.stats.hits / total) * 100).toFixed(1)}%`
            : 'N/A';
        return {
            ...this.stats,
            hitRate
        };
    }
    /**
     * 將快取持久化到磁碟
     */
    saveToDisk() {
        try {
            const data = {
                version: 1,
                timestamp: Date.now(),
                entries: Array.from(this.cache.entries()).map(([key, value]) => ({
                    key,
                    hash: value.hash,
                    mtime: value.mtime,
                    timestamp: value.timestamp
                    // 不儲存 result，因為太大且包含無法序列化的內容
                }))
            };
            // 確保目錄存在
            const { mkdirSync } = require('fs');
            mkdirSync(this.cacheDir, { recursive: true });
            writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            // 忽略快取儲存失敗
            console.error('快取儲存失敗:', error);
        }
    }
    /**
     * 從磁碟載入快取元資料（只載入 hash 和 mtime，不載入結果）
     */
    loadFromDisk() {
        try {
            if (!existsSync(this.cacheFile)) {
                return;
            }
            const data = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
            // 檢查版本
            if (data.version !== 1) {
                return;
            }
            // 檢查是否過期
            if (Date.now() - data.timestamp > this.maxAge) {
                return;
            }
            // 只載入元資料，不載入結果
            // 這允許我們在下次分析時快速檢查檔案是否已變更
            // 但實際的 ParsedFile 結果仍需重新計算
        }
        catch (error) {
            // 忽略載入失敗
        }
    }
}
/**
 * 建立全域快取實例
 */
let globalCache = null;
export function getGlobalCache() {
    if (!globalCache) {
        globalCache = new FileCache();
    }
    return globalCache;
}
export function resetGlobalCache() {
    globalCache = null;
}
//# sourceMappingURL=cache.js.map