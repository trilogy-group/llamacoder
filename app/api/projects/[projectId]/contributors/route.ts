import { NextResponse } from 'next/server';
import { fetchContributors, checkAccess } from '@/utils/project';
// @ts-ignore
import { getSession } from '@auth0/nextjs-auth0';

/**
 * @swagger
 * /api/projects/{projectId}/contributors:
 *   get:
 *     summary: Get contributors for a project
 *     description: Retrieves the list of contributors for a specific project
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contributor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { allowed } = await checkAccess(params.projectId, session.user);
        if (!allowed) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const contributors = await fetchContributors(params.projectId);
        return NextResponse.json(contributors);
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributors' },
            { status: 500 }
        );
    }
}
