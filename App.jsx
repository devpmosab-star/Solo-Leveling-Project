const dailyTasks = [
  { title: 'تمرين القوة', reward: '+20 XP', status: 'جاهز' },
  { title: 'مذاكرة 45 دقيقة', reward: '+15 XP', status: 'جاهز' },
  { title: 'شرب الماء', reward: '+10 XP', status: 'جاهز' },
  { title: 'إنجاز مهمة أساسية', reward: '+30 XP', status: 'جاهز' },
]

const stats = [
  { label: 'القوة', value: 72 },
  { label: 'التحمل', value: 64 },
  { label: 'الذكاء', value: 81 },
  { label: 'الانضباط', value: 58 },
]

export default function App() {
  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Hunter System</p>
          <h1>Solo Leveling Project</h1>
          <p className="subtitle">
            لوحة متابعة يومية لتطوير المستوى، المهام، الإحصائيات، والإنجازات.
          </p>
        </div>
        <div className="level-card">
          <span>LEVEL</span>
          <strong>24</strong>
          <p>Shadow Hunter</p>
        </div>
      </section>

      <section className="grid">
        <div className="panel profile">
          <h2>الملف الشخصي</h2>
          <div className="avatar">S</div>
          <h3>Player Mosab</h3>
          <p>Rank: A-Class</p>
          <div className="xp">
            <div className="xp-top">
              <span>XP</span>
              <span>68%</span>
            </div>
            <div className="bar"><div style={{ width: '68%' }} /></div>
          </div>
        </div>

        <div className="panel">
          <h2>المهام اليومية</h2>
          <div className="tasks">
            {dailyTasks.map((task) => (
              <div className="task" key={task.title}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.status}</p>
                </div>
                <span>{task.reward}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>الإحصائيات</h2>
          <div className="stats">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <div className="xp-top">
                  <span>{stat.label}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="bar"><div style={{ width: `${stat.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel gate">
          <h2>بوابة التحدي</h2>
          <p>تحدي اليوم: أنجز 3 مهام قبل نهاية اليوم للحصول على مكافأة إضافية.</p>
          <button>ابدأ التحدي</button>
        </div>
      </section>
    </main>
  )
}
