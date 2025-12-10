import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JournalItem {
    title: string;
    authors: string;
    link: string;
    publisher?: string;
    isValid?: boolean;
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Quickly verify if a link is valid
 */
async function isLinkValid(url: string): Promise<boolean> {
    if (!url || url.trim() === '') return false;

    try {
        const response = await axios.head(url, {
            timeout: 3000,
            headers: {
                'User-Agent': getRandomUserAgent(),
            },
            validateStatus: (status) => status < 400,
            maxRedirects: 3,
        });
        return response.status >= 200 && response.status < 400;
    } catch {
        // Try GET as fallback for servers that don't support HEAD
        try {
            const response = await axios.get(url, {
                timeout: 3000,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Range': 'bytes=0-0',
                },
                validateStatus: (status) => status < 400,
                maxRedirects: 3,
            });
            return response.status >= 200 && response.status < 400;
        } catch {
            return false;
        }
    }
}

/**
 * Scrapes academic journals from DOAJ with link validation
 * Fetches extra results and filters to only return valid links
 */
export async function scrapeJournals(query: string, limit: number): Promise<JournalItem[]> {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    // Fetch more results than needed to filter invalid links
    const fetchLimit = Math.min(safeLimit * 3, 50);

    console.log(`[Scraper] Fetching up to ${fetchLimit} results, need ${safeLimit} valid`);

    const allResults = await fetchFromDoajApi(query, fetchLimit);
    console.log(`[Scraper] Got ${allResults.length} raw results`);

    // Validate links and collect valid ones until we have enough
    const validResults: JournalItem[] = [];

    for (const item of allResults) {
        if (validResults.length >= safeLimit) break;

        console.log(`[Scraper] Verifying: ${item.link.substring(0, 50)}...`);
        const isValid = await isLinkValid(item.link);

        if (isValid) {
            validResults.push({ ...item, isValid: true });
            console.log(`[Scraper] ✓ Valid (${validResults.length}/${safeLimit})`);
        } else {
            console.log(`[Scraper] ✗ Invalid, skipping`);
        }
    }

    console.log(`[Scraper] Found ${validResults.length} valid results`);

    // If we didn't get enough valid results, include some (marked as invalid)
    if (validResults.length < safeLimit) {
        const remaining = safeLimit - validResults.length;
        const invalidItems = allResults
            .filter(item => !validResults.some(v => v.link === item.link))
            .slice(0, remaining)
            .map(item => ({ ...item, isValid: false }));
        validResults.push(...invalidItems);
    }

    return validResults;
}

/**
 * Fetch articles from DOAJ API
 */
async function fetchFromDoajApi(query: string, limit: number): Promise<JournalItem[]> {
    try {
        const apiUrl = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}`;

        const response = await axios.get(apiUrl, {
            params: {
                page: 1,
                pageSize: limit,
            },
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'application/json',
            },
            timeout: 10000,
        });

        const results: JournalItem[] = [];

        if (response.data && response.data.results) {
            for (const article of response.data.results) {
                const bibjson = article.bibjson || {};

                // Extract all available links and pick the best one
                let link = '';
                if (bibjson.link && bibjson.link.length > 0) {
                    // Try each link type in order of preference
                    for (const linkObj of bibjson.link) {
                        if (linkObj.url) {
                            link = linkObj.url;
                            // Prefer fulltext links
                            if (linkObj.type === 'fulltext') break;
                        }
                    }
                }

                // Also try identifier.url as fallback
                if (!link && bibjson.identifier) {
                    for (const id of bibjson.identifier) {
                        if (id.type === 'doi' && id.id) {
                            link = `https://doi.org/${id.id}`;
                            break;
                        }
                    }
                }

                // Skip entries without links
                if (!link) continue;

                const authors = bibjson.author
                    ? bibjson.author.map((a: any) => a.name).filter(Boolean).join(', ')
                    : 'Unknown Author';

                const publisher = bibjson.journal?.publisher || 'Unknown Publisher';

                results.push({
                    title: bibjson.title || 'Untitled',
                    authors: authors || 'Unknown Author',
                    link,
                    publisher,
                });
            }
        }

        return results;
    } catch (error) {
        console.warn('[Scraper] DOAJ API failed:', error);
        return scrapeDoajHtml(query, limit);
    }
}

/**
 * Fallback HTML scraper for DOAJ search page
 */
async function scrapeDoajHtml(query: string, limit: number): Promise<JournalItem[]> {
    const searchUrl = `https://doaj.org/search/articles?ref=homepage-box&source=${encodeURIComponent(JSON.stringify({
        query: { query_string: { query, default_operator: 'AND' } }
    }))}`;

    try {
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const results: JournalItem[] = [];

        $('.search-results article, .result-item').each((index, element) => {
            if (index >= limit) return false;

            const $el = $(element);
            const title = $el.find('h3 a, .title a, .article-title').first().text().trim() || 'Untitled';
            const link = $el.find('h3 a, .title a, .article-title').first().attr('href') || '';
            const authors = $el.find('.authors, .author-list').first().text().trim() || 'Unknown Author';
            const publisher = $el.find('.publisher, .journal-title').first().text().trim() || 'Unknown Publisher';

            if (title && title !== 'Untitled' && link) {
                results.push({
                    title,
                    authors,
                    link: link.startsWith('http') ? link : `https://doaj.org${link}`,
                    publisher,
                });
            }
        });

        return results;
    } catch (error) {
        console.error('[Scraper] HTML scraping failed:', error);
        return [];
    }
}
