class GoldMarketDB {
    constructor() {
        this.dbName = 'GoldMarketDB';
        this.dbVersion = 1;
        this.storeName = 'prices';
        this.maxAgeMs = 180 * 24 * 60 * 60 * 1000; // 180 days
    }

    async open() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'timestamp' });
                    store.createIndex('timestamp', 'timestamp', { unique: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async savePriceData(data) {
        await this.open();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const record = {
                ...data,
                timestamp: Date.now()
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(record);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async pruneOldData() {
        await this.open();
        return new Promise((resolve, reject) => {
            const cutoffTime = Date.now() - this.maxAgeMs;
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const range = IDBKeyRange.upperBound(cutoffTime);

            const request = index.openCursor(range);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async getHistoryByTime(sinceMs) {
        await this.open();
        return new Promise((resolve, reject) => {
            const cutoff = Date.now() - sinceMs;
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const range = IDBKeyRange.lowerBound(cutoff);

            const request = index.getAll(range);
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async getLatestRecord() {
        await this.open();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');

            const request = index.openCursor(null, 'prev');
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) resolve(cursor.value);
                else resolve(null);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }
}

// Export for Service Worker context
if (typeof self !== 'undefined') {
    self.GoldMarketDB = GoldMarketDB;
}
