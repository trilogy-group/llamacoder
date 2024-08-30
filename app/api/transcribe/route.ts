import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand, MediaFormat } from '@aws-sdk/client-transcribe';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  // Add this function at the beginning of your POST handler
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload file to S3
    const fileBuffer = await file.arrayBuffer();
    const fileKey = `uploads/${uuidv4()}-${file.name}`;
    console.log("Uploading file to: ", fileKey)
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: Buffer.from(fileBuffer),
    }));
    console.log("File uploaded to: ", fileKey)
    // Map file extension to MediaFormat
    const getMediaFormat = (extension: string): MediaFormat => {
      switch (extension.toLowerCase()) {
        case 'mp3':
          return MediaFormat.MP3;
        case 'mp4':
          return MediaFormat.MP4;
        case 'wav':
          return MediaFormat.WAV;
        case 'flac':
          return MediaFormat.FLAC;
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }
    };

    const fileExtension = file.name.split('.').pop();
    if (!fileExtension) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const mediaFormat = getMediaFormat(fileExtension);

    // Start transcription job
    const jobName = `transcription-${uuidv4()}`;
    const transcriptionJob = await transcribeClient.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US', // Adjust as needed
      MediaFormat: mediaFormat,
      Media: { MediaFileUri: `s3://${process.env.AWS_S3_BUCKET}/${fileKey}` },
      OutputBucketName: process.env.AWS_S3_BUCKET,
    }));

    // Poll for job completion
    let jobStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const jobResult = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      }));
      jobStatus = jobResult.TranscriptionJob?.TranscriptionJobStatus;
      console.log("Job status: ", jobStatus)
    } while (jobStatus === 'IN_PROGRESS');

    if (jobStatus === 'COMPLETED') {
      // Fetch the final job result
      const finalJobResult = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      }));

      const transcriptFileUri = finalJobResult.TranscriptionJob?.Transcript?.TranscriptFileUri;
      
      if (!transcriptFileUri) {
        return NextResponse.json({ error: 'Transcript file URI not found' }, { status: 500 });
      }

      console.log("Transcript file URI:", transcriptFileUri);

      // Parse the URL to extract the bucket name and S3 key
      const url = new URL(transcriptFileUri);
      const pathParts = url.pathname.split('/').filter(part => part !== '');
      const bucketName = pathParts[0];
      const s3Key = pathParts.slice(1).join('/');

      console.log("Extracted bucket name:", bucketName);
      console.log("Extracted S3 key:", s3Key);

      // Fetch the transcript file from S3
      const getObjectResponse = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      }));

      const transcriptJson = await getObjectResponse.Body?.transformToString();
      
      if (!transcriptJson) {
        return NextResponse.json({ error: 'Failed to retrieve transcript' }, { status: 500 });
      }
      
      const transcript = JSON.parse(transcriptJson);
      return NextResponse.json({ 
        message: 'Transcription completed', 
        jobName,
        transcript: transcript.results
      }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}