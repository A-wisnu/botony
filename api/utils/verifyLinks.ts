import axios from 'axios';
import { JournalItem } from './scraper.js';

export interface VerifiedJournalItem extends JournalItem {
    isValid: boolean;
}

/**
 * Verifies if links are accessible using lightweight HEAD requests
 * Runs in parallel with timeout to stay within Vercel limits
 */
export async function verifyLinks(items: JournalItem[]): Promise<VerifiedJournalItem[]> {
    const TIMEOUT_MS = 3000; // 3 second timeout per request
    const CONCURRENCY = 5; // Max concurrent requests to avoid rate limiting

    const verifyLink = async (item: JournalItem): Promise<VerifiedJournalItem> => {
        if (!item.link || item.link.trim() === '') {
            return { ...item, isValid: false };
        }

        try {
            const response = await axios.head(item.link, {
                timeout: TIMEOUT_MS,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                validateStatus: (status) => status < 400, // Accept any 2xx or 3xx status
                maxRedirects: 3,
            });

            return { ...item, isValid: response.status >= 200 && response.status < 400 };
        } catch (error) {
            // Try GET request as fallback (some servers don't support HEAD)
            try {
                const getResponse = await axios.get(item.link, {
                    timeout: TIMEOUT_MS,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Range': 'bytes=0-0', // Request only first byte to minimize data transfer
                    },
                    validateStatus: (status) => status < 400,
                    maxRedirects: 3,
                });

                return { ...item, isValid: getResponse.status >= 200 && getResponse.status < 400 };
            } catch {
                return { ...item, isValid: false };
            }
        }
    };

    // Process in batches for controlled concurrency
    const results: VerifiedJournalItem[] = [];

    for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(batch.map(verifyLink));
        results.push(...batchResults);
    }

    return results;
}
