import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types/Project';
import { Artifact } from '@/types/Artifact';
import { FileContext } from '@/types/FileContext';
import { getSession } from '@auth0/nextjs-auth0';
import fgaClient from "@/lib/oktaFGA";
import { Attachment } from '@/types/Attachment';

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

// Create a new project
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const now = new Date();
    const project: Project = {
      ...body,
      id: uuidv4(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: session.user.sub,
      updatedBy: session.user.sub,
    };
    
    const dbProject = {
      ...project,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await ddbClient.put(TABLE_NAME, {
      PK: `PROJECT#${project.id}`,
      SK: `PROJECT#${project.id}`,
      ...dbProject,
    });

    // Set the creator as the owner in FGA
    await fgaClient.write({
      writes: [{
        user: `user:${session.user.sub}`,
        relation: 'owner',
        object: `project:${project.id}`,
      }],
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// Read a project by ID or fetch all projects
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Check if user has access to this project
      const hasAccess = await checkAccess(session.user.sub, id, 'can_view');
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Fetch a single project by ID
      const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` });
      
      if (!result.Item) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const project: Project = {
        id: result.Item.id,
        title: result.Item.title,
        description: result.Item.description,
        thumbnail: result.Item.thumbnail,
        context: result.Item.context as Attachment[],
        artifacts: result.Item.artifacts as Artifact[],
        entrypoint: result.Item.entrypoint as Artifact,
        status: result.Item.status,
        createdAt: result.Item.createdAt,
        updatedAt: result.Item.updatedAt,
        createdBy: result.Item.createdBy,
        updatedBy: result.Item.updatedBy,
        publishedUrl: result.Item.publishedUrl,
      };

      return NextResponse.json(project);
    } else {
      // Fetch all projects the user has access to
      const response = await fgaClient.listObjects({
        user: `user:${session.user.sub}`,
        relation: 'can_view',
        type: 'project',
      });

      const projectIds = response.objects.map(obj => obj.split(':')[1]);

      const projects: Project[] = [];
      for (const projectId of projectIds) {
        const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` });
        if (result.Item) {
          projects.push({
            id: result.Item.id,
            title: result.Item.title,
            description: result.Item.description,
            thumbnail: result.Item.thumbnail,
            context: result.Item.context as Attachment[],
            artifacts: result.Item.artifacts as Artifact[],
            entrypoint: result.Item.entrypoint as Artifact,
            status: result.Item.status,
            createdAt: result.Item.createdAt,
            updatedAt: result.Item.updatedAt,
            createdBy: result.Item.createdBy,
            updatedBy: result.Item.updatedBy,
            publishedUrl: result.Item.publishedUrl,
          });
        }
      }

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error('Error fetching project(s):', error);
    return NextResponse.json({ error: 'Failed to fetch project(s)' }, { status: 500 });
  }
}

// Update a project
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const now = new Date();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if user has access to modify this project
    const hasAccess = await checkAccess(session.user.sub, id, 'can_modify');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updateExpression = 'SET ' + Object.keys(updateData).map(key => `#${key} = :${key}`).join(', ') + ', #updatedAt = :updatedAt, #updatedBy = :updatedBy';
    const expressionAttributeNames = {
      ...Object.keys(updateData).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      '#updatedAt': 'updatedAt',
      '#updatedBy': 'updatedBy'
    };
    const expressionAttributeValues = {
      ...Object.entries(updateData).reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
      ':updatedAt': now.toISOString(),
      ':updatedBy': session.user.sub,
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
      context: result.Item.context as Attachment[],
      artifacts: result.Item.artifacts as Artifact[],
      entrypoint: result.Item.entrypoint as Artifact,
      status: result.Item.status,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,
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
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if user has access to delete this project
    const hasAccess = await checkAccess(session.user.sub, id, 'can_delete');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await ddbClient.delete(TABLE_NAME, { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` });

    // Remove all FGA relationships for this project
    await fgaClient.write({
      deletes: [{
        user: '*',
        relation: '*',
        object: `project:${id}`,
      }],
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}