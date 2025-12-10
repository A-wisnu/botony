import {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel,
    ExternalHyperlink,
    BorderStyle,
    Packer,
} from 'docx';
import { JournalItem } from './scraper.js';

// Use JournalItem directly since it now includes isValid
export interface VerifiedJournalItem extends JournalItem {
    isValid: boolean;
}

/**
 * Generates a Word document (.docx) containing the journal search results
 * Returns a Base64 encoded string (no file system writes for Vercel compatibility)
 */
export async function generateReport(
    query: string,
    items: VerifiedJournalItem[]
): Promise<string> {
    const validCount = items.filter((i) => i.isValid).length;
    const invalidCount = items.length - validCount;

    const doc = new Document({
        creator: 'Botani Journal Scraper',
        title: `Journal Search Results: ${query}`,
        description: 'Academic journal search results with link verification',
        sections: [
            {
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        text: 'Journal Search Report',
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Subtitle with search query
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Search Query: "${query}"`,
                                italics: true,
                                size: 24,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),

                    // Generated timestamp
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Generated: ${new Date().toLocaleString()}`,
                                size: 20,
                                color: '666666',
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Summary statistics
                    new Paragraph({
                        text: 'Summary',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Total Results: ${items.length}`, size: 22 }),
                        ],
                        spacing: { after: 80 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Valid Links: ${validCount}`,
                                size: 22,
                                color: '28a745',
                            }),
                        ],
                        spacing: { after: 80 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Invalid Links: ${invalidCount}`,
                                size: 22,
                                color: 'dc3545',
                            }),
                        ],
                        spacing: { after: 300 },
                    }),

                    // Results section header
                    new Paragraph({
                        text: 'Search Results',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 200 },
                    }),

                    // Results table
                    createResultsTable(items),
                ],
            },
        ],
    });

    // Generate document as buffer (in-memory)
    const buffer = await Packer.toBuffer(doc);

    // Convert to Base64 string
    return buffer.toString('base64');
}

/**
 * Creates a formatted table of journal results
 */
function createResultsTable(items: VerifiedJournalItem[]): Table {
    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            createHeaderCell('#', 500),
            createHeaderCell('Title', 4000),
            createHeaderCell('Authors', 2500),
            createHeaderCell('Status', 1000),
        ],
    });

    const dataRows = items.map((item, index) =>
        new TableRow({
            children: [
                createDataCell(String(index + 1)),
                createLinkCell(item.title, item.link),
                createDataCell(item.authors || 'N/A'),
                createStatusCell(item.isValid),
            ],
        })
    );

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}

function createHeaderCell(text: string, width: number): TableCell {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        shading: { fill: '4a90d9' },
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text,
                        bold: true,
                        color: 'FFFFFF',
                        size: 22,
                    }),
                ],
                alignment: AlignmentType.CENTER,
            }),
        ],
    });
}

function createDataCell(text: string): TableCell {
    return new TableCell({
        children: [
            new Paragraph({
                children: [new TextRun({ text, size: 20 })],
            }),
        ],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
    });
}

function createLinkCell(title: string, url: string): TableCell {
    const children = url
        ? [
            new ExternalHyperlink({
                children: [
                    new TextRun({
                        text: title,
                        style: 'Hyperlink',
                        size: 20,
                    }),
                ],
                link: url,
            }),
        ]
        : [new TextRun({ text: title, size: 20 })];

    return new TableCell({
        children: [new Paragraph({ children })],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
    });
}

function createStatusCell(isValid: boolean): TableCell {
    return new TableCell({
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: isValid ? '✓ Valid' : '✗ Invalid',
                        color: isValid ? '28a745' : 'dc3545',
                        bold: true,
                        size: 20,
                    }),
                ],
                alignment: AlignmentType.CENTER,
            }),
        ],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
    });
}
