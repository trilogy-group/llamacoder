import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

// Configure a JWT auth client using environment variables
const jwtClient = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
  });

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const range = 'Sheet1!A:F';
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const issueType = formData.get('issueType') as string;
    const description = formData.get('description') as string;
    const severity = formData.get('severity') as string;
    const email = formData.get('email') as string;

    await jwtClient.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const drive = google.drive({ version: 'v3', auth: jwtClient });

    // Create a new folder for this feedback
    const feedbackFolderId = uuidv4().slice(0, 8);
    const feedbackFolderMetadata: drive_v3.Schema$File = {
      name: `Feedback_${feedbackFolderId}`,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (driveFolderId) {
      feedbackFolderMetadata.parents = [driveFolderId];
    }

    const feedbackFolder = await drive.files.create({
      requestBody: feedbackFolderMetadata,
      fields: 'id, webViewLink',
    });

    const attachmentLinks: string[] = [];

    // Upload all attachments
    const entries = Array.from(formData.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (key.startsWith('attachment') && value instanceof File) {
        const file = value as File;
        const fileMetadata: drive_v3.Schema$File = {
          name: file.name,
          parents: [feedbackFolder.data.id!],
        };

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const uploadedFile = await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: file.type,
            body: stream,
          },
          fields: 'id, webViewLink',
        });

        attachmentLinks.push(uploadedFile.data.webViewLink || '');
      }
    }

    const values = [
      [
        new Date().toISOString(),
        issueType,
        description,
        severity,
        email,
        feedbackFolder.data.webViewLink,
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({ success: true, response: response.data }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}