CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

INSERT INTO "blog_categories" ("name", "slug", "updated_at")
SELECT DISTINCT
    "category",
    concat('category-', substr(md5("category"), 1, 12)),
    CURRENT_TIMESTAMP
FROM "blog_posts"
WHERE "category" IS NOT NULL;

ALTER TABLE "blog_posts" ADD COLUMN "category_id" UUID;

UPDATE "blog_posts" AS post
SET "category_id" = category."id"
FROM "blog_categories" AS category
WHERE post."category" = category."name";

ALTER TABLE "blog_posts" DROP COLUMN "category";

CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");

ALTER TABLE "blog_posts"
ADD CONSTRAINT "blog_posts_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "blog_post_media" (
    "blog_post_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    CONSTRAINT "blog_post_media_pkey" PRIMARY KEY ("blog_post_id", "media_id")
);

CREATE INDEX "blog_post_media_media_id_idx" ON "blog_post_media"("media_id");

ALTER TABLE "blog_post_media"
ADD CONSTRAINT "blog_post_media_blog_post_id_fkey"
FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blog_post_media"
ADD CONSTRAINT "blog_post_media_media_id_fkey"
FOREIGN KEY ("media_id") REFERENCES "media"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
