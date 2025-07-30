
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import {v4 as uuidv4} from 'uuid';

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadsDirExists() {
    try {
        await fs.access(uploadsDir);
    } catch (e) {
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}

export async function POST(request: Request) {
    await ensureUploadsDirExists();
    
    try {
        const body = await request.json();
        const base64Image = body.image;

        if (!base64Image || !base64Image.startsWith('data:image')) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
        }

        // Extract mime type and base64 data
        const matches = base64Image.match(/^data:(image\/(\w+));base64,(.+)$/);
        if (!matches || matches.length !== 4) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        const mimeType = matches[1];
        const extension = matches[2];
        const imageData = matches[3];

        const buffer = Buffer.from(imageData, 'base64');
        const filename = `${uuidv4()}.${extension}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Error in upload API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
