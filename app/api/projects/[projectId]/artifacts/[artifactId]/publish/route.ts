import { NextResponse } from 'next/server';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';
import { Artifact } from '@/types/Artifact';
import { deleteExistingFiles, uploadDirectory } from '@/utils/s3Client';
import { ddbClient } from '@/utils/ddbClient';

import dotenv from 'dotenv';
dotenv.config();

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "ti-artifact-apps";
const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-artifacts";

/**
 * @swagger
 * /api/projects/{projectId}/artifacts/{artifactId}/publish:
 *   post:
 *     summary: Publish an artifact
 *     description: Builds and publishes the artifact to S3
 *     tags: [Artifacts]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *       - in: path
 *         name: artifactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the artifact to publish
 *     responses:
 *       200:
 *         description: Artifact published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   description: The URL of the published artifact
 *       404:
 *         description: Artifact not found
 *       500:
 *         description: Failed to publish artifact
 */
export async function POST(
    request: Request,
    { params }: { params: { projectId: string; artifactId: string } }
) {
    try {
        const { projectId, artifactId } = params;

        // Fetch the artifact from the database
        const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `ARTIFACT#${artifactId}` });
        
        if (!result.Item) {
            return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
        }

        const artifact = result.Item as Artifact;

        // Create a temporary directory
        const tempDir = path.join(process.cwd(), 'temp', artifact.id);
        await fs.ensureDir(tempDir);

        console.log("Copying template files to the temporary directory: ", tempDir);

        // Copy template files
        const templateDir = path.join(process.cwd(), 'templates/react-simple');
        await fs.copy(templateDir, tempDir);

        // Write artifact code to App.tsx
        const appTsxPath = path.join(tempDir, 'src', 'App.tsx');
        await fs.writeFile(appTsxPath, artifact?.code || '');

        // Update package.json with dependencies
        const packageJsonPath = path.join(tempDir, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        const dependencies: Record<string, string> = {};
        artifact.dependencies?.forEach(dep => {
            dependencies[dep.name] = dep.version;
        });
        packageJson.dependencies = { ...dependencies, ...packageJson.dependencies };
        packageJson.homepage = `/${artifact.id.split('-')[0]}`;
        packageJson.name = artifact.id.split('-')[0];
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

        // Run npm install
        console.log('Running npm install...');
        const installProcess = spawn('npm', ['install'], { cwd: tempDir });

        installProcess.stdout.on('data', (data: any) => {
            console.log(`stdout: ${data}`);
        });

        installProcess.stderr.on('data', (data: any) => {
            console.error(`stderr: ${data}`);
        });

        await new Promise<void>((resolve, reject) => {
            installProcess.on('close', (code: any) => {
                if (code !== 0) {
                    reject(new Error(`npm install process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        console.log('npm install completed.');

        // Run npm run build
        console.log('Running build command...');
        const buildProcess = spawn('npm', ['run', 'build'], { cwd: tempDir });

        buildProcess.stdout.on('data', (data: any) => {
            console.log(`stdout: ${data}`);
        });

        buildProcess.stderr.on('data', (data: any) => {
            console.error(`stderr: ${data}`);
        });

        await new Promise<void>((resolve, reject) => {
            buildProcess.on('close', (code: any) => {
                if (code !== 0) {
                    reject(new Error(`Build process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        console.log('Build command completed.');

        const buildFolder = path.join(tempDir, 'build');

        // Delete existing files before uploading
        await deleteExistingFiles(BUCKET_NAME, artifact.id);

        // Upload the build folder to S3
        await uploadDirectory(BUCKET_NAME, buildFolder, artifact.id.split('-')[0]);

        const publishedUrl = `https://apps.ti.trilogy.com/${artifact.id.split('-')[0]}/`;

        // Clean up the temporary directory
        await fs.remove(tempDir);

        return NextResponse.json({ success: true, url: publishedUrl });
    } catch (error) {
        console.error('Error publishing app:', error);
        return NextResponse.json({ success: false, error: 'Failed to publish app' }, { status: 500 });
    }
}