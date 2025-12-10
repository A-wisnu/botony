/**
 * API Service for Journal Scraping
 * Handles communication with the backend API
 */

const API_BASE = '/api';

/**
 * Scrape journals from DOAJ based on query
 * @param {string} query - Search query for journals
 * @param {number} limit - Maximum number of results (1-20)
 * @returns {Promise<{success: boolean, data: Array, report: string, error?: string}>}
 */
export async function scrapeJournals(query, limit = 10) {
    try {
        const response = await fetch(`${API_BASE}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query.trim(),
                limit: Math.min(Math.max(1, limit), 20),
            }),
        });

        // Check content type to handle non-JSON responses
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            // Server returned non-JSON (likely an error page)
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(
                response.status === 500
                    ? 'Server error. Make sure the Vercel dev server is running (npx vercel dev --listen 3000)'
                    : `Server error: ${text.substring(0, 100)}`
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP Error: ${response.status}`);
        }

        return result;
    } catch (error) {
        // Check if it's a network error (Vercel server not running)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to API. Make sure to run: npx vercel dev --listen 3000');
        }
        throw error;
    }
}

/**
 * Convert base64 string to Blob and trigger download
 * @param {string} base64 - Base64 encoded document
 * @param {string} filename - Name for the downloaded file
 */
export function downloadBase64File(base64, filename) {
    if (!base64) {
        throw new Error('No report data available');
    }

    // Decode base64 to binary
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
    }

    // Create blob and download
    const blob = new Blob(byteArrays, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
