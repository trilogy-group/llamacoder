import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

export async function POST(request: Request) {
    try {
        const { generatedCode } = await request.json();

        const config = {
            region: process.env.AWS_REGION || "us-east-1",
        };
        const s3Client = new S3Client(config);
        const appName = `${nanoid(10)}`;
        const bucketName = process.env.S3_BUCKET_NAME || "ti-artifact-apps";

        // Create a temporary directory
        const tempDir = path.join(process.cwd(), 'temp', appName);
        await fs.ensureDir(tempDir);

        // Copy the template files to the temporary directory
        await fs.copy(path.join(process.cwd(), 'templates/react-simple'), tempDir);

        // Write each generated file to the appropriate location in the temp directory
        for (const [filePath, code] of Object.entries(generatedCode)) {
            const fullPath = path.join(tempDir, 'src', filePath);
            await fs.ensureDir(path.dirname(fullPath));
            await fs.writeFile(fullPath, code as string);
        }

        // Run npm run build in the temp folder
        console.log('Running build command...');
        const buildProcess = spawn('npm', ['run', 'build'], { cwd: tempDir });

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
        
        const buildFolder = path.join(tempDir, 'build');
        const indexPath = path.join(buildFolder, 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf-8');
        indexContent = indexContent.replace(/(src|href)="\/static\//g, `$1="/${appName}/static/`);
        await fs.writeFile(indexPath, indexContent);

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

        // Clean up the temporary directory
        await fs.remove(tempDir);

        return NextResponse.json({ success: true, url: publishedUrl });
    } catch (error) {
        console.error('Error publishing app:', error);
        return NextResponse.json({ success: false, error: 'Failed to publish app' }, { status: 500 });
    }
}