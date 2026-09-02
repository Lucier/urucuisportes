CREATE TYPE "public"."league_type" AS ENUM('pontos_corridos', 'grupos');--> statement-breakpoint
CREATE TABLE "match_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"goals" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"nome" varchar(255),
	"grupo" integer
);
--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "tipo" "league_type" DEFAULT 'pontos_corridos' NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "numero_grupos" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "round_id" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "grupo" integer;--> statement-breakpoint
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_goals" ADD CONSTRAINT "match_goals_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_match_goals_match" ON "match_goals" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_rounds_league" ON "rounds" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "idx_rounds_grupo" ON "rounds" USING btree ("grupo");--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_matches_round" ON "matches" USING btree ("round_id");