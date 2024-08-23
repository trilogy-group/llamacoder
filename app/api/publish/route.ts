import { AmplifyClient, CreateAppCommand, CreateBranchCommand, StartDeploymentCommand, Platform } from "@aws-sdk/client-amplify";
import { v4 as uuidv4 } from 'uuid';
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
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                sessionToken: process.env.AWS_SESSION_TOKEN,
            },
        };

        const amplifyClient = new AmplifyClient(config);
        const s3Client = new S3Client(config);
        const appName = `GeneratedApp-${uuidv4()}`;
        const s3Key = `${appName}.zip`;

        const createAppParams = {
            name: appName,
            platform: 'WEB' as Platform,
        };

        const createAppCommand = new CreateAppCommand(createAppParams);
        const app = await amplifyClient.send(createAppCommand);
        const appId = app.app?.appId;

        const createBranchParams = {
            appId: appId,
            branchName: appName,
        };

        const createBranchCommand = new CreateBranchCommand(createBranchParams);
        await amplifyClient.send(createBranchCommand);

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

        // Create a zip file of the build folder
        const buildFolder = path.join(process.cwd(), 'templates/react-simple/build');
        const zipPath = path.join(process.cwd(), `${appName}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const zipPromise = new Promise<NextResponse>((resolve, reject) => {
            output.on('close', async () => {
                console.log(`Zip file created: ${zipPath} (${archive.pointer()} total bytes)`);

                try {
                    const zipContent = await fs.promises.readFile(zipPath);
                    const uploadParams = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: s3Key,
                        Body: zipContent,
                        ContentType: 'application/zip',
                    };
                    await s3Client.send(new PutObjectCommand(uploadParams));
                    const sourceUrl = `s3://${process.env.S3_BUCKET_NAME}/${s3Key}`;

                    const startDeploymentParams = {
                        appId: appId,
                        branchName: appName,
                        sourceUrl: sourceUrl,
                    };

                    const startDeploymentCommand = new StartDeploymentCommand(startDeploymentParams);
                    await amplifyClient.send(startDeploymentCommand);

                    const publishedUrl = `https://${appName}.${app.app?.defaultDomain}`;

                    // Delete the zip file after upload
                    await fs.promises.unlink(zipPath);

                    resolve(NextResponse.json({ success: true, url: publishedUrl }));
                } catch (error) {
                    reject(error);
                }
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(buildFolder, false);
            archive.finalize();
        });

        return await zipPromise;
    } catch (error) {
        console.error('Error publishing app:', error);
        return NextResponse.json({ success: false, error: 'Failed to publish app' }, { status: 500 });
    }
}