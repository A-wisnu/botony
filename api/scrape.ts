import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeJournals, JournalItem } from './utils/scraper.js';
import { generateReport } from './utils/generateReport.js';

interface ScrapeRequestBody {
    query: string;
    limit?: number;
}

interface ScrapeResponse {
    success: boolean;
    data?: Array<{
        title: string;
        link: string;
        authors: string;
        isValid: boolean;
    }>;
    report?: string;
    error?: string;
    message?: string;
}

/**
 * POST /api/scrape
 * 
 * Scrapes academic journals from DOAJ based on the query,
 * verifies links, and generates a Word document report.
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    // CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.',
        } as ScrapeResponse);
        return;
    }

    try {
        const body = req.body as ScrapeRequestBody;

        // Validate input
        if (!body.query || typeof body.query !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Missing or invalid "query" parameter. Expected a non-empty string.',
            } as ScrapeResponse);
            return;
        }

        const query = body.query.trim();
        if (query.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Query cannot be empty.',
            } as ScrapeResponse);
            return;
        }

        // Cap limit to prevent timeout (10-20 max for Vercel free tier)
        const limit = Math.min(Math.max(1, body.limit || 10), 20);

        console.log(`[Scrape] Starting scrape for query: "${query}", limit: ${limit}`);

        // Step 1: Scrape journals from DOAJ (includes link validation)
        const scrapedItems = await scrapeJournals(query, limit);
        console.log(`[Scrape] Found ${scrapedItems.length} items`);

        if (scrapedItems.length === 0) {
            res.status(200).json({
                success: true,
                data: [],
                message: 'No results found for the given query.',
            } as ScrapeResponse);
            return;
        }

        // Step 2: Convert to VerifiedJournalItem format for report generation
        const verifiedItems = scrapedItems.map(item => ({
            ...item,
            isValid: item.isValid ?? false,
        }));

        const validCount = verifiedItems.filter((i) => i.isValid).length;
        console.log(`[Scrape] Valid links: ${validCount}/${verifiedItems.length}`);

        // Step 3: Generate Word document report
        console.log('[Scrape] Generating Word report...');
        const reportBase64 = await generateReport(query, verifiedItems);
        console.log('[Scrape] Report generated successfully');

        // Step 4: Return response
        const response: ScrapeResponse = {
            success: true,
            data: verifiedItems.map((item) => ({
                title: item.title,
                link: item.link,
                authors: item.authors,
                isValid: item.isValid,
            })),
            report: reportBase64,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('[Scrape] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        res.status(500).json({
            success: false,
            error: errorMessage,
        } as ScrapeResponse);
    }
}
