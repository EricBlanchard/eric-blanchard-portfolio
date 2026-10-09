import { projects } from "../../content/projects";

export const staticRoutes = ["/", "/engineering", "/studio"] as const;
export const projectRoutes = projects.map((p) => `/work/${p.slug}`);
export const allRoutes = [...staticRoutes, ...projectRoutes];
export { projects };
