import { useEffect, useMemo, useState } from 'react'

const defaultState = {
  name: 'Mosab',
  title: 'Shadow Monarch Candidate',
  level: 24,
  xp: 680,
  coins: 420,
  rank: 'A-Class',
  stats: {
    strength: 72,
    agility: 66,
    intelligence: 81,
    endurance: 64,
    discipline: 58,
    shadow: 39,
  },
  quests: [
    { id: 1, title: 'تمرين القوة', type: 'Daily Quest', difficulty: 'C', xp: 80, coins: 25, done: false },
    { id: 2, title: 'مذاكرة 45 دقيقة', type: 'Training', difficulty: 'B', xp: 120, coins: 35, done: false },
    { id: 3, title: 'شرب الماء', type: 'Recovery', difficulty: 'E', xp: 35, coins: 10, done: false },
    { id: 4, title: 'إنجاز مهمة أساسية', type: 'Main Quest', difficulty: 'A', xp: 180, coins: 60, done: false },
  ],
  skills: [
    { id: 1, name: 'Sprint Dash', category: 'Agility', level: 3, power: 65 },
    { id: 2, name: 'Focused Mind', category: 'Intelligence', level: 5, power: 82 },
    { id: 3, name: 'Iron Body', category: 'Endurance', level: 2, power: 48 },
  ],
  inventory: [
    { id: 1, name: 'Health Potion', count: 3, rarity: 'Common' },
    { id: 2, name: 'Shadow Key', count: 1, rarity: 'Rare' },
    { id: 3, name: 'Mana Crystal', count: 7, rarity: 'Epic' },
  ],
  logs: ['System awakened.', 'Daily quests loaded.', 'Hunter profile synchronized.'],
}

const xpNeeded = 1000

function loadState() {
  try {
    const saved = localStorage.getItem('hunter-system-state')
    return saved ? JSON.parse(saved) : defaultState
  } catch {
    return defaultState
  }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [active, setActive] = useState('dashboard')
  const [questForm, setQuestForm] = useState({ title: '', type: 'Daily Quest', difficulty: 'C', xp: 80, coins: 20 })
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Strength', level: 1, power: 30 })
  const [statPoints, setStatPoints] = useState(6)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('hunter-system-state', JSON.stringify(state))
  }, [state])

  const progress = Math.min(100, Math.round((state.xp / xpNeeded) * 100))
  const completedQuests = state.quests.filter(q => q.done).length

  const threat = useMemo(() => {
    const undone = state.quests.filter(q => !q.done).length
    if (undone >= 4) return 'Red Gate'
    if (undone >= 2) return 'Danger Zone'
    return 'Stable'
  }, [state.quests])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2200)
  }

  function gainReward(quest) {
    setState(prev => {
      let newXp = prev.xp + Number(quest.xp)
      let newLevel = prev.level
      let newRank = prev.rank

      while (newXp >= xpNeeded) {
        newXp -= xpNeeded
        newLevel += 1
      }

      if (newLevel >= 40) newRank = 'S-Class'
      else if (newLevel >= 30) newRank = 'A-Class'
      else if (newLevel >= 20) newRank = 'B-Class'

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        rank: newRank,
        coins: prev.coins + Number(quest.coins),
        quests: prev.quests.map(q => q.id === quest.id ? { ...q, done: true } : q),
        logs: [`Quest completed: ${quest.title} (+${quest.xp} XP)`, ...prev.logs].slice(0, 8)
      }
    })
    notify(`تم إنجاز المهمة +${quest.xp} XP`)
  }

  function resetDaily() {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => ({ ...q, done: false })),
      logs: ['Daily quests reset.', ...prev.logs].slice(0, 8)
    }))
    notify('تمت إعادة المهام اليومية')
  }

  function addQuest(e) {
    e.preventDefault()
    if (!questForm.title.trim()) return notify('اكتب اسم المهمة أولاً')
    setState(prev => ({
      ...prev,
      quests: [
        { id: Date.now(), ...questForm, xp: Number(questForm.xp), coins: Number(questForm.coins), done: false },
        ...prev.quests
      ],
      logs: [`New quest added: ${questForm.title}`, ...prev.logs].slice(0, 8)
    }))
    setQuestForm({ title: '', type: 'Daily Quest', difficulty: 'C', xp: 80, coins: 20 })
    notify('تمت إضافة المهمة')
  }

  function addSkill(e) {
    e.preventDefault()
    if (!skillForm.name.trim()) return notify('اكتب اسم المهارة أولاً')
    setState(prev => ({
      ...prev,
      skills: [{ id: Date.now(), ...skillForm, level: Number(skillForm.level), power: Number(skillForm.power) }, ...prev.skills],
      logs: [`Skill unlocked: ${skillForm.name}`, ...prev.logs].slice(0, 8)
    }))
    setSkillForm({ name: '', category: 'Strength', level: 1, power: 30 })
    notify('تمت إضافة المهارة')
  }

  function upgradeSkill(id) {
    setState(prev => {
      if (prev.coins < 50) return prev
      return {
        ...prev,
        coins: prev.coins - 50,
        skills: prev.skills.map(s => s.id === id ? { ...s, level: s.level + 1, power: Math.min(100, s.power + 8) } : s),
        logs: ['Skill upgraded. Cost: 50 coins', ...prev.logs].slice(0, 8)
      }
    })
    notify('تم تطوير المهارة')
  }

  function increaseStat(key) {
    if (statPoints <= 0) return notify('لا توجد نقاط متاحة')
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, [key]: Math.min(100, prev.stats[key] + 3) },
      logs: [`Stat increased: ${key}`, ...prev.logs].slice(0, 8)
    }))
    setStatPoints(p => p - 1)
  }

  function deleteQuest(id) {
    setState(prev => ({ ...prev, quests: prev.quests.filter(q => q.id !== id) }))
  }

  function resetAll() {
    localStorage.removeItem('hunter-system-state')
    setState(defaultState)
    setStatPoints(6)
    notify('تمت إعادة النظام')
  }

  const tabs = [
    ['dashboard', 'النظام'],
    ['quests', 'المهام'],
    ['skills', 'المهارات'],
    ['stats', 'الإحصائيات'],
    ['inventory', 'الحقيبة'],
  ]

  return (
    <main className="app">
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <div className="brand">
          <div className="sigil">影</div>
          <div>
            <p>Solo Leveling</p>
            <h1>Hunter System</h1>
          </div>
        </div>

        <nav>
          {tabs.map(([id, label]) => (
            <button className={active === id ? 'active' : ''} onClick={() => setActive(id)} key={id}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <p className="systemLine">SYSTEM MESSAGE</p>
          <h2>لقد استيقظ اللاعب {state.name}</h2>
          <p>
            أكمل المهام، اجمع الخبرة، طوّر المهارات، وارفع رتبتك حتى تصل إلى مستوى Shadow Monarch.
          </p>
          <div className="actions">
            <button onClick={resetDaily}>إعادة مهام اليوم</button>
            <button className="ghost" onClick={resetAll}>إعادة النظام</button>
          </div>
        </div>

        <div className="statusCard">
          <span>LEVEL</span>
          <strong>{state.level}</strong>
          <p>{state.rank}</p>
          <div className="xpRow"><b>{progress}%</b><b>XP</b></div>
          <div className="bar"><div style={{ width: `${progress}%` }} /></div>
        </div>
      </section>

      {active === 'dashboard' && (
        <section className="grid dashboard">
          <Card title="Player Profile">
            <div className="profile">
              <div className="avatar">S</div>
              <h3>{state.name}</h3>
              <p>{state.title}</p>
              <div className="miniGrid">
                <span>Coins: {state.coins}</span>
                <span>Threat: {threat}</span>
                <span>Quests: {completedQuests}/{state.quests.length}</span>
                <span>Points: {statPoints}</span>
              </div>
            </div>
          </Card>

          <Card title="Daily Quest Board">
            <div className="questList">
              {state.quests.slice(0, 4).map(q => (
                <QuestItem key={q.id} q={q} onComplete={gainReward} onDelete={deleteQuest} />
              ))}
            </div>
          </Card>

          <Card title="System Logs">
            <div className="logs">
              {state.logs.map((log, i) => <p key={i}>› {log}</p>)}
            </div>
          </Card>

          <Card title="Dungeon Gate">
            <div className="gateBox">
              <div className="portal"></div>
              <h3>{threat}</h3>
              <p>كلما زادت المهام غير المكتملة ارتفع مستوى الخطر.</p>
            </div>
          </Card>
        </section>
      )}

      {active === 'quests' && (
        <section className="grid two">
          <Card title="إضافة مهمة جديدة">
            <form onSubmit={addQuest} className="form">
              <input placeholder="اسم المهمة" value={questForm.title} onChange={e => setQuestForm({ ...questForm, title: e.target.value })} />
              <select value={questForm.type} onChange={e => setQuestForm({ ...questForm, type: e.target.value })}>
                <option>Daily Quest</option><option>Main Quest</option><option>Training</option><option>Recovery</option>
              </select>
              <select value={questForm.difficulty} onChange={e => setQuestForm({ ...questForm, difficulty: e.target.value })}>
                <option>E</option><option>D</option><option>C</option><option>B</option><option>A</option><option>S</option>
              </select>
              <input type="number" placeholder="XP" value={questForm.xp} onChange={e => setQuestForm({ ...questForm, xp: e.target.value })} />
              <input type="number" placeholder="Coins" value={questForm.coins} onChange={e => setQuestForm({ ...questForm, coins: e.target.value })} />
              <button>إضافة المهمة</button>
            </form>
          </Card>
          <Card title="كل المهام">
            <div className="questList">
              {state.quests.map(q => <QuestItem key={q.id} q={q} onComplete={gainReward} onDelete={deleteQuest} />)}
            </div>
          </Card>
        </section>
      )}

      {active === 'skills' && (
        <section className="grid two">
          <Card title="إضافة مهارة">
            <form onSubmit={addSkill} className="form">
              <input placeholder="اسم المهارة" value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} />
              <select value={skillForm.category} onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}>
                <option>Strength</option><option>Agility</option><option>Intelligence</option><option>Endurance</option><option>Shadow</option>
              </select>
              <input type="number" min="1" placeholder="Level" value={skillForm.level} onChange={e => setSkillForm({ ...skillForm, level: e.target.value })} />
              <input type="number" min="1" max="100" placeholder="Power" value={skillForm.power} onChange={e => setSkillForm({ ...skillForm, power: e.target.value })} />
              <button>Unlock Skill</button>
            </form>
          </Card>
          <Card title="Skill Tree">
            <div className="skillGrid">
              {state.skills.map(skill => (
                <div className="skill" key={skill.id}>
                  <div>
                    <h3>{skill.name}</h3>
                    <p>{skill.category} · Lv.{skill.level}</p>
                  </div>
                  <div className="bar"><div style={{ width: `${skill.power}%` }} /></div>
                  <button onClick={() => upgradeSkill(skill.id)}>تطوير -50 Coins</button>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {active === 'stats' && (
        <section className="grid two">
          <Card title={`نقاط التطوير المتاحة: ${statPoints}`}>
            <div className="statsList">
              {Object.entries(state.stats).map(([key, value]) => (
                <div className="stat" key={key}>
                  <div className="xpRow"><b>{labelStat(key)}</b><b>{value}</b></div>
                  <div className="bar"><div style={{ width: `${value}%` }} /></div>
                  <button onClick={() => increaseStat(key)}>+ تطوير</button>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Rank Analysis">
            <div className="rankBox">
              <h3>{state.rank}</h3>
              <p>مستواك الحالي يعتمد على مجموع XP والمهام المكتملة وتطوير الإحصائيات.</p>
              <div className="scanline"></div>
            </div>
          </Card>
        </section>
      )}

      {active === 'inventory' && (
        <section className="grid two">
          <Card title="Inventory">
            <div className="inventory">
              {state.inventory.map(item => (
                <div className="item" key={item.id}>
                  <span>{item.rarity}</span>
                  <h3>{item.name}</h3>
                  <p>Count: {item.count}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="طريقة التعديل">
            <div className="help">
              <p>تقدر تعدل من داخل الموقع بإضافة المهام والمهارات مباشرة، وسيتم حفظها في المتصفح.</p>
              <p>ولو تريد تغيير التصميم أو النصوص الأساسية، عدّل ملف <b>App.jsx</b> و <b>style.css</b>.</p>
              <p>لرفع نسخة جديدة: ارفع كل الملفات على GitHub ثم اضغط Redeploy في Vercel.</p>
            </div>
          </Card>
        </section>
      )}
    </main>
  )
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function QuestItem({ q, onComplete, onDelete }) {
  return (
    <div className={`quest ${q.done ? 'done' : ''}`}>
      <div>
        <h3>{q.title}</h3>
        <p>{q.type} · Rank {q.difficulty} · +{q.xp} XP · +{q.coins} Coins</p>
      </div>
      <div className="questActions">
        <button disabled={q.done} onClick={() => onComplete(q)}>{q.done ? 'تم' : 'إنجاز'}</button>
        <button className="danger" onClick={() => onDelete(q.id)}>حذف</button>
      </div>
    </div>
  )
}

function labelStat(key) {
  const labels = {
    strength: 'القوة',
    agility: 'السرعة',
    intelligence: 'الذكاء',
    endurance: 'التحمل',
    discipline: 'الانضباط',
    shadow: 'قوة الظل',
  }
  return labels[key] || key
}
