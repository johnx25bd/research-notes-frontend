'use client'

import { useEffect, useMemo, useState } from 'react'

/* ============================================================================
   Presence as Franchise — Newspeak House Guest Room
   A self-contained teaching demo. Deterministic seeded data.

   THE ARGUMENT: physical presence at the house — earned through verifiable,
   located check-ins over a term — is what converts into governance voice.
   Flip the franchise from "equal/credit" to "presence-weighted" and the
   winning guest request changes; the well-funded visitor who never showed
   up loses all influence. You can't buy your way in. You have to show up.
   ============================================================================ */

/* ---- model constants (the seed) ---- */
const DECAY = 0.82 // weekly time-decay: recent check-ins count for more
const TERM_WEEKS = 10 // week 10 is the decision; events run weeks 1–9
const SCALE = 18 // presence -> credit budget multiplier

type Method = 'qr' | 'nfc' | 'attest'
type Mode = 'equal' | 'presence'

interface Room {
  name: string
  method: Method
  methodLabel: string
  x: number
  y: number
  w: number
  h: number
  mx: number
  my: number
}

interface TermEvent {
  id: string
  w: number
  room: string
  name: string
}

interface Member {
  id: string
  name: string
  color: string
  pattern: string
  prefs: number[]
  credit: number
  att: string[]
  visitor?: boolean
}

interface GuestRequest {
  key: 'A' | 'B' | 'C' | 'D'
  name: string
  blurb: string
  champion: string
}

/* ---- the house: hand-built floor plan, each room with a located proof point ---- */
const ROOMS: Record<string, Room> = {
  lecture: { name: 'Lecture Hall', method: 'qr', methodLabel: 'QR on the slide', x: 40, y: 44, w: 320, h: 196, mx: 200, my: 150 },
  library: { name: 'Library', method: 'nfc', methodLabel: 'NFC sticker', x: 360, y: 44, w: 300, h: 196, mx: 510, my: 150 },
  common: { name: 'Common Room', method: 'nfc', methodLabel: 'NFC sticker', x: 40, y: 240, w: 320, h: 188, mx: 200, my: 340 },
  desk: { name: 'Front Desk', method: 'attest', methodLabel: 'Front-desk attestation', x: 360, y: 240, w: 300, h: 188, mx: 510, my: 340 },
  garden: { name: 'Garden', method: 'qr', methodLabel: 'QR sign-in post', x: 684, y: 44, w: 156, h: 384, mx: 762, my: 236 },
}

/* ---- the term: located events, week by week ---- */
const EVENTS: TermEvent[] = [
  { id: 'e1', w: 1, room: 'lecture', name: 'Opening Lecture' },
  { id: 'e2', w: 1, room: 'common', name: 'Welcome Dinner' },
  { id: 'e3', w: 2, room: 'library', name: 'Reading Group' },
  { id: 'e4', w: 2, room: 'desk', name: 'Resident Check-in' },
  { id: 'e5', w: 3, room: 'lecture', name: 'Lecture: Civic Tech' },
  { id: 'e6', w: 3, room: 'common', name: 'House Dinner' },
  { id: 'e7', w: 4, room: 'garden', name: 'Garden Social' },
  { id: 'e8', w: 5, room: 'library', name: 'Reading Group' },
  { id: 'e9', w: 5, room: 'lecture', name: 'Lecture: Democracy' },
  { id: 'e10', w: 6, room: 'common', name: 'House Dinner' },
  { id: 'e11', w: 7, room: 'lecture', name: 'Lecture: Governance' },
  { id: 'e12', w: 7, room: 'library', name: 'Reading Group' },
  { id: 'e13', w: 8, room: 'garden', name: 'Garden Social' },
  { id: 'e14', w: 8, room: 'common', name: 'House Dinner' },
  { id: 'e15', w: 9, room: 'lecture', name: 'Closing Lecture' },
  { id: 'e16', w: 9, room: 'desk', name: 'Resident Check-in' },
]
const WK_OF: Record<string, number> = Object.fromEntries(EVENTS.map((e) => [e.id, e.w]))
const ROOM_OF: Record<string, string> = Object.fromEntries(EVENTS.map((e) => [e.id, e.room]))

