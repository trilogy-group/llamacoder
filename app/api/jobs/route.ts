import { NextResponse } from 'next/server';
import { ddbClient } from '@/utils/ddbClient';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '@/types/Job';

const TABLE_NAME = process.env.DDB_TABLE_NAME || "ti-jobs";

// Create a new job
export async function POST(request: Request) {
  try {
    const body: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const now = new Date();
    const job: Job = {
      ...body,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await ddbClient.put(TABLE_NAME, {
      PK: `JOB#${job.id}`,
      SK: `JOB#${job.id}`,
      ...job,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

// Read a job by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const result = await ddbClient.get(TABLE_NAME, { PK: `JOB#${id}`, SK: `JOB#${id}` });
    
    if (!result.Item) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job: Job = {
      id: result.Item.id,
      status: result.Item.status,
      name: result.Item.name,
      type: result.Item.type,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      resourceType: result.Item.resourceType,
      resourceId: result.Item.resourceId,
    };

    return NextResponse.json(job);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// Update a job
export async function PUT(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { id, ...updateData } = body;
    const now = new Date();

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
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
      { PK: `JOB#${id}`, SK: `JOB#${id}` }, 
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames,
    );
    
    const result = await ddbClient.get(TABLE_NAME, { PK: `JOB#${id}`, SK: `JOB#${id}` });
    if (!result.Item) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updatedJob: Job = {
      id: result.Item.id,
      status: result.Item.status,
      name: result.Item.name,
      type: result.Item.type,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
      resourceType: result.Item.resourceType,
      resourceId: result.Item.resourceId,
    };

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// Delete a job
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await ddbClient.delete(TABLE_NAME, { PK: `JOB#${id}`, SK: `JOB#${id}` });
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
