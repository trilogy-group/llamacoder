import { NextResponse } from 'next/server';
import { fetchContributors, checkAccess } from '@/utils/project';
// @ts-ignore
import { getSession } from '@auth0/nextjs-auth0';

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