/* ---- the people: 5 regulars + 1 well-funded visitor with no presence trail ---- */
const MEMBERS: Member[] = [
  { id: 'amara', name: 'Amara', color: '#1d4ed8', pattern: 'Constant — almost never misses', prefs: [0.6, 0.18, 0.04, 0.18], credit: 100, att: ['e1', 'e2', 'e3', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11', 'e12', 'e13', 'e14', 'e15', 'e16'] },
  { id: 'theo', name: 'Theo', color: '#b45309', pattern: 'Regular — lectures & reading group', prefs: [0.15, 0.55, 0.1, 0.2], credit: 100, att: ['e1', 'e3', 'e5', 'e6', 'e8', 'e9', 'e11', 'e12', 'e14', 'e15'] },
  { id: 'priya', name: 'Priya', color: '#be185d', pattern: 'Steady — about half, spread across the term', prefs: [0.2, 0.15, 0.1, 0.55], credit: 100, att: ['e2', 'e3', 'e7', 'e9', 'e10', 'e12', 'e14', 'e16'] },
  { id: 'lena', name: 'Lena', color: '#6d28d9', pattern: 'Front-loaded — keen early, then faded', prefs: [0.35, 0.1, 0.1, 0.45], credit: 100, att: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'] },
  { id: 'marcus', name: 'Marcus', color: '#047857', pattern: 'Rare — a few early visits only', prefs: [0.2, 0.3, 0.3, 0.2], credit: 100, att: ['e1', 'e2', 'e5'] },
  { id: 'hugo', name: 'Hugo', color: '#64748b', visitor: true, pattern: 'Well-funded Visitor — bought in, never showed up', prefs: [0.05, 0.1, 0.8, 0.05], credit: 360, att: [] },
]

/* ---- the contested week: 4 guest requests for the guest room ---- */
const REQUESTS: GuestRequest[] = [
  { key: 'A', name: 'Aderyn Bevan', blurb: 'Mutual-aid organiser from Cardiff, running a hands-on workshop.', champion: 'amara' },
  { key: 'B', name: 'Dr. Kwame Osei', blurb: 'Researcher on algorithmic accountability, week-long residency.', champion: 'theo' },
  { key: 'C', name: 'Sasha Volkov', blurb: 'Civic-tech founder on a fundraising swing — slick, well-connected.', champion: 'hugo' },
  { key: 'D', name: 'Mira Castellano', blurb: 'Documentary filmmaker on housing justice, screening + Q&A.', champion: 'priya' },
]
const REQ_COLOR: Record<string, string> = { A: '#1d4ed8', B: '#b45309', C: '#64748b', D: '#be185d' }

/* ---- math: decayed presence, budgets, quadratic vote tallies ---- */
const presenceAt = (m: Member, W: number): number =>
  m.att.filter((id) => WK_OF[id] <= W).reduce((s, id) => s + Math.pow(DECAY, W - WK_OF[id]), 0)

function budgetOf(m: Member, W: number, mode: Mode): number {
  if (mode === 'equal') return m.credit
  return presenceAt(m, W) * SCALE
}

// Quadratic voting: a member splits their budget across requests by preference.
// credits_j = budget * p_j  ->  votes_j = sqrt(credits_j)  (cost of v votes = v²)
function memberVotes(m: Member, W: number, mode: Mode): number[] {
  const budget = budgetOf(m, W, mode)
  const total = m.prefs.reduce((a, b) => a + b, 0) || 1
  return m.prefs.map((p) => Math.sqrt(budget * (p / total)))
}

function tally(W: number, mode: Mode): number[] {
  const totals = [0, 0, 0, 0]
  for (const m of MEMBERS) {
    memberVotes(m, W, mode).forEach((x, j) => (totals[j] += x))
  }
  return totals
}

/* ---- small SVG proof-point glyphs ---- */
function ProofGlyph({ method, x, y, active }: { method: string; x: number; y: number; active?: boolean }) {
  const stroke = active ? '#0f172a' : '#94a3b8'
  const common = { stroke, strokeWidth: 1.6, fill: 'none' }
  if (method === 'qr') {
    return (
      <g transform={`translate(${x - 9},${y - 9})`}>
        <rect x="0" y="0" width="18" height="18" rx="2" fill="#fff" stroke={stroke} strokeWidth="1.4" />
        {([[2, 2], [12, 2], [2, 12]] as const).map(([px, py], i) => (
          <rect key={i} x={px} y={py} width="4" height="4" fill={stroke} />
        ))}
        <rect x="12" y="12" width="2" height="2" fill={stroke} />
        <rect x="15" y="14" width="2" height="2" fill={stroke} />
        <rect x="12" y="15" width="2" height="2" fill={stroke} />
      </g>
    )
  }
  if (method === 'nfc') {
    return (
      <g transform={`translate(${x},${y})`}>
        <circle cx="0" cy="0" r="2.4" fill={stroke} />
        <path d="M3 -5 A7 7 0 0 1 3 5" {...common} />
        <path d="M6 -8 A11 11 0 0 1 6 8" {...common} />
      </g>
    )
  }
  // attestation: clipboard with a tick
  return (
    <g transform={`translate(${x - 8},${y - 9})`}>
      <rect x="1" y="2" width="14" height="16" rx="2" fill="#fff" stroke={stroke} strokeWidth="1.4" />
      <rect x="5" y="0" width="6" height="3.5" rx="1" fill={stroke} />
      <path d="M4 10 l3 3 l5 -6" stroke={active ? '#16a34a' : stroke} strokeWidth="1.8" fill="none" />
    </g>
  )
}

function Avatar({ m, size = 28, dim = false, ring = false }: { m: Member; size?: number; dim?: boolean; ring?: boolean }) {
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity: dim ? 0.35 : 1 }}>
      <circle cx={r} cy={r} r={r - 1} fill={m.visitor ? '#fff' : m.color} stroke={m.visitor ? m.color : '#0f172a'} strokeWidth={m.visitor ? 1.6 : 1} strokeDasharray={m.visitor ? '3 2' : '0'} />
      {ring && <circle cx={r} cy={r} r={r - 1} fill="none" stroke="#0f172a" strokeWidth="2.5" />}
      <text x={r} y={r + size * 0.12} textAnchor="middle" fontSize={size * 0.42} fontWeight="700" fill={m.visitor ? m.color : '#fff'}>
        {m.name[0]}
      </text>
    </svg>
  )
}

