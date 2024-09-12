import fgaClient from "@/lib/oktaFGA";

export async function checkAccess(userId: string, userEmail: string, projectId: string): Promise<{ allowed: boolean, accessLevel: string }> {
    const relations = ['owner', 'editor', 'viewer'];
    for (const relation of relations) {
      const response = await fgaClient.check({
        user: `user:${userId}`,
        relation: relation,
        object: `project:${projectId}`,
      });
      if (response.allowed) {
        return { allowed: true, accessLevel: relation };
      }
    }
  
    // Check if the project is shared with the user's email
    for (const relation of ['editor', 'viewer']) {
      const response = await fgaClient.check({
        user: `user:${userEmail}`,
        relation: relation,
        object: `project:${projectId}`,
      });
      if (response.allowed) {
        return { allowed: true, accessLevel: relation };
      }
    }
  
    return { allowed: false, accessLevel: 'none' };
  }