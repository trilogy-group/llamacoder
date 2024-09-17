import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types/Project';
import { FileContext } from '@/types/FileContext';
// @ts-ignore
import { getSession } from '@auth0/nextjs-auth0';
import fgaClient from "@/lib/oktaFGA";
const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-artifacts";

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateProjectResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
      createdBy: session.user.email,
      updatedBy: session.user.email,
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
    const response = await fgaClient.write({
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

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectsResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // console.log("session", session);

    // Fetch all projects the user has access to
    const responses = await Promise.all([
      await fgaClient.read({
        user: `user:${session.user.email}`,
        object: 'project:',
      }),
      await fgaClient.read({
        user: `user:${session.user.sub}`,
        object: 'project:',
      }),
    ]);

    const tuples: any[] = [];
    for (const response of responses) {
      tuples.push(...response.tuples.map((tuple: any) => { return { id: tuple.key.object.split(':')[1], accessLevel: tuple.key.relation } }));
    }

    const projectPromises = tuples.map(async (projectTuple: any) => {
      const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectTuple.id}`, SK: `PROJECT#${projectTuple.id}` });
      return {
        ...result,
        accessLevel: projectTuple.accessLevel,
      }
    }
    );

    const projectResults = await Promise.all(projectPromises);

    const projects: Project[] = projectResults
      .filter(result => result.Item)
      .map((result, index) => ({
        id: result?.Item?.id,
        title: result?.Item?.title,
        description: result?.Item?.description,
        thumbnail: result?.Item?.thumbnail,
        context: result?.Item?.context as FileContext[],
        entrypoint: result?.Item?.entrypoint,
        status: result?.Item?.status,
        createdAt: result?.Item?.createdAt,
        updatedAt: result?.Item?.updatedAt,
        createdBy: result?.Item?.createdBy,
        updatedBy: result?.Item?.updatedBy,
        publishedUrl: result?.Item?.publishedUrl,
        accessLevel: result.accessLevel,
      }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching project(s):', error);
    return NextResponse.json({ error: 'Failed to fetch project(s)' }, { status: 500 });
  }
}