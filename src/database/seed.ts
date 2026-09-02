import { hash } from 'bcryptjs'
import { db } from './client'
import {
  users,
  leagues,
  categories,
  teams,
  rounds,
  posts,
  matches,
  players,
  matchGoals,
  standings,
  topScorers,
  photoAlbums,
  streams,
} from './schema'

const SALT_ROUNDS = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = (h = 0, m = 0) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}
const daysAgo = (n: number, h = 16, m = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(h, m, 0, 0)
  return d
}
const daysAhead = (n: number, h = 16, m = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(h, m, 0, 0)
  return d
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Populando banco de dados...\n')

  // Limpa na ordem inversa das dependências
  await db.delete(matchGoals)
  await db.delete(topScorers)
  await db.delete(standings)
  await db.delete(players)
  await db.delete(matches)
  await db.delete(rounds)
  await db.delete(posts)
  await db.delete(teams)
  await db.delete(categories)
  await db.delete(leagues)
  await db.delete(photoAlbums)
  await db.delete(streams)
  await db.delete(users)

  // ── Usuários ────────────────────────────────────────────────────────────────
  const [adminPw, editorPw] = await Promise.all([
    hash('Admin@123!', SALT_ROUNDS),
    hash('User@123!', SALT_ROUNDS),
  ])

  const [admin, editor] = await db
    .insert(users)
    .values([
      { name: 'Administrador', email: 'admin@urucuisportes.com', password: adminPw, role: 'ADMIN' },
      { name: 'Carlos Mendes', email: 'editor@urucuisportes.com', password: editorPw, role: 'USER' },
    ])
    .returning()

  console.log('  ✓ 2 usuários')
  console.log('    admin@urucuisportes.com / Admin@123!')
  console.log('    editor@urucuisportes.com / User@123!\n')

  // ── Ligas ───────────────────────────────────────────────────────────────────
  const [copaPontos, torneioGrupos] = await db
    .insert(leagues)
    .values([
      {
        name: 'Copa Urucuí 2025',
        slug: 'copa-urucui-2025',
        country: 'Brasil',
        tipo: 'pontos_corridos',
      },
      {
        name: 'Torneio Piauiense 2025',
        slug: 'torneio-piauiense-2025',
        country: 'Brasil',
        tipo: 'grupos',
        numeroGrupos: 2,
      },
    ])
    .returning()

  console.log('  ✓ 2 ligas')

  // ── Categorias ───────────────────────────────────────────────────────────────
  const [catFutebol, catEntrevistas, catEsportes] = await db
    .insert(categories)
    .values([
      { name: 'Futebol Local', slug: 'futebol-local' },
      { name: 'Entrevistas', slug: 'entrevistas' },
      { name: 'Esportes', slug: 'esportes' },
    ])
    .returning()

  console.log('  ✓ 3 categorias')

  // ── Times – Copa Urucuí (pontos corridos) ────────────────────────────────────
  const [urucuiFC, sportUrucui, juventus, santosMFC] = await db
    .insert(teams)
    .values([
      { name: 'Urucuí FC',          leagueId: copaPontos.id },
      { name: 'Sport Urucuí',       leagueId: copaPontos.id },
      { name: 'Juventus Urucuiense',leagueId: copaPontos.id },
      { name: 'Santos de Urucuí',   leagueId: copaPontos.id },
    ])
    .returning()

  // ── Times – Torneio Piauiense (grupos) ──────────────────────────────────────
  // Grupo 1
  const [fluminensePi, atleticoPi, estrelaUrucui] = await db
    .insert(teams)
    .values([
      { name: 'Fluminense Piauiense', leagueId: torneioGrupos.id, grupo: 1 },
      { name: 'Atlético Piauiense',   leagueId: torneioGrupos.id, grupo: 1 },
      { name: 'Estrela de Urucuí',    leagueId: torneioGrupos.id, grupo: 1 },
    ])
    .returning()

  // Grupo 2
  const [cruzeiroPi, nacionalUrucui, esportivoUrucui] = await db
    .insert(teams)
    .values([
      { name: 'Cruzeiro do Piauí',  leagueId: torneioGrupos.id, grupo: 2 },
      { name: 'Nacional de Urucuí', leagueId: torneioGrupos.id, grupo: 2 },
      { name: 'Esportivo Urucuí',   leagueId: torneioGrupos.id, grupo: 2 },
    ])
    .returning()

  console.log('  ✓ 10 times')

  // ── Rodadas – Copa Urucuí ────────────────────────────────────────────────────
  const roundsCopa = await db
    .insert(rounds)
    .values([
      { leagueId: copaPontos.id, numero: 1, nome: '1ª Rodada' },
      { leagueId: copaPontos.id, numero: 2, nome: '2ª Rodada' },
      { leagueId: copaPontos.id, numero: 3, nome: '3ª Rodada' },
      { leagueId: copaPontos.id, numero: 4, nome: '4ª Rodada' },
    ])
    .returning()

  const [r1, r2, r3, r4] = roundsCopa

  // ── Rodadas – Torneio Piauiense ──────────────────────────────────────────────
  const roundsTorneio = await db
    .insert(rounds)
    .values([
      { leagueId: torneioGrupos.id, numero: 1, nome: '1ª Rodada – Fase de Grupos', grupo: 1 },
      { leagueId: torneioGrupos.id, numero: 2, nome: '2ª Rodada – Fase de Grupos', grupo: 1 },
    ])
    .returning()

  const [rt1, rt2] = roundsTorneio

  console.log('  ✓ 6 rodadas')

  // ── Partidas – Copa Urucuí ───────────────────────────────────────────────────
  const [
    m1, m2,       // Rodada 1 (encerradas, há 14 dias)
    m3, m4,       // Rodada 2 (encerradas, há 7 dias)
    m5, m6,       // Rodada 3 (encerradas, há 2 dias)
    m7, m8,       // Rodada 4 (HOJE – ao vivo + agendada)
  ] = await db
    .insert(matches)
    .values([
      // Rodada 1
      {
        homeTeamId: urucuiFC.id, awayTeamId: juventus.id,
        homeScore: 3, awayScore: 1, status: 'FINISHED',
        date: daysAgo(14), leagueId: copaPontos.id, roundId: r1.id,
      },
      {
        homeTeamId: sportUrucui.id, awayTeamId: santosMFC.id,
        homeScore: 0, awayScore: 0, status: 'FINISHED',
        date: daysAgo(14, 19), leagueId: copaPontos.id, roundId: r1.id,
      },
      // Rodada 2
      {
        homeTeamId: juventus.id, awayTeamId: santosMFC.id,
        homeScore: 2, awayScore: 2, status: 'FINISHED',
        date: daysAgo(7), leagueId: copaPontos.id, roundId: r2.id,
      },
      {
        homeTeamId: urucuiFC.id, awayTeamId: sportUrucui.id,
        homeScore: 1, awayScore: 0, status: 'FINISHED',
        date: daysAgo(7, 19), leagueId: copaPontos.id, roundId: r2.id,
      },
      // Rodada 3
      {
        homeTeamId: santosMFC.id, awayTeamId: urucuiFC.id,
        homeScore: 1, awayScore: 2, status: 'FINISHED',
        date: daysAgo(2), leagueId: copaPontos.id, roundId: r3.id,
      },
      {
        homeTeamId: juventus.id, awayTeamId: sportUrucui.id,
        homeScore: 0, awayScore: 1, status: 'FINISHED',
        date: daysAgo(2, 19), leagueId: copaPontos.id, roundId: r3.id,
      },
      // Rodada 4 – HOJE
      {
        homeTeamId: sportUrucui.id, awayTeamId: urucuiFC.id,
        homeScore: 1, awayScore: 0, status: 'LIVE',
        date: today(15), leagueId: copaPontos.id, roundId: r4.id,
      },
      {
        homeTeamId: santosMFC.id, awayTeamId: juventus.id,
        homeScore: null, awayScore: null, status: 'SCHEDULED',
        date: today(17), leagueId: copaPontos.id, roundId: r4.id,
      },
    ])
    .returning()

  // ── Partidas – Torneio Piauiense ─────────────────────────────────────────────
  await db.insert(matches).values([
    {
      homeTeamId: fluminensePi.id, awayTeamId: atleticoPi.id,
      homeScore: 2, awayScore: 1, status: 'FINISHED',
      date: daysAgo(10), leagueId: torneioGrupos.id, roundId: rt1.id,
    },
    {
      homeTeamId: estrelaUrucui.id, awayTeamId: fluminensePi.id,
      homeScore: 0, awayScore: 0, status: 'FINISHED',
      date: daysAgo(5), leagueId: torneioGrupos.id, roundId: rt2.id,
    },
    {
      homeTeamId: cruzeiroPi.id, awayTeamId: esportivoUrucui.id,
      homeScore: 3, awayScore: 0, status: 'FINISHED',
      date: daysAgo(10, 19), leagueId: torneioGrupos.id, roundId: rt1.id,
    },
    {
      homeTeamId: nacionalUrucui.id, awayTeamId: cruzeiroPi.id,
      homeScore: 1, awayScore: 2, status: 'FINISHED',
      date: daysAgo(5, 19), leagueId: torneioGrupos.id, roundId: rt2.id,
    },
    {
      homeTeamId: atleticoPi.id, awayTeamId: estrelaUrucui.id,
      homeScore: null, awayScore: null, status: 'SCHEDULED',
      date: daysAhead(3), leagueId: torneioGrupos.id, roundId: rt2.id,
    },
  ])

  console.log('  ✓ 13 partidas (incluindo 1 ao vivo hoje)')

  // ── Jogadores ────────────────────────────────────────────────────────────────
  const jogadoresUrucuiFC = await db
    .insert(players)
    .values([
      { name: 'Felipe Araújo',   position: 'Atacante',   teamId: urucuiFC.id },
      { name: 'Marcos Santos',   position: 'Meia',       teamId: urucuiFC.id },
      { name: 'João Victor',     position: 'Defensor',   teamId: urucuiFC.id },
      { name: 'Rafael Lima',     position: 'Atacante',   teamId: urucuiFC.id },
    ])
    .returning()

  const jogadoresSport = await db
    .insert(players)
    .values([
      { name: 'Anderson Costa',  position: 'Atacante',   teamId: sportUrucui.id },
      { name: 'Leandro Alves',   position: 'Meia',       teamId: sportUrucui.id },
      { name: 'Bruno Ferreira',  position: 'Defensor',   teamId: sportUrucui.id },
    ])
    .returning()

  const jogadoresJuventus = await db
    .insert(players)
    .values([
      { name: 'Diego Nunes',     position: 'Atacante',   teamId: juventus.id },
      { name: 'Thiago Brito',    position: 'Meia',       teamId: juventus.id },
      { name: 'Carlos Eduardo',  position: 'Defensor',   teamId: juventus.id },
    ])
    .returning()

  const jogadoresSantos = await db
    .insert(players)
    .values([
      { name: 'Mateus Oliveira', position: 'Atacante',   teamId: santosMFC.id },
      { name: 'Lucas Medeiros',  position: 'Meia',       teamId: santosMFC.id },
      { name: 'Henrique Paz',    position: 'Defensor',   teamId: santosMFC.id },
    ])
    .returning()

  const [felipe, marcos, , rafael] = jogadoresUrucuiFC
  const [anderson, leandro] = jogadoresSport
  const [diego, thiago] = jogadoresJuventus
  const [mateus] = jogadoresSantos

  console.log('  ✓ 13 jogadores')

  // ── Gols das partidas ────────────────────────────────────────────────────────
  await db.insert(matchGoals).values([
    // m1: Urucuí FC 3 × 1 Juventus (R1)
    { matchId: m1.id, playerId: felipe.id,   teamId: urucuiFC.id, goals: 2 },
    { matchId: m1.id, playerId: rafael.id,   teamId: urucuiFC.id, goals: 1 },
    { matchId: m1.id, playerId: diego.id,    teamId: juventus.id,  goals: 1 },
    // m3: Juventus 2 × 2 Santos (R2)
    { matchId: m3.id, playerId: diego.id,    teamId: juventus.id,  goals: 2 },
    { matchId: m3.id, playerId: mateus.id,   teamId: santosMFC.id, goals: 2 },
    // m4: Urucuí FC 1 × 0 Sport (R2)
    { matchId: m4.id, playerId: marcos.id,   teamId: urucuiFC.id, goals: 1 },
    // m5: Santos 1 × 2 Urucuí FC (R3)
    { matchId: m5.id, playerId: mateus.id,   teamId: santosMFC.id, goals: 1 },
    { matchId: m5.id, playerId: felipe.id,   teamId: urucuiFC.id, goals: 1 },
    { matchId: m5.id, playerId: rafael.id,   teamId: urucuiFC.id, goals: 1 },
    // m6: Juventus 0 × 1 Sport (R3)
    { matchId: m6.id, playerId: anderson.id, teamId: sportUrucui.id, goals: 1 },
    // m7: Sport 1 × 0 Urucuí FC – AO VIVO
    { matchId: m7.id, playerId: leandro.id,  teamId: sportUrucui.id, goals: 1 },
  ])

  console.log('  ✓ 11 registros de gols')

  // ── Artilharia ───────────────────────────────────────────────────────────────
  await db.insert(topScorers).values([
    // Copa Urucuí
    { playerName: 'Felipe Araújo',   teamId: urucuiFC.id,   leagueId: copaPontos.id, goals: 4, assists: 1 },
    { playerName: 'Diego Nunes',     teamId: juventus.id,   leagueId: copaPontos.id, goals: 3, assists: 0 },
    { playerName: 'Mateus Oliveira', teamId: santosMFC.id,  leagueId: copaPontos.id, goals: 3, assists: 0 },
    { playerName: 'Rafael Lima',     teamId: urucuiFC.id,   leagueId: copaPontos.id, goals: 2, assists: 2 },
    { playerName: 'Anderson Costa',  teamId: sportUrucui.id,leagueId: copaPontos.id, goals: 1, assists: 0 },
    { playerName: 'Leandro Alves',   teamId: sportUrucui.id,leagueId: copaPontos.id, goals: 1, assists: 3 },
    { playerName: 'Marcos Santos',   teamId: urucuiFC.id,   leagueId: copaPontos.id, goals: 1, assists: 1 },
    // Torneio Piauiense
    { playerName: 'Raimundo Filho',  teamId: cruzeiroPi.id,     leagueId: torneioGrupos.id, goals: 3, assists: 1 },
    { playerName: 'Edinaldo Silva',  teamId: fluminensePi.id,   leagueId: torneioGrupos.id, goals: 2, assists: 0 },
    { playerName: 'Fábio Moraes',    teamId: nacionalUrucui.id, leagueId: torneioGrupos.id, goals: 1, assists: 2 },
  ])

  console.log('  ✓ 10 artilheiros')

  // ── Posts ────────────────────────────────────────────────────────────────────
  await db.insert(posts).values([
    {
      title: 'Urucuí FC vence Juventus de virada na abertura da Copa Urucuí 2025',
      slug: 'urucui-fc-vence-juventus-abertura-copa-2025',
      content: `A Copa Urucuí 2025 começou com emoção. O Urucuí FC superou o Juventus Urucuiense por 3 a 1 no Estádio Municipal em partida que agitou os torcedores locais. Felipe Araújo foi o destaque da noite, marcando dois gols e sendo eleito o melhor em campo. A próxima rodada acontece no domingo com confronto direto entre Sport e Santos.`,
      imageUrl: null,
      categoryId: catFutebol.id,
      authorId: editor.id,
    },
    {
      title: 'Torneio Piauiense 2025: fase de grupos começa animada',
      slug: 'torneio-piauiense-2025-fase-grupos-começa',
      content: `O Torneio Piauiense 2025 deu largada com a fase de grupos. No Grupo 1, o Fluminense Piauiense larga na frente após vencer o Atlético Piauiense por 2 a 1. No Grupo 2, o Cruzeiro do Piauí goleou o Esportivo Urucuí por 3 a 0 e é favorito ao título. A segunda rodada dos grupos acontece na próxima semana.`,
      imageUrl: null,
      categoryId: catFutebol.id,
      authorId: admin.id,
    },
    {
      title: 'Entrevista: Felipe Araújo fala sobre expectativas para a Copa Urucuí',
      slug: 'entrevista-felipe-araujo-expectativas-copa-urucui',
      content: `O atacante Felipe Araújo, artilheiro da Copa Urucuí com 4 gols em 3 jogos, falou com exclusividade ao Urucuí Esportes. "Estamos muito motivados. O grupo do Urucuí FC está unido e nosso objetivo é levantar o troféu", declarou o jogador, que também destacou o apoio da torcida como fundamental para o desempenho da equipe.`,
      imageUrl: null,
      categoryId: catEntrevistas.id,
      authorId: editor.id,
    },
    {
      title: 'Sport Urucuí bate Juventus e mantém invencibilidade',
      slug: 'sport-urucui-bate-juventus-mantem-invencibilidade',
      content: `Com um gol de Anderson Costa no segundo tempo, o Sport Urucuí derrotou o Juventus Urucuiense por 1 a 0 na 3ª rodada da Copa Urucuí 2025. Com o resultado, o Sport mantém 100% de aproveitamento no torneio e pressiona o líder Urucuí FC. A próxima rodada, marcada para hoje, coloca os dois líderes frente a frente.`,
      imageUrl: null,
      categoryId: catFutebol.id,
      authorId: editor.id,
    },
    {
      title: 'Finais do torneio municipal de futsal são confirmadas para outubro',
      slug: 'finais-torneio-municipal-futsal-outubro',
      content: `A Secretaria Municipal de Esportes de Urucuí confirmou que as finais do Torneio Municipal de Futsal acontecerão na segunda quinzena de outubro. Oito times disputam as vagas nas semifinais, que serão realizadas no Ginásio Poliesportivo Municipal. A entrada será gratuita para toda a população.`,
      imageUrl: null,
      categoryId: catEsportes.id,
      authorId: admin.id,
    },
  ])

  console.log('  ✓ 5 notícias')

  // ── Álbuns de fotos ──────────────────────────────────────────────────────────
  await db.insert(photoAlbums).values([
    {
      title: 'Copa Urucuí 2025 – 1ª Rodada',
      description: 'Imagens das partidas da abertura da Copa Urucuí 2025 no Estádio Municipal.',
      url: 'https://example.com/albuns/copa-urucui-r1',
      coverUrl: null,
    },
    {
      title: 'Torneio Piauiense 2025 – Abertura',
      description: 'Momentos marcantes da fase de grupos do Torneio Piauiense 2025.',
      url: 'https://example.com/albuns/torneio-piauiense-abertura',
      coverUrl: null,
    },
    {
      title: 'Treino Urucuí FC – Pré-temporada',
      description: 'Bastidores do treino preparatório do Urucuí FC para a temporada 2025.',
      url: 'https://example.com/albuns/urucui-fc-pre-temporada',
      coverUrl: null,
    },
  ])

  console.log('  ✓ 3 álbuns de fotos')

  // ── Transmissões ─────────────────────────────────────────────────────────────
  await db.insert(streams).values([
    {
      title: 'Sport Urucuí x Urucuí FC – 4ª Rodada Copa Urucuí AO VIVO',
      description: 'Clássico da 4ª rodada da Copa Urucuí 2025 transmitido ao vivo.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'LIVE',
      scheduledAt: today(15),
    },
    {
      title: 'Santos de Urucuí x Juventus Urucuiense – 4ª Rodada',
      description: 'Transmissão da segunda partida da 4ª rodada da Copa Urucuí 2025.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'SCHEDULED',
      scheduledAt: today(17),
    },
    {
      title: 'Melhores momentos – 3ª Rodada Copa Urucuí 2025',
      description: 'Compilado dos gols e lances da 3ª rodada da Copa Urucuí.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'FINISHED',
      scheduledAt: daysAgo(2),
    },
  ])

  console.log('  ✓ 3 transmissões')

  console.log('\n✅ Banco de dados populado com sucesso!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Falha ao popular o banco:', err)
  process.exit(1)
})
