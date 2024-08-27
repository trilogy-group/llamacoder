import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

export async function POST(request: Request) {
    try {
        const { generatedCode, artifactId } = await request.json();

        const config = {
            region: "us-east-1",
        };
        const s3Client = new S3Client(config);
        const appName = artifactId;
        const bucketName = "ti-artifact-apps";

        // Create a temporary directory
        const tempDir = path.join(process.cwd(), 'temp', appName);
        await fs.ensureDir(tempDir);

        console.log("Copying template files to the temporary directory: ", tempDir);

        const templateDir = path.join(process.cwd(), 'templates/react-simple');
        const templateFiles = await fs.readdir(templateDir);
        for (const file of templateFiles) {
            try {
                await fs.copy(path.join(templateDir, file), path.join(tempDir, file));
            } catch (error) {
                console.error(`Error copying file ${file}:`, error);
            }
        }

        for (const [filePath, code] of Object.entries(generatedCode)) {
            try {
                const fullPath = path.join(tempDir, 'src', filePath);
                await fs.ensureDir(path.dirname(fullPath));
                await fs.writeFile(fullPath, code as string);
            } catch (error) {
                console.error(`Error writing generated file ${filePath}:`, error);
            }
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

        const deleteExistingFiles = async (s3Path: string) => {
            const listParams = {
                Bucket: bucketName,
                Prefix: s3Path,
            };

            const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

            if (listedObjects.Contents && listedObjects.Contents.length > 0) {
                const deleteParams = {
                    Bucket: bucketName,
                    Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
                };

                await s3Client.send(new DeleteObjectsCommand(deleteParams));

                if (listedObjects.IsTruncated) {
                    await deleteExistingFiles(s3Path);
                }
            }
        };

        // Delete existing files before uploading
        await deleteExistingFiles(appName);

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