import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import fs from 'fs-extra';
import path from 'path';

const config = {
    region: "us-east-1",
};

export const s3Client = new S3Client(config);

export async function deleteExistingFiles(bucketName: string, s3Path: string) {
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
            await deleteExistingFiles(bucketName, s3Path);
        }
    }
}

export async function uploadFile(bucketName: string, filePath: string, fileContent: Buffer, contentType: string) {
    const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileContent,
        ContentType: contentType,
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
}

export async function uploadDirectory(bucketName: string, dirPath: string, s3Path: string) {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const fileStat = await fs.promises.stat(filePath);
        if (fileStat.isDirectory()) {
            await uploadDirectory(bucketName, filePath, `${s3Path}/${file}`);
        } else {
            const fileContent = await fs.promises.readFile(filePath);
            const contentType = file === 'index.html' ? 'text/html' : 'application/octet-stream';
            await uploadFile(bucketName, `${s3Path}/${file}`, fileContent, contentType);
        }
    }
}