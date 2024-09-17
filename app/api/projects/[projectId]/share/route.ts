import { NextResponse } from 'next/server';
import fgaClient from '@/lib/oktaFGA';

/**
 * @swagger
 * /api/projects/{projectId}/share:
 *   post:
 *     summary: Share a project with a user
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to share
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - accessLevel
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user to share the project with
 *               accessLevel:
 *                 type: string
 *                 enum: [viewer, editor, revoke]
 *                 description: The access level to grant (or revoke) for the user
 *     responses:
 *       200:
 *         description: Project access updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const { email, accessLevel } = await req.json();
  const projectId = params.projectId;

  console.log('projectId', projectId);
  console.log('email', email);
  console.log('accessLevel', accessLevel);  

  try {
    // First, check existing relations for this user and project
    const checkResponse = await Promise.all([
      fgaClient.check({
        user: `user:${email}`,
        relation: 'viewer',
        object: `project:${projectId}`
      }),
      fgaClient.check({
        user: `user:${email}`,
        relation: 'editor',
        object: `project:${projectId}`
      })
    ]);

    const isViewer = checkResponse[0].allowed;
    const isEditor = checkResponse[1].allowed;

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
      console.log('deleted relations: ', deletes);
    }

    // If the new accessLevel is not 'revoke' and it's different from the current access, add the new relation
    if (accessLevel !== 'revoke') {
      await fgaClient.write({
        writes: [
          {
            user: `user:${email}`,
            relation: accessLevel,
            object: `project:${projectId}`
          }
        ]
      });
      console.log('added new relation: ', accessLevel);
    } else {
      console.log('accessLevel is revoke, no new relation to add');
    }

    return NextResponse.json({ success: true, message: 'Project access updated successfully' });
  } catch (error) {
    console.error('Error updating project access:', error);
    return NextResponse.json({ success: false, message: 'Failed to update project access' }, { status: 500 });
  }
}