import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Artifact } from '@/types/Artifact';
// @ts-ignore
import { getSession } from '@auth0/nextjs-auth0';
import fgaClient from "@/lib/oktaFGA";

const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-artifacts";

// Helper function to check user access
async function checkAccess(userId: string, projectId: string, requiredRelation: string) {
  const response = await fgaClient.check({
    user: `user:${userId}`,
    relation: requiredRelation,
    object: `project:${projectId}`,
  });
  return response.allowed;
}

// Get all artifacts for a project
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    // Check if user has access to view this project
    const hasAccess = await checkAccess(session.user.sub, projectId, 'can_view');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all artifacts for the project
    const result = await ddbClient.query(TABLE_NAME, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROJECT#${projectId}`,
        ':sk': 'ARTIFACT#',
      },
    });

    return NextResponse.json(result.Items as Artifact[]);
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
}

// Create a new artifact
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;
    const body: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const now = new Date().toISOString();
    const artifact: Artifact = {
      ...body,
      id: uuidv4(),
      projectId,
      createdAt: now,
      updatedAt: now,
    };

    // Check if user has access to create artifacts in this project
    const hasAccess = await checkAccess(session.user.sub, projectId, 'can_modify');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await ddbClient.put(TABLE_NAME, {
      PK: `PROJECT#${projectId}`,
      SK: `ARTIFACT#${artifact.id}`,
      ...artifact,
    });

    return NextResponse.json(artifact, { status: 201 });
  } catch (error) {
    console.error('Error creating artifact:', error);
    return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
  }
}