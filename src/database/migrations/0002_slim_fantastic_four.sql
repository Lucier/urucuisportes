CREATE TABLE "top_scorers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"team_id" uuid,
	"league_id" uuid,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scorers_league" ON "top_scorers" USING btree ("league_id");