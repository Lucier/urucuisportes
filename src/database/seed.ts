import { hashSync } from 'bcryptjs'
import { db } from './client'
import { users, leagues, categories, teams, posts, matches, standings, topScorers } from './schema'

const SALT_ROUNDS = 10

async function seed() {
  console.log('Seeding database...')

  // Clear in reverse dependency order
  await db.delete(topScorers)
  await db.delete(standings)
  await db.delete(matches)
  await db.delete(posts)
  await db.delete(teams)
  await db.delete(categories)
  await db.delete(leagues)
  await db.delete(users)

  // ── Users ────────────────────────────────────────────────────────────────────
  const [admin, joao] = await db
    .insert(users)
    .values([
      {
        name: 'Admin',
        email: 'admin@urucuisportes.com',
        password: hashSync('Admin@123!', SALT_ROUNDS),
        role: 'ADMIN',
      },
      {
        name: 'João Silva',
        email: 'joao.silva@urucuisportes.com',
        password: hashSync('User@123!', SALT_ROUNDS),
        role: 'USER',
      },
      {
        name: 'Maria Souza',
        email: 'maria.souza@urucuisportes.com',
        password: hashSync('User@123!', SALT_ROUNDS),
        role: 'USER',
      },
    ])
    .returning()

  console.log(`  ✓ 3 users`)

  // ── Leagues ──────────────────────────────────────────────────────────────────
  const [serieA, serieB, libertadores] = await db
    .insert(leagues)
    .values([
      { name: 'Brasileirão Série A', slug: 'brasileirao-serie-a', country: 'Brasil' },
      { name: 'Brasileirão Série B', slug: 'brasileirao-serie-b', country: 'Brasil' },
      { name: 'CONMEBOL Libertadores', slug: 'libertadores', country: 'América do Sul' },
    ])
    .returning()

  console.log(`  ✓ 3 leagues`)

  // ── Categories ───────────────────────────────────────────────────────────────
  const [catFutebol, catTransferencias, catNacional] = await db
    .insert(categories)
    .values([
      { name: 'Futebol', slug: 'futebol' },
      { name: 'Transferências', slug: 'transferencias' },
      { name: 'Seleção Nacional', slug: 'selecao-nacional' },
    ])
    .returning()

  console.log(`  ✓ 3 categories`)

  // ── Teams ────────────────────────────────────────────────────────────────────
  const [flamengo, palmeiras, atleticoMG, gremio, vasco, internacional] = await db
    .insert(teams)
    .values([
      { name: 'Flamengo', leagueId: serieA.id },
      { name: 'Palmeiras', leagueId: serieA.id },
      { name: 'Atlético Mineiro', leagueId: serieA.id },
      { name: 'Grêmio', leagueId: serieB.id },
      { name: 'Vasco da Gama', leagueId: serieA.id },
      { name: 'Internacional', leagueId: serieA.id },
    ])
    .returning()

  console.log(`  ✓ 6 teams`)

  // ── Posts ────────────────────────────────────────────────────────────────────
  await db.insert(posts).values([
    {
      title: 'Flamengo vence Palmeiras em clássico emocionante',
      slug: 'flamengo-vence-palmeiras-classico',
      content:
        'Em uma partida disputada no Maracanã, o Flamengo superou o Palmeiras por 2 a 1 em jogo válido pelo Brasileirão Série A. Os gols rubro-negros foram marcados no segundo tempo, garantindo três pontos importantes na tabela.',
      imageUrl: null,
      categoryId: catFutebol.id,
      authorId: joao.id,
    },
    {
      title: 'Atlético Mineiro anuncia contratação de atacante europeu',
      slug: 'atletico-mg-contratacao-atacante-europeu',
      content:
        'O Atlético Mineiro confirmou nesta terça-feira a chegada de um renomado atacante vindo do futebol europeu. O jogador assinou contrato por três temporadas e já está à disposição do técnico para o restante do campeonato.',
      imageUrl: null,
      categoryId: catTransferencias.id,
      authorId: admin.id,
    },
    {
      title: 'Seleção Brasileira convoca 26 jogadores para eliminatórias',
      slug: 'selecao-brasileira-convocacao-eliminatorias',
      content:
        'O técnico da Seleção Brasileira divulgou a lista de convocados para os próximos dois jogos pelas Eliminatórias da Copa do Mundo. A convocação conta com 26 atletas, incluindo jovens promessas e veteranos experientes.',
      imageUrl: null,
      categoryId: catNacional.id,
      authorId: admin.id,
    },
    {
      title: 'Palmeiras lidera grupo na Libertadores após vitória',
      slug: 'palmeiras-lidera-grupo-libertadores',
      content:
        'Com uma vitória convincente fora de casa, o Palmeiras assumiu a liderança do seu grupo na CONMEBOL Libertadores. O placar de 3 a 0 coloca o clube paulista em excelente posição para avançar às oitavas de final.',
      imageUrl: null,
      categoryId: catFutebol.id,
      authorId: joao.id,
    },
  ])

  console.log(`  ✓ 4 posts`)

  // ── Matches ──────────────────────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000)
  const daysAhead = (n: number) => new Date(now.getTime() + n * 86_400_000)

  await db.insert(matches).values([
    {
      homeTeamId: flamengo.id,
      awayTeamId: palmeiras.id,
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
      date: daysAgo(7),
      leagueId: serieA.id,
    },
    {
      homeTeamId: atleticoMG.id,
      awayTeamId: internacional.id,
      homeScore: 1,
      awayScore: 1,
      status: 'FINISHED',
      date: daysAgo(5),
      leagueId: serieA.id,
    },
    {
      homeTeamId: vasco.id,
      awayTeamId: palmeiras.id,
      homeScore: 0,
      awayScore: 3,
      status: 'FINISHED',
      date: daysAgo(3),
      leagueId: serieA.id,
    },
    {
      homeTeamId: flamengo.id,
      awayTeamId: internacional.id,
      homeScore: 3,
      awayScore: 0,
      status: 'FINISHED',
      date: daysAgo(1),
      leagueId: serieA.id,
    },
    {
      homeTeamId: vasco.id,
      awayTeamId: flamengo.id,
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED',
      date: daysAhead(2),
      leagueId: serieA.id,
    },
    {
      homeTeamId: palmeiras.id,
      awayTeamId: atleticoMG.id,
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED',
      date: daysAhead(4),
      leagueId: serieA.id,
    },
    {
      homeTeamId: internacional.id,
      awayTeamId: vasco.id,
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED',
      date: daysAhead(7),
      leagueId: serieA.id,
    },
    {
      homeTeamId: palmeiras.id,
      awayTeamId: flamengo.id,
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED',
      date: daysAhead(10),
      leagueId: libertadores.id,
    },
    {
      homeTeamId: gremio.id,
      awayTeamId: vasco.id,
      homeScore: 2,
      awayScore: 0,
      status: 'FINISHED',
      date: daysAgo(4),
      leagueId: serieB.id,
    },
  ])

  console.log(`  ✓ 9 matches`)

  // ── Standings ────────────────────────────────────────────────────────────────
  await db.insert(standings).values([
    // Série A
    {
      teamId: flamengo.id,
      leagueId: serieA.id,
      played: 12,
      won: 9,
      drawn: 2,
      lost: 1,
      goalsFor: 28,
      goalsAgainst: 11,
      points: 29,
    },
    {
      teamId: palmeiras.id,
      leagueId: serieA.id,
      played: 12,
      won: 8,
      drawn: 2,
      lost: 2,
      goalsFor: 24,
      goalsAgainst: 12,
      points: 26,
    },
    {
      teamId: atleticoMG.id,
      leagueId: serieA.id,
      played: 12,
      won: 6,
      drawn: 4,
      lost: 2,
      goalsFor: 19,
      goalsAgainst: 13,
      points: 22,
    },
    {
      teamId: internacional.id,
      leagueId: serieA.id,
      played: 12,
      won: 5,
      drawn: 3,
      lost: 4,
      goalsFor: 17,
      goalsAgainst: 18,
      points: 18,
    },
    {
      teamId: vasco.id,
      leagueId: serieA.id,
      played: 12,
      won: 3,
      drawn: 2,
      lost: 7,
      goalsFor: 12,
      goalsAgainst: 22,
      points: 11,
    },
    // Série B
    {
      teamId: gremio.id,
      leagueId: serieB.id,
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 8,
      points: 23,
    },
  ])

  console.log(`  ✓ 6 standings`)

  // ── Top Scorers ───────────────────────────────────────────────────────────────
  await db.insert(topScorers).values([
    // Série A
    { playerName: 'Gabriel Barbosa', teamId: flamengo.id, leagueId: serieA.id, goals: 14, assists: 5 },
    { playerName: 'Estêvão', teamId: palmeiras.id, leagueId: serieA.id, goals: 11, assists: 6 },
    { playerName: 'Paulinho', teamId: atleticoMG.id, leagueId: serieA.id, goals: 9, assists: 2 },
    { playerName: 'Vegetti', teamId: vasco.id, leagueId: serieA.id, goals: 7, assists: 1 },
    { playerName: 'Rafael Borré', teamId: internacional.id, leagueId: serieA.id, goals: 6, assists: 4 },
    { playerName: 'Bruno Henrique', teamId: flamengo.id, leagueId: serieA.id, goals: 5, assists: 8 },
    { playerName: 'Rony', teamId: palmeiras.id, leagueId: serieA.id, goals: 4, assists: 3 },
    { playerName: 'Hulk', teamId: atleticoMG.id, leagueId: serieA.id, goals: 4, assists: 2 },
    // Libertadores
    { playerName: 'Estêvão', teamId: palmeiras.id, leagueId: libertadores.id, goals: 5, assists: 3 },
    { playerName: 'Gabriel Barbosa', teamId: flamengo.id, leagueId: libertadores.id, goals: 4, assists: 2 },
    // Série B
    { playerName: 'Diego Souza', teamId: gremio.id, leagueId: serieB.id, goals: 8, assists: 3 },
  ])

  console.log(`  ✓ 11 top scorers`)

  console.log('Seeding completed.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
