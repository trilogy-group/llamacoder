import { NextResponse } from 'next/server';
import fgaClient from '@/lib/oktaFGA';

export async function POST(req: Request) {
  const { projectId, email, accessLevel } = await req.json();

  console.log('projectId', projectId);
  console.log('email', email);
  console.log('accessLevel', accessLevel);  

  try {
    const response = await fgaClient.write({
      writes: [
        {
          user: `user:${email}`,
          relation: accessLevel,
          object: `project:${projectId}`
        }
      ]
    });

    return NextResponse.json({ success: true, message: 'Project shared successfully' });
  } catch (error) {
    console.error('Error sharing project:', error);
    return NextResponse.json({ success: false, message: 'Failed to share project' }, { status: 500 });
  }
}