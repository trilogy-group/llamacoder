import { AmplifyClient, CreateAppCommand, CreateBranchCommand, StartDeploymentCommand, Platform } from "@aws-sdk/client-amplify";
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import spawn from 'cross-spawn';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

import dotenv from 'dotenv';
dotenv.config();

export async function POST(request: Request) {
    try {
        const { generatedCode } = await request.json();

        const config = {
            region: process.env.AWS_REGION,
            // credentials: {
            //     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            //     sessionToken: process.env.AWS_SESSION_TOKEN,
            // },
        };
        const s3Client = new S3Client(config);
        const appName = `${nanoid(10)}`;
        const bucketName = process.env.S3_BUCKET_NAME;

        // Write the generated code to src/App.tsx
        const appFilePath = path.join(process.cwd(), 'templates/react-simple/src/App.tsx');
        await fs.promises.writeFile(appFilePath, generatedCode);

        // Run npm run build in the @templates folder
        console.log('Running build command...');
        const buildProcess = spawn('npm', ['run', 'build'], { cwd: path.join(process.cwd(), 'templates/react-simple') });

        buildProcess.stdout.on('data', (data: any) => {
            console.log(`stdout: ${data}`);
        });

        buildProcess.stderr.on('data', (data: any) => {
            console.error(`stderr: ${data}`);
        });

        await new Promise<void>((resolve, reject) => {
            buildProcess.on('close', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`Build process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        console.log('Build command completed.');
        
        const buildFolder = path.join(process.cwd(), 'templates/react-simple/build');
        const indexPath = path.join(buildFolder, 'index.html');
        let indexContent = await fs.promises.readFile(indexPath, 'utf-8');
        indexContent = indexContent.replace(/(src|href)="\/static\//g, `$1="/${appName}/static/`);
        await fs.promises.writeFile(indexPath, indexContent);

        const uploadDirectory = async (dirPath: string, s3Path: string) => {
            const files = await fs.promises.readdir(dirPath);
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const fileStat = await fs.promises.stat(filePath);
                if (fileStat.isDirectory()) {
                    await uploadDirectory(filePath, `${s3Path}/${file}`);
                } else {
                    const fileContent = await fs.promises.readFile(filePath);
                    const contentType = file === 'index.html' ? 'text/html' : 'application/octet-stream';
                    const uploadParams = {
                        Bucket: bucketName,
                        Key: `${s3Path}/${file}`,
                        Body: fileContent,
                        ContentType: contentType,
                    };
                    await s3Client.send(new PutObjectCommand(uploadParams));
                }
            }
        };

        await uploadDirectory(buildFolder, appName);

        const publishedUrl = `https://apps.ti.trilogy.com/${appName}/index.html`;

        return NextResponse.json({ success: true, url: publishedUrl });
    } catch (error) {
        console.error('Error publishing app:', error);
        return NextResponse.json({ success: false, error: 'Failed to publish app' }, { status: 500 });
    }
}