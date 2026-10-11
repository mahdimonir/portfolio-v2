-- CreateTable
CREATE TABLE "project_variants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT,
    "description" TEXT,
    "theme_color" TEXT,
    "preview_image" TEXT,
    "live_url" TEXT,
    "code_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_variants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_variants" ADD CONSTRAINT "project_variants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
