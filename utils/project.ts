import fgaClient from "@/lib/oktaFGA";
import { Contributor } from "@/types/Project";

export const fetchContributors = async (id: string) => {
    const responses = await Promise.all([
      fgaClient.read({
        relation: 'reader',
        object: `project:${id}`,
      }),
      fgaClient.read({
        relation: 'editor',
        object: `project:${id}`,
      }),
      fgaClient.read({
        relation: 'owner',
        object: `project:${id}`,
      }),
    ]);
    const contributors = [];
    for (const response of responses) {
      for (const tuple of response.tuples) {
        contributors.push({email: tuple.key.user.split(':')[1], accessLevel: tuple.key.relation} as Contributor);
      }
    }
    return contributors;
  }
  
export const checkAccess = async (id: string, user: any) => {
    const batchCheckResponse = await fgaClient.batchCheck([
      {
        user: `user:${user.email}`,
        relation: 'viewer',
        object: `project:${id}`,
      },
      {
        user: `user:${user.email}`,
        relation: 'editor',
        object: `project:${id}`,
      },
      {
        user: `user:${user.sub}`,
        relation: 'owner',
        object: `project:${id}`,
      },
    ]);
  
    const allowed = batchCheckResponse.responses.some(response => response.allowed);
    const accessLevel = batchCheckResponse.responses.find(response => 
      response.allowed && response._request.relation === 'owner'
    )?._request.relation || 
    batchCheckResponse.responses.find(response => 
      response.allowed && response._request.relation === 'editor'
    )?._request.relation || 
    batchCheckResponse.responses.find(response => 
      response.allowed && response._request.relation === 'viewer'
    )?._request.relation;
  
    return { allowed, accessLevel };
  }
  