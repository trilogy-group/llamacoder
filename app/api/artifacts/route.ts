import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Artifact } from '@/types/Artifact';

const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-artifacts";

// Create a new artifact
export async function POST(request: Request) {
  try {
    const body: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const now = new Date();
    const artifact: Artifact = {
      ...body,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await ddbClient.put(TABLE_NAME, {
      PK: `ARTIFACT#${artifact.id}`,
      SK: `ARTIFACT#${artifact.id}`,
      ...artifact,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    return NextResponse.json(artifact, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
  }
}

// Read an artifact by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Artifact ID is required' }, { status: 400 });
    }

    const result = await ddbClient.get(TABLE_NAME, { PK: `ARTIFACT#${id}`, SK: `ARTIFACT#${id}` });
    
    if (!result.Item) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    const artifact: Artifact = {
      id: result.Item.id,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      name: result.Item.name,
      prompt: result.Item.prompt,
      code: result.Item.code,
      dependencies: result.Item.dependencies,
      template: result.Item.template,
    };

    return NextResponse.json(artifact);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 });
  }
}

// Update an artifact
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const now = new Date();

    if (!id) {
      return NextResponse.json({ error: 'Artifact ID is required' }, { status: 400 });
    }

    const updateExpression = 'SET ' + Object.keys(updateData).map(key => `#${key} = :${key}`).join(', ') + ', #updatedAt = :updatedAt';
    const expressionAttributeNames = {
      ...Object.keys(updateData).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      '#updatedAt': 'updatedAt'
    };
    const expressionAttributeValues = {
      ...Object.entries(updateData).reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
      ':updatedAt': now.toISOString(),
    };

    await ddbClient.update(TABLE_NAME, 
      { PK: `ARTIFACT#${id}`, SK: `ARTIFACT#${id}` }, 
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames,
    );
    
    const result = await ddbClient.get(TABLE_NAME, { PK: `ARTIFACT#${id}`, SK: `ARTIFACT#${id}` });
    if (!result.Item) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    const updatedArtifact: Artifact = {
      id: result.Item.id,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      name: result.Item.name,
      prompt: result.Item.prompt,
      code: result.Item.code,
      dependencies: result.Item.dependencies,
      template: result.Item.template,
    };

    return NextResponse.json(updatedArtifact);
  } catch (error) {
    console.error('Error updating artifact:', error);
    return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 });
  }
}

// Delete an artifact
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Artifact ID is required' }, { status: 400 });
    }

    await ddbClient.delete(TABLE_NAME, { PK: `ARTIFACT#${id}`, SK: `ARTIFACT#${id}` });
    return NextResponse.json({ message: 'Artifact deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 });
  }
}
