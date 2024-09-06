import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types/Project';
import { Artifact } from '@/types/Artifact';
import { FileContext } from '@/types/FileContext';

const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-artifacts";

// Create a new project
export async function POST(request: Request) {
  try {
    const body: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const now = new Date();
    const project: Project = {
      ...body,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await ddbClient.put(TABLE_NAME, {
      PK: `PROJECT#${project.id}`,
      SK: `PROJECT#${project.id}`,
      ...project,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// Read a project by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` });
    
    if (!result.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project: Project = {
      id: result.Item.id,
      title: result.Item.title,
      description: result.Item.description,
      thumbnail: result.Item.thumbnail,
      context: result.Item.context as FileContext[],
      artifacts: result.Item.artifacts as Artifact[],
      entrypoint: result.Item.entrypoint as Artifact,
      status: result.Item.status,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      createdBy: result.Item.createdBy,
      updatedBy: result.Item.updatedBy,
      publishedUrl: result.Item.publishedUrl,
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// Update a project
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const now = new Date();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
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
      { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` }, 
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames,
    );
    
    const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` });
    if (!result.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject: Project = {
      id: result.Item.id,
      title: result.Item.title,
      description: result.Item.description,
      thumbnail: result.Item.thumbnail,
      context: result.Item.context as FileContext[],
      artifacts: result.Item.artifacts as Artifact[],
      entrypoint: result.Item.entrypoint as Artifact,
      status: result.Item.status,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      createdBy: result.Item.createdBy,
      updatedBy: result.Item.updatedBy,
      publishedUrl: result.Item.publishedUrl,
    };

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await ddbClient.delete(TABLE_NAME, { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` });
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}