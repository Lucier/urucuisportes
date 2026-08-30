CREATE TYPE "public"."stream_status" AS ENUM('LIVE', 'SCHEDULED', 'FINISHED');--> statement-breakpoint
CREATE TABLE "photo_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"cover_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" varchar(100) NOT NULL,
	"photo_url" text,
	"team_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"status" "stream_status" DEFAULT 'SCHEDULED' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_albums_created" ON "photo_albums" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_players_team" ON "players" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_streams_status" ON "streams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_streams_scheduled" ON "streams" USING btree ("scheduled_at");