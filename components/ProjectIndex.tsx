import type { Project } from "@/content/types";
import { ProjectRow } from "./ProjectRow";

export function ProjectIndex({ projects }: { projects: readonly Project[] }) {
  if (projects.length === 0) {
    return <p className="text-muted">Projects are on their way.</p>;
  }
  return (
    <div className="border-b border-line">
      {projects.map((project) => (
        <ProjectRow key={project.slug} project={project} />
      ))}
    </div>
  );
}
