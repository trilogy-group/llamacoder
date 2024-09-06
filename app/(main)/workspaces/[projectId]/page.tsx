"use client";

import Workspace from '../../workspace';

export default function WorkspacePage({ params }: { params: { projectId: string } }) {
  return <Workspace params={{ id: params.projectId }} />;
}
