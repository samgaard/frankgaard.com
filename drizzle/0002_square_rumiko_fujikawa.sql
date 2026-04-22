CREATE TABLE "settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text
);

INSERT INTO "settings" ("key", "value") VALUES ('site_name', 'Gallery') ON CONFLICT ("key") DO NOTHING;
