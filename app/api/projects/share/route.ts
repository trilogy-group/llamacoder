import { NextResponse } from 'next/server';
import fgaClient from '@/lib/oktaFGA';

export async function POST(req: Request) {
  const { projectId, email, accessLevel } = await req.json();

  console.log('projectId', projectId);
  console.log('email', email);
  console.log('accessLevel', accessLevel);  

  try {
    // First, check existing relations for this user and project
    const checkResponse = await fgaClient.check({
      user: `user:${email}`,
      relation: 'viewer',
      object: `project:${projectId}`
    });
    const isViewer = checkResponse.allowed;

    const checkEditorResponse = await fgaClient.check({
      user: `user:${email}`,
      relation: 'editor',
      object: `project:${projectId}`
    });
    const isEditor = checkEditorResponse.allowed;

    // Prepare deletes array based on existing relations
    const deletes = [];
    if (isViewer) {
      deletes.push({
        user: `user:${email}`,
        relation: 'viewer',
        object: `project:${projectId}`
      });
    }
    if (isEditor) {
      deletes.push({
        user: `user:${email}`,
        relation: 'editor',
        object: `project:${projectId}`
      });
    }

    // If there are relations to delete, remove them
    if (deletes.length > 0) {
      await fgaClient.write({ deletes });
    }

    // If the new accessLevel is not 'revoke' and it's different from the current access, add the new relation
    if (accessLevel !== 'revoke' && ((accessLevel === 'viewer' && !isViewer) || (accessLevel === 'editor' && !isEditor))) {
      await fgaClient.write({
        writes: [
          {
            user: `user:${email}`,
            relation: accessLevel,
            object: `project:${projectId}`
          }
        ]
      });
    }

    return NextResponse.json({ success: true, message: 'Project access updated successfully' });
  } catch (error) {
    console.error('Error updating project access:', error);
    return NextResponse.json({ success: false, message: 'Failed to update project access' }, { status: 500 });
  }
}