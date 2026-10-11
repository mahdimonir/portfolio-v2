import ProjectEditor from "@/components/dashboard/ProjectEditor";

export const metadata = {
    title: "Edit Project | Admin Dashboard",
};

export default async function ProjectEditPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return <ProjectEditor mode="edit" slug={slug} />;
}
