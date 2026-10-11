import ProjectEditor from "@/components/dashboard/ProjectEditor";

export const metadata = {
    title: "Create Project | Admin Dashboard",
};

export default function NewProjectPage() {
    return <ProjectEditor mode="create" />;
}
