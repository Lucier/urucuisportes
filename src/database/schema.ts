import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  pgEnum,
  index,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('user_role', ['ADMIN', 'USER'])
export const matchStatusEnum = pgEnum('match_status', [
  'SCHEDULED',
  'LIVE',
  'FINISHED',
  'POSTPONED',
])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').default('USER').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_users_email').on(table.email), index('idx_users_role').on(table.role)],
)

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

// ─── Leagues ──────────────────────────────────────────────────────────────────

export const leagues = pgTable('leagues', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logoUrl: text('logo_url'),
  country: varchar('country', { length: 100 }),
})

export const leaguesRelations = relations(leagues, ({ many }) => ({
  teams: many(teams),
  matches: many(matches),
  standings: many(standings),
  topScorers: many(topScorers),
}))

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}))

// ─── Posts ────────────────────────────────────────────────────────────────────

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull().unique(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    categoryId: uuid('category_id').references(() => categories.id),
    authorId: uuid('author_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_posts_slug').on(table.slug),
    index('idx_posts_category').on(table.categoryId),
    index('idx_posts_author').on(table.authorId),
  ],
)

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}))

// ─── Teams ────────────────────────────────────────────────────────────────────

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logoUrl: text('logo_url'),
  leagueId: uuid('league_id').references(() => leagues.id),
})

export const teamsRelations = relations(teams, ({ one, many }) => ({
  league: one(leagues, { fields: [teams.leagueId], references: [leagues.id] }),
  homeMatches: many(matches, { relationName: 'homeTeam' }),
  awayMatches: many(matches, { relationName: 'awayTeam' }),
  standings: many(standings),
  topScorers: many(topScorers),
}))

// ─── Matches ──────────────────────────────────────────────────────────────────

export const matches = pgTable(
  'matches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    homeTeamId: uuid('home_team_id')
      .notNull()
      .references(() => teams.id),
    awayTeamId: uuid('away_team_id')
      .notNull()
      .references(() => teams.id),
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    status: matchStatusEnum('status').default('SCHEDULED').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    leagueId: uuid('league_id').references(() => leagues.id),
  },
  (table) => [
    index('idx_matches_league').on(table.leagueId),
    index('idx_matches_date').on(table.date),
    index('idx_matches_status').on(table.status),
  ],
)

export const matchesRelations = relations(matches, ({ one }) => ({
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
    relationName: 'homeTeam',
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
    relationName: 'awayTeam',
  }),
  league: one(leagues, { fields: [matches.leagueId], references: [leagues.id] }),
}))

// ─── Standings ────────────────────────────────────────────────────────────────

export const standings = pgTable(
  'standings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    leagueId: uuid('league_id')
      .notNull()
      .references(() => leagues.id),
    played: integer('played').default(0).notNull(),
    won: integer('won').default(0).notNull(),
    drawn: integer('drawn').default(0).notNull(),
    lost: integer('lost').default(0).notNull(),
    goalsFor: integer('goals_for').default(0).notNull(),
    goalsAgainst: integer('goals_against').default(0).notNull(),
    points: integer('points').default(0).notNull(),
  },
  (table) => [
    index('idx_standings_league').on(table.leagueId),
    index('idx_standings_team').on(table.teamId),
  ],
)

export const standingsRelations = relations(standings, ({ one }) => ({
  team: one(teams, { fields: [standings.teamId], references: [teams.id] }),
  league: one(leagues, { fields: [standings.leagueId], references: [leagues.id] }),
}))

// ─── Top Scorers ──────────────────────────────────────────────────────────────

export const topScorers = pgTable(
  'top_scorers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playerName: varchar('player_name', { length: 255 }).notNull(),
    teamId: uuid('team_id').references(() => teams.id),
    leagueId: uuid('league_id').references(() => leagues.id),
    goals: integer('goals').default(0).notNull(),
    assists: integer('assists').default(0).notNull(),
  },
  (table) => [index('idx_scorers_league').on(table.leagueId)],
)

export const topScorersRelations = relations(topScorers, ({ one }) => ({
  team: one(teams, { fields: [topScorers.teamId], references: [teams.id] }),
  league: one(leagues, { fields: [topScorers.leagueId], references: [leagues.id] }),
}))

// ─── Photo Albums ─────────────────────────────────────────────────────────────

export const photoAlbums = pgTable(
  'photo_albums',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    url: text('url').notNull(),
    coverUrl: text('cover_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_albums_created').on(table.createdAt)],
)