function PanelHead({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">{n}</span>
      <div>
        <h2 className="text-base font-semibold text-slate-900 leading-none">{title}</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function Legend({ glyph, label, note }: { glyph: string; label: string; note: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0">
        <ProofGlyph method={glyph} x={13} y={13} active />
      </svg>
      <div className="leading-tight">
        <div className="font-medium text-slate-700">{label}</div>
        <div className="text-[10px] text-slate-400">{note}</div>
      </div>
    </div>
  )
}

/* ====================================================================== */

export default function Demo() {
  const [week, setWeek] = useState(TERM_WEEKS) // story arrives fully formed
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState<Mode>('equal')
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setWeek((w) => {
        if (w >= TERM_WEEKS) {
          setPlaying(false)
          return w
        }
        return w + 1
      })
    }, 850)
    return () => clearInterval(id)
  }, [playing])

  const play = () => {
    if (week >= TERM_WEEKS) setWeek(1)
    setPlaying(true)
  }

  const hoveredMember = MEMBERS.find((m) => m.id === hover) || null

  const weekEvents = EVENTS.filter((e) => e.w === week)
  const activeRooms = new Set(weekEvents.map((e) => e.room))

  // hovered member's located history, grouped by room
  const hoverHistory = useMemo<Record<string, number[]> | null>(() => {
    if (!hoveredMember) return null
    const byRoom: Record<string, number[]> = {}
    for (const id of hoveredMember.att) {
      if (WK_OF[id] > week) continue
      ;(byRoom[ROOM_OF[id]] ||= []).push(WK_OF[id])
    }
    Object.values(byRoom).forEach((a) => a.sort((x, y) => x - y))
    return byRoom
  }, [hoveredMember, week])

  const totals = useMemo(() => tally(week, mode), [week, mode])
  const maxTotal = Math.max(...totals, 0.0001)
  const winnerIdx = totals.indexOf(Math.max(...totals))

  const equalWin = useMemo(() => {
    const t = tally(TERM_WEEKS, 'equal')
    return t.indexOf(Math.max(...t))
  }, [])
  const presenceWin = useMemo(() => {
    const t = tally(TERM_WEEKS, 'presence')
    return t.indexOf(Math.max(...t))
  }, [])
  const driver = useMemo<Member | undefined>(() => {
    const regulars = MEMBERS.filter((m) => !m.visitor)
    return regulars
      .map((m) => ({ m, pres: presenceAt(m, TERM_WEEKS) }))
      .sort((a, b) => b.pres - a.pres)
      .find(({ m }) => m.prefs.indexOf(Math.max(...m.prefs)) === presenceWin)?.m
  }, [presenceWin])

  const hugo = MEMBERS.find((m) => m.id === 'hugo')!

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-slate-800 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <header className="mb-5 border-b border-slate-300 pb-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Presence as Franchise</h1>
            <span className="text-xs uppercase tracking-widest text-slate-500">Newspeak House · Guest Room</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Voice in the house is earned in space and over time. Located check-ins across a term accrue into <em>presence</em>;
            presence becomes a vote budget; the budget decides who gets the guest room. Recent showing-up counts for more than a one-off.
          </p>
        </header>

        {/* =================== PANEL 1 — THE HOUSE =================== */}
        <section className="mb-5 rounded-lg border border-slate-300 bg-white shadow-sm">
          <PanelHead
            n="1"
            title="The House"
            sub={
              hoveredMember
                ? `${hoveredMember.name}'s check-ins — which rooms, which weeks`
                : `Located proof points · Week ${week} ${weekEvents.length ? '— ' + weekEvents.map((e) => e.name).join(', ') : '— decision week'}`
            }
          />
          <div className="grid md:grid-cols-[1fr_220px] gap-0">
            <div className="p-3">
              <svg viewBox="0 0 880 470" className="w-full h-auto select-none">
                <rect x="34" y="38" width="632" height="396" rx="4" fill="#fbfaf6" stroke="#0f172a" strokeWidth="2" />
                {Object.entries(ROOMS).map(([id, r]) => {
                  const isActive = activeRooms.has(id)
                  const visited = hoverHistory && hoverHistory[id]
                  const fill = id === 'garden' ? '#eef6ee' : '#fbfaf6'
                  return (
                    <g key={id}>
                      <rect
                        x={r.x}
                        y={r.y}
                        width={r.w}
                        height={r.h}
                        rx="3"
                        fill={visited ? '#fff7ed' : fill}
                        stroke={visited ? hoveredMember?.color || '#0f172a' : '#475569'}
                        strokeWidth={visited ? 2.4 : 1.2}
                        strokeDasharray={id === 'garden' ? '6 4' : '0'}
                      />
                      {isActive && !hoveredMember && (
                        <circle cx={r.mx} cy={r.my} r="14" fill="none" stroke="#16a34a" strokeWidth="2">
                          <animate attributeName="r" values="12;26;12" dur="1.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <ProofGlyph method={r.method} x={r.mx} y={r.my} active={isActive || !!visited} />
                      <text x={r.x + 10} y={r.y + 20} fontSize="13" fontWeight="600" fill="#0f172a">
                        {r.name}
                      </text>
                      <text x={r.x + 10} y={r.y + 35} fontSize="10.5" fill="#64748b">
                        {r.methodLabel}
                      </text>
                      {visited && (
                        <g>
                          {visited.map((wk, i) => (
                            <g key={i} transform={`translate(${r.mx - (visited.length - 1) * 11 + i * 22},${r.my + 26})`}>
                              <circle r="9" fill={hoveredMember!.color} />
                              <text textAnchor="middle" y="3.5" fontSize="9.5" fontWeight="700" fill="#fff">
                                {wk}
                              </text>
                            </g>
                          ))}
                        </g>
                      )}
                    </g>
                  )
                })}
                <path d="M360 412 a16 16 0 0 0 16 16" fill="none" stroke="#475569" strokeWidth="1.2" />
                <rect x="350" y="426" width="36" height="6" fill="#fbfaf6" stroke="#0f172a" strokeWidth="1.5" />
                <text x="368" y="450" fontSize="9.5" fill="#94a3b8" textAnchor="middle">
                  entrance
                </text>
                <circle cx="720" cy="120" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                <circle cx="804" cy="360" r="12" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
              </svg>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 p-4 text-xs">
              <div className="font-semibold text-slate-700 mb-2 uppercase tracking-wide text-[10px]">Proof of presence</div>
              <Legend glyph="qr" label="QR code" note="Lecture Hall slide, Garden post" />
              <Legend glyph="nfc" label="NFC sticker" note="Library, Common Room" />
              <Legend glyph="attest" label="Attestation" note="Front-desk sign-in" />
              <p className="mt-3 text-slate-500 leading-relaxed">
                Every check-in is tied to a place and a moment. Hover a member below to trace exactly where and when they showed up.
              </p>
            </div>
          </div>
        </section>

        {/* =================== PANEL 2 — THE TERM =================== */}
        <section className="mb-5 rounded-lg border border-slate-300 bg-white shadow-sm">
          <PanelHead n="2" title="The Term" sub="Scrub the 10-week term — watch presence accrue from located check-ins" />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => (playing ? setPlaying(false) : play())}
                className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700 transition"
              >
                {playing ? '❚❚ Pause' : '▶ Play term'}
              </button>
              <input
                type="range"
                min="1"
                max={TERM_WEEKS}
                value={week}
                onChange={(e) => {
                  setPlaying(false)
                  setWeek(+e.target.value)
                }}
                className="flex-1 accent-slate-900"
              />
              <span className="text-sm font-mono text-slate-700 w-20 text-right">
                Week {week}/{TERM_WEEKS}
              </span>
            </div>

            <div className="relative h-16 mb-5">
              <div className="absolute left-0 right-0 top-8 h-px bg-slate-300" />
              {Array.from({ length: TERM_WEEKS }, (_, i) => i + 1).map((w) => {
                const evs = EVENTS.filter((e) => e.w === w)
                const passed = w <= week
                const left = `${((w - 1) / (TERM_WEEKS - 1)) * 100}%`
                return (
                  <div key={w} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left, top: 0 }}>
                    {evs.map((e, i) => (
                      <div
                        key={e.id}
                        title={`${e.name} @ ${ROOMS[e.room].name}`}
                        className="mb-0.5 h-2 w-2 rounded-full"
                        style={{ background: passed ? '#16a34a' : '#cbd5e1', transform: `translateY(${i * -3}px)` }}
                      />
                    ))}
                    <div className={`mt-1 h-3 w-px ${passed ? 'bg-slate-700' : 'bg-slate-300'}`} style={{ marginTop: 'auto' }} />
                    <span className={`mt-1 text-[10px] font-mono ${w === week ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{w}</span>
                  </div>
                )
              })}
              {week === TERM_WEEKS && (
                <div className="absolute -translate-x-1/2 top-0 text-[10px] font-semibold text-slate-900" style={{ left: '100%' }}>
                  ↓ decision
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MEMBERS.map((m) => {
                const pres = presenceAt(m, week)
                const budget = budgetOf(m, week, mode)
                const isHover = hover === m.id
                const checkins = m.att.filter((id) => WK_OF[id] <= week).length
                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHover(m.id)}
                    onMouseLeave={() => setHover(null)}
                    className={`rounded-md border p-2 cursor-pointer transition ${
                      isHover ? 'border-slate-900 bg-slate-50 shadow' : 'border-slate-200 bg-white'
                    } ${m.visitor ? 'border-dashed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar m={m} size={26} ring={isHover} />
                      <div className="leading-tight">
                        <div className="text-xs font-semibold text-slate-800">{m.name}</div>
                        <div className="text-[9px] text-slate-400">{checkins} check-ins</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded bg-slate-100 overflow-hidden mb-1">
                      <div className="h-full rounded transition-all" style={{ width: `${Math.min(100, (pres / 7) * 100)}%`, background: m.color }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span title="decayed presence">P {pres.toFixed(1)}</span>
                      <span title="vote budget" className="font-semibold text-slate-700">
                        ⊞ {Math.round(budget)}
                      </span>
                    </div>
                    <div className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">{m.pattern}</div>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              <span className="font-mono">P</span> = decayed presence (recent weeks weighted more) · <span className="font-mono">⊞</span> = vote
              budget under the current franchise. Note Lena: keen early, then absent — her presence has decayed below the steadier members.
            </p>
          </div>
        </section>

        {/* =================== PANEL 3 — THE DECISION =================== */}
        <section className="rounded-lg border border-slate-300 bg-white shadow-sm">
          <PanelHead n="3" title="The Decision" sub="Week 10 — one guest room, four requests. Quadratic votes, summed." />
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1">
                {(
                  [
                    ['equal', 'Equal / credit franchise'],
                    ['presence', 'Presence-weighted franchise'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setMode(val)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                      mode === val ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {mode === 'equal'
                  ? 'Budget = credits held. Regulars hold an equal 100 — the Visitor bought 360.'
                  : 'Budget = decayed presence × scale. No presence, no budget.'}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="space-y-3">
                {REQUESTS.map((req, j) => {
                  const champ = MEMBERS.find((m) => m.id === req.champion)!
                  const val = totals[j]
                  const isWin = j === winnerIdx
                  return (
                    <div key={req.key} className={`rounded-md border p-3 transition ${isWin ? 'border-slate-900 bg-amber-50 shadow' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white" style={{ background: REQ_COLOR[req.key] }}>
                            {req.key}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{req.name}</span>
                          {isWin && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">★ Winner</span>}
                        </div>
                        <span className="text-sm font-mono font-semibold text-slate-700">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-3 rounded bg-slate-100 overflow-hidden mb-2">
                        <div className="h-full rounded transition-all duration-500" style={{ width: `${(val / maxTotal) * 100}%`, background: REQ_COLOR[req.key] }} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{req.blurb}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>championed by</span>
                        <Avatar m={champ} size={16} />
                        <span className="font-medium text-slate-700">{champ.name}</span>
                        {champ.visitor && <span className="text-slate-400">(the Visitor)</span>}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Flip the franchise</div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Equal/credit weighting elects <b style={{ color: REQ_COLOR[REQUESTS[equalWin].key] }}>{REQUESTS[equalWin].name}</b>. Switch to
                    presence-weighting and the winner becomes <b style={{ color: REQ_COLOR[REQUESTS[presenceWin].key] }}>{REQUESTS[presenceWin].name}</b>.
                  </p>
                  {driver && (
                    <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">
                      The change is carried by <b style={{ color: driver.color }}>{driver.name}</b>, the most-present member —{' '}
                      {presenceAt(driver, TERM_WEEKS).toFixed(1)} presence from {driver.att.length} check-ins across the Lecture Hall, Library, Common
                      Room and Garden, week after week. Hover {driver.name} above to see the trail light up.
                    </p>
                  )}
                </div>

                <div className="rounded-md border-2 border-slate-900 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar m={hugo} size={28} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">The Well-funded Visitor</div>
                      <div className="text-[10px] text-slate-500">0 check-ins · no presence trail on the map</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center mb-2">
                    <div className="rounded border border-slate-200 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Equal / credit</div>
                      <div className="text-xl font-bold text-slate-900 font-mono">{hugo.credit}</div>
                      <div className="text-[10px] text-slate-500">budget — sways the vote</div>
                    </div>
                    <div className="rounded border border-slate-200 p-2 bg-slate-50">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Presence-weighted</div>
                      <div className="text-xl font-bold text-slate-400 font-mono">0</div>
                      <div className="text-[10px] text-slate-500">budget — collapses</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">You can&apos;t buy your way in — you have to show up.</p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Under credit weighting Hugo&apos;s 360 bought credits push {REQUESTS[2].name} to the top. Weight by presence and his budget is zero:{' '}
                    {REQUESTS[2].name} falls to last, because Hugo was never in the building.
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  QV in the background: each member splits their budget across requests by a seeded preference profile; cost of <i>v</i> votes is{' '}
                  <i>v</i>², so votes bought = √credits. Deterministic seed — the story is always the same.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-5 text-center text-[11px] text-slate-400">A teaching demo · located, temporal presence → governance voice</footer>
      </div>
    </div>
  )
}
