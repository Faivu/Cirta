// Slides for Cirta FYP deck — 9 slides total

const TOTAL = 10;

// ============================================================
// SLIDE 1 — Title / Hero
// ============================================================
function Slide01() {
  return (
    <section data-screen-label="01 Title">
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '720px 1fr', height: '100%' }}>

        {/* LEFT — Title column */}
        <div style={{
          padding: '120px 64px 120px 100px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: PAPER
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '8px 14px', borderRadius: 999,
              background: 'rgba(38,49,230,0.08)',
              fontFamily: 'var(--font-mono)', fontSize: 14,
              color: CIRTA_BLUE, letterSpacing: '0.04em',
              marginBottom: 56
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CIRTA_BLUE }} />
              FINAL YEAR PROJECT · 2026
            </div>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 220, fontWeight: 600,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              color: INK,
              marginBottom: 32
            }}>
              Cirta<span style={{ color: CIRTA_AMBER }}>.</span>
            </div>

            <div style={{
              fontSize: 36, lineHeight: 1.2, fontWeight: 400,
              letterSpacing: '-0.02em', color: '#1F2937',
              maxWidth: 540, marginBottom: 64,
              textWrap: 'balance'
            }}>
              A productivity &amp; scheduling application for university students.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <div className="mono-label" style={{ marginBottom: 8 }}>
</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK, lineHeight: 1.4 }}>
                Djaoued Safir Boukhalfa
              </div>
              <div style={{ fontSize: 18, color: MUTE, lineHeight: 1.5 }}>
                BSc Software Engineering · University of Salford
              </div>
            </div>
            <div>
              <div className="mono-label" style={{ marginBottom: 8 }}>Supervisors</div>
              <div style={{ fontSize: 20, color: INK, lineHeight: 1.5 }}>
                Maira Alamgir &nbsp;·&nbsp; Lee Griffiths
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Hero screenshot */}
        <div style={{ position: 'relative',
          background: `linear-gradient(160deg, ${CIRTA_BLUE} 0%, #1A22B8 100%)`,
          padding: '80px 80px 80px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.6
          }} />
          {/* amber dot accent */}
          <div style={{
            position: 'absolute', top: 80, right: 80,
            width: 12, height: 12, borderRadius: '50%', background: CIRTA_AMBER
          }} />
          <div style={{
            position: 'absolute', top: 80, right: 110,
            fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.06em'
          }}>LIVE · cirta.io</div>

          <div style={{ width: '100%', maxWidth: 1080, position: 'relative', zIndex: 1 }}>
            <BrowserFrame url="cirta.io/dashboard" height={620} accent>
              <img src="assets/dashboard-hero.png" alt="Cirta dashboard"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }} />
            </BrowserFrame>
          </div>
        </div>
      </div>

      <SlideChrome index={1} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 2 — The Problem
// ============================================================
function Slide02() {
  const competitors = [
  { name: 'Google Calendar', critique: 'Assumes you already know how to plan.', logo: 'assets/logo-google-calendar.png' },
  { name: 'Pomofocus', critique: 'No tasks. No scheduling.', logo: 'assets/logo-pomofocus.png' },
  { name: 'Amazing Marvin', critique: 'Too complex for the average student.', logo: 'assets/logo-amazing-marvin.png' }];


  return (
    <section data-screen-label="02 Problem">
      <div style={{ padding: '110px 100px 140px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 60 }}>
          <PanelTitle>01 · The Problem</PanelTitle>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, flex: 1 }}>

          {/* LEFT — bold statements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div style={{
              fontSize: 60, fontWeight: 600, lineHeight: 1.08,
              letterSpacing: '-0.028em', color: INK, textWrap: 'balance'
            }}>
              Students underperform not from lack of ability,{' '}
              <span style={{ color: CIRTA_BLUE }}>but from poor self-regulated learning.</span>
            </div>

            <div style={{ height: 1, background: LINE, marginTop: 4 }} />

            <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 38, fontWeight: 500, color: '#1F2937', lineHeight: 1.3, letterSpacing: '-0.012em' }}>
              <li style={{ display: 'flex', gap: 22 }}>
                <span style={{ color: CIRTA_BLUE, fontFamily: 'var(--font-mono)', fontSize: 28, paddingTop: 8 }}>—</span>
                <span>Existing tools address one thing at a time</span>
              </li>
              <li style={{ display: 'flex', gap: 22 }}>
                <span style={{ color: CIRTA_BLUE, fontFamily: 'var(--font-mono)', fontSize: 28, paddingTop: 8 }}>—</span>
                <span>Students without productivity experience face too steep a learning curve</span>
              </li>
            </ul>
          </div>

          {/* RIGHT — competitor cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="mono-label" style={{ marginBottom: 4 }}>What's out there</div>
            {competitors.map((c, i) =>
            <div key={i} style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: '34px 40px',
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 36, alignItems: 'center',
              flex: 1, minHeight: 0
            }}>
                <div style={{
                width: 120, height: 120, borderRadius: 22,
                background: '#fff',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                  <img src={c.logo} alt={c.name + ' logo'}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 600, color: INK, marginBottom: 10, letterSpacing: '-0.025em', lineHeight: 1.05 }}>{c.name}</div>
                  <div style={{ fontSize: 24, color: MUTE, lineHeight: 1.4 }}>{c.critique}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom callout */}
        <div style={{
          marginTop: 56,
          padding: '32px 44px',
          background: INK,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 28
        }}>
          <div style={{
            width: 4, alignSelf: 'stretch', background: CIRTA_AMBER, borderRadius: 2
          }} />
          <div style={{ fontSize: 32, fontWeight: 500, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.015em' }}>
            None of them implement a user centric design.
          </div>
        </div>
      </div>

      <SlideChrome index={2} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 3 — Aim
// ============================================================
function Slide03() {
  const aims = [
  'Help students manage academic time without prior productivity experience',
  'Integrate focus techniques, task management, and scheduling in one place',
  'Lower the barrier to self-regulated learning'];


  return (
    <section data-screen-label="03 Aim">
      <div style={{ padding: '110px 140px 140px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ marginBottom: 80 }}>
          <PanelTitle>02 · Project Aim</PanelTitle>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 120, flex: 1, alignItems: 'center' }}>

          <div>
            <div style={{
              fontSize: 84, fontWeight: 600, lineHeight: 1.0,
              letterSpacing: '-0.035em', color: INK, textWrap: 'balance',
              marginBottom: 32
            }}>
              Make self-regulated learning <span style={{ color: CIRTA_BLUE }}>approachable</span>.
            </div>
            <div style={{ fontSize: 24, color: MUTE, lineHeight: 1.45, maxWidth: 520 }}>
              Bring focus, tasks, and scheduling into one workflow that meets students where they are.
            </div>
          </div>

          <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {aims.map((a, i) =>
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 24, alignItems: 'start' }}>
                <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 16, color: CIRTA_BLUE,
                paddingTop: 8, fontWeight: 500, letterSpacing: '0.04em'
              }}>0{i + 1}</div>
                <div style={{
                fontSize: 28, lineHeight: 1.35, color: INK,
                letterSpacing: '-0.015em', fontWeight: 500, textWrap: 'pretty',
                paddingBottom: 24, borderBottom: i < aims.length - 1 ? `1px solid ${LINE}` : 'none'
              }}>
                  {a}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <SlideChrome index={3} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 4 — The Solution (feature grid)
// ============================================================
function Slide04Panels({ slideIndex, slice, partLabel }) {
  const allFeatures = [
  {
    n: '01', name: 'Focus Sessions',
    bullets: ['Pomodoro · Flowtime · Time Blocking', 'Multiple strategies for one timer'],
    img: 'assets/feature-sessions.png'
  },
  {
    n: '02', name: 'Analytics',
    bullets: ['Daily · weekly · monthly breakdowns', 'Strategy usage + study patterns'],
    img: 'assets/feature-analytics.png'
  },
  {
    n: '03', name: 'Calendar',
    bullets: ['Visual scheduling of deadlines + study blocks', 'Drag-and-drop event editing'],
    img: 'assets/feature-calendar.png'
  },
  {
    n: '04', name: 'To-Do List',
    bullets: ['Create, edit, delete tasks', 'Grouped: Today · Upcoming · No Date'],
    img: 'assets/feature-todo-v2.png'
  }];
  const features = allFeatures.slice(slice[0], slice[1]);

  return (
    <section data-screen-label={`0${slideIndex} Solution ${partLabel}`}>
      <div style={{ padding: '90px 100px 130px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 50 }}>
          <div>
            <PanelTitle>03 · The Solution &nbsp;·&nbsp; {partLabel}</PanelTitle>
            <div style={{
              fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>
              Four panels. <span style={{ color: MUTE }}>One workflow.</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: MUTE, letterSpacing: '0.06em' }}>
            cirta.io/dashboard
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, flex: 1 }}>
          {features.map((f, i) =>
          <div key={i} style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            padding: 32,
            display: 'flex', flexDirection: 'column', gap: 22,
            minHeight: 0
          }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18, color: CIRTA_BLUE,
                  letterSpacing: '0.06em', fontWeight: 500
                }}>{f.n}</div>
                  <div style={{ fontSize: 40, fontWeight: 600, color: INK, letterSpacing: '-0.025em' }}>
                    {f.name}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${LINE}`, background: '#0F172A' }}>
                {f.img &&
              <img src={f.img} alt={f.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#0F172A' }} />
              }
              </div>

              <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {f.bullets.map((b, j) =>
              <li key={j} style={{
                fontSize: 22, color: '#1F2937', display: 'flex', gap: 12, alignItems: 'baseline'
              }}>
                    <span style={{ color: CIRTA_BLUE, fontFamily: 'var(--font-mono)', fontSize: 14 }}>●</span>
                    {b}
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <SlideChrome index={slideIndex} total={TOTAL} />
    </section>);

}

function Slide04() {return <Slide04Panels slideIndex={4} slice={[0, 2]} partLabel="Part 1 of 2" />;}
function Slide04b() {return <Slide04Panels slideIndex={5} slice={[2, 4]} partLabel="Part 2 of 2" />;}

// ============================================================
// SLIDE 5 — Technical Implementation (stack)
// ============================================================
function Slide05() {
  const stack = [
  { layer: 'Frontend', tech: 'React', note: 'CSS Custom Properties · Component-driven UI', logo: 'assets/tech-react.png' },
  { layer: 'Backend', tech: 'Symfony 7.2', note: 'PHP · Doctrine ORM · REST endpoints', logo: 'assets/tech-symfony.png' },
  { layer: 'Database', tech: 'MariaDB', note: 'Railway-hosted · Doctrine migrations', logo: 'assets/tech-mariadb.png' },
  { layer: 'Auth', tech: 'Google OAuth 2.0', note: 'Single sign-on · Token refresh', logo: 'assets/tech-google.png' }];

  const deployment = [
  { name: 'Docker', note: 'Containerisation', logo: 'assets/tech-docker.png' },
  { name: 'Railway', note: 'Hosting + DB', logo: 'assets/tech-railway.png' },
  { name: 'Cloudflare', note: 'HTTPS + DNS', logo: 'assets/tech-cloudflare.png' }];



  return (
    <section data-screen-label="05 Tech Stack">
      <div style={{ padding: '90px 100px 130px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 50 }}>
          <div>
            <PanelTitle>04 · Technical Implementation</PanelTitle>
            <div style={{
              fontSize: 72, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>
              How it was built.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 40, flex: 1, minHeight: 0 }}>
          {/* LEFT — 4 stack cards in 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 20 }}>
            {stack.map((s, i) =>
            <div key={i} style={{
              background: '#fff', border: `1px solid ${LINE}`,
              borderRadius: 14, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', minHeight: 0
            }}>
                <div style={{
                padding: '10px 24px',
                background: i === 0 ? CIRTA_BLUE : '#F4F4EE',
                color: i === 0 ? '#fff' : MUTE,
                fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: '0.06em',
                textTransform: 'uppercase', fontWeight: 500,
                borderBottom: `1px solid ${LINE}`
              }}>{s.layer}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 160px', minHeight: 0, width: "388px" }}>
                  <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, width: "328px" }}>
                    <div style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.025em', lineHeight: 1.0 }}>{s.tech}</div>
                    <div style={{ color: MUTE, lineHeight: 1.35, fontSize: "23px" }}>{s.note}</div>
                  </div>
                  <div style={{
                  display: 'flex', justifyContent: 'center',
                  borderLeft: `1px solid ${LINE}`, background: '#FAFAF7', borderWidth: "0px", borderLeftStyle: "solid", borderLeftColor: "rgb(229, 231, 235)", height: "325px", flexDirection: "row", alignItems: "center", padding: "0px 0px 0px 16px", borderRadius: "0px", width: "271px", gap: "9px"
                }}>
                    <img src={s.logo} alt={s.tech + ' logo'}
                  style={{ maxHeight: 90, maxWidth: 130, opacity: "1", margin: "0px", borderWidth: "0px", borderStyle: "solid", objectFit: "contain", height: "228px", width: "297px", padding: "0px 37.5859px 0px 0px" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — vertical Deployment card */}
          <div style={{
            background: INK, color: '#fff',
            borderRadius: 14, padding: '32px 32px 36px',
            display: 'flex', flexDirection: 'column', minHeight: 0
          }}>
            <div style={{
              padding: '6px 14px', borderRadius: 999, alignSelf: 'flex-start',
              background: CIRTA_AMBER, color: INK,
              fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.06em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: 18
            }}>Deployment</div>

            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 32, color: CIRTA_AMBER,
              letterSpacing: '0.02em', marginBottom: 6
            }}>cirta.io</div>
            <div style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 1.45, marginBottom: 24 }}>
              HTTPS · Continuous deploy
            </div>

            {/* vertical pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
              {deployment.map((d, i) =>
              <React.Fragment key={i}>
                  <div style={{
                  display: 'grid', gridTemplateColumns: '92px 1fr',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 18px',
                  alignItems: 'center', gap: 18, flex: 1, minHeight: 0
                }}>
                    <div style={{
                    background: '#fff', borderRadius: 10,
                    width: 92, height: 92,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 10, fontSize: "23px"
                  }}>
                      <img src={d.logo} alt={d.name + ' logo'}
                    style={{ maxWidth: '100%', maxHeight: '100%', height: "56px", width: "205px", objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.0, marginBottom: 4 }}>{d.name}</div>
                      <div style={{ color: '#9CA3AF', lineHeight: 1.3, fontSize: "23px" }}>{d.note}</div>
                    </div>
                  </div>
                  {i < deployment.length - 1 &&
                <div style={{ display: 'flex', justifyContent: 'center', color: CIRTA_AMBER, fontSize: 22, lineHeight: 1, opacity: 0.7 }}>↓</div>
                }
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </div>

      <SlideChrome index={6} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 6 — System Modeling (Class + ER diagrams)
// ============================================================
function Slide06() {
  return (
    <section data-screen-label="06 System Modeling">
      <div style={{ padding: '110px 100px 130px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 50 }}>
          <div>
            <PanelTitle>05 · System Modeling</PanelTitle>
            <div style={{
              fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>The Foundation and Documentation.

            </div>
          </div>
          <div style={{ maxWidth: 420, fontSize: 18, color: MUTE, lineHeight: 1.5, paddingBottom: 8, textWrap: 'pretty' }}>
            UML class and entity-relationship diagrams drove the data model and the Strategy pattern behind Sessions.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}> UML: Class Diagram

              </div>
              <div className="mono-label">CLASS DIAGRAM</div>
            </div>
            <div style={{
              flex: 1, minHeight: 0,
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
              <img src="assets/diagram-class.svg" alt="Cirta UML class diagram"
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>Database: Entity-Relationship

              </div>
              <div className="mono-label">ER DIAGRAM</div>
            </div>
            <div style={{
              flex: 1, minHeight: 0,
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}>
              <img src="assets/diagram-er-v3.png" alt="Cirta entity-relationship diagram"
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      </div>

      <SlideChrome index={7} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 7 — Agile / Increments
// ============================================================
function Slide07() {
  const incs = [
  {
    n: '01', label: 'MVP',
    title: 'Core features + public deployment',
    bullets: ['Sessions, tasks, calendar', 'Google OAuth', 'Live on cirta.app'],
    tone: 'primary'
  },
  {
    n: '02', label: 'Expansion',
    title: 'Strategies, panel system, analytics',
    bullets: ['Flowtime + Time Blocking', 'Configurable panels', 'Session analytics'],
    tone: 'neutral'
  },
  {
    n: '03', label: 'Polish',
    title: 'Settings, dark mode, onboarding',
    bullets: ['Settings screen', 'Dark mode', 'Onboarding + bug fixes'],
    tone: 'accent'
  }];


  return (
    <section data-screen-label="07 Increments">
      <div style={{ padding: '110px 100px 130px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 60 }}>
          <div>
            <PanelTitle>06 · Execution</PanelTitle>
            <div style={{
              fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>
              Agile development — three increments.
            </div>
          </div>
        </div>

        {/* timeline rail */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'stretch' }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 56, height: 2,
            background: `repeating-linear-gradient(90deg, ${LINE} 0 12px, transparent 12px 22px)`
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36, width: '100%' }}>
            {incs.map((inc, i) => {
              const dotColor = inc.tone === 'primary' ? CIRTA_BLUE : inc.tone === 'accent' ? CIRTA_AMBER : '#9CA3AF';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#fff',
                    border: `3px solid ${dotColor}`, position: 'relative', zIndex: 1,
                    marginBottom: 28, marginTop: 40, marginLeft: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor }} />
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 14, color: MUTE,
                    letterSpacing: '0.06em', marginBottom: 8
                  }}>INCREMENT {inc.n}</div>

                  <div style={{
                    fontSize: 44, fontWeight: 600, letterSpacing: '-0.025em',
                    color: dotColor === '#9CA3AF' ? INK : dotColor, marginBottom: 16, lineHeight: 1.0
                  }}>{inc.label}</div>

                  <div style={{
                    fontSize: 24, fontWeight: 500, color: INK, lineHeight: 1.3,
                    marginBottom: 24, letterSpacing: '-0.015em', textWrap: 'balance'
                  }}>{inc.title}</div>

                  <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {inc.bullets.map((b, j) =>
                    <li key={j} style={{
                      fontSize: 18, color: '#1F2937', display: 'flex', gap: 12,
                      paddingLeft: 0
                    }}>
                        <span style={{ color: dotColor, fontFamily: 'var(--font-mono)', fontSize: 14, paddingTop: 2 }}>—</span>
                        {b}
                      </li>
                    )}
                  </ul>
                </div>);

            })}
          </div>
        </div>
      </div>

      <SlideChrome index={8} total={TOTAL} />
    </section>);

}

// ============================================================
// SLIDE 8 — Testing (Usability + Functional + Cross-Browser)
// ============================================================
function Slide08() {
  return (
    <section data-screen-label="08 Testing">
      <div style={{ padding: '90px 100px 130px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <PanelTitle>07 · Evaluation</PanelTitle>
            <div style={{
              fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>
              Tested with real students.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, paddingBottom: 8 }}>
            <Stat n="3" label="INCREMENTS TESTED" />
            <Stat n="4" label="BROWSERS" />
            <Stat n="0" label="VISUAL DEFECTS" color={CIRTA_BLUE} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>

          {/* LEFT — usability with photo */}
          <div style={{
            background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12,
            padding: 32, display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>
                Usability Testing
              </div>
              <div className="mono-label">QUALITATIVE</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1, minHeight: 0 }}>
              <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                'Pilot study + 2 formal sessions',
                'Core interactions learnable without guidance',
                'Feedback shaped each increment',
                'Found well-organised, flexible, approachable'].
                map((b, i) =>
                <li key={i} style={{ display: 'flex', gap: 12, fontSize: 18, color: '#1F2937', lineHeight: 1.4 }}>
                    <span style={{ color: CIRTA_BLUE, fontFamily: 'var(--font-mono)', fontSize: 14, paddingTop: 3 }}>—</span>
                    {b}
                  </li>
                )}
              </ul>

              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${LINE}`, minHeight: 0 }}>
                <Placeholder label="[ PHOTO — usability testing session, participants interacting with Cirta ]" />
              </div>
            </div>
          </div>

          {/* RIGHT — functional + cross-browser */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
            <div style={{
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12,
              padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
                  API &amp; Validation
                </div>
                <div className="mono-label">FUNCTIONAL</div>
              </div>
              <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ fontSize: 17, color: '#1F2937', lineHeight: 1.45 }}>
                  ▸ Endpoints tested for valid/invalid input, auth, ownership
                </li>
                <li style={{ fontSize: 17, color: '#1F2937', lineHeight: 1.45 }}>
                  ▸ One gap: event end-time accepted before start — flagged for next iteration
                </li>
              </ul>
            </div>

            <div style={{
              background: INK, color: '#fff', borderRadius: 12,
              padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
                  Cross-Browser
                </div>
                <div className="mono-label" style={{ color: '#9CA3AF' }}>4 BROWSERS</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Brave', 'Chrome', 'Firefox', 'Safari'].map((b) =>
                <span key={b} style={{
                  padding: '8px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  fontSize: 16, color: '#fff'
                }}>{b}</span>
                )}
              </div>
              <div style={{ fontSize: 17, color: '#9CA3AF', lineHeight: 1.4, marginTop: 'auto' }}>
                No visual or functional inconsistencies across any browser.
              </div>
            </div>
          </div>
        </div>
      </div>

      <SlideChrome index={9} total={TOTAL} />
    </section>);

}

function Stat({ n, label, color = INK }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontSize: 56, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.0, color
      }}>{n}</div>
      <div style={{
        fontSize: 12, fontFamily: 'var(--font-mono)', color: MUTE,
        letterSpacing: '0.08em', marginTop: 4
      }}>{label}</div>
    </div>);

}

// ============================================================
// SLIDE 9 — Conclusions & Future Work
// ============================================================
function Slide09() {
  const conclusions = [
  { bold: 'Aim achieved.', body: 'Cirta is a publicly deployed, fully functional productivity application used and evaluated by real students.' },
  { bold: 'Measurable improvement.', body: 'Usability scores increased between increments — iterative development worked.' },
  { bold: 'Lessons learned.', body: 'Browser throttling, OAuth as a single point of failure, the importance of self-testing for timing-sensitive bugs.' }];


  const future = [
  'Subtask decomposition',
  'Session → Calendar event consolidation',
  'Longitudinal testing in academic context',
  'Fallback authentication method'];


  return (
    <section data-screen-label="09 Conclusions">
      <div style={{ padding: '90px 100px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
          <div>
            <PanelTitle>08 · Conclusions</PanelTitle>
            <div style={{
              fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em',
              color: INK, marginTop: 18, lineHeight: 1.0
            }}>
              What Cirta is, today.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, flex: 1, minHeight: 0 }}>

          {/* LEFT — conclusions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {conclusions.map((c, i) =>
            <div key={i} style={{
              padding: '22px 24px',
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10,
              display: 'grid', gridTemplateColumns: '40px 1fr', gap: 18, alignItems: 'baseline'
            }}>
                <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 14, color: CIRTA_BLUE,
                letterSpacing: '0.06em', fontWeight: 500
              }}>0{i + 1}</div>
                <div style={{ fontSize: 21, lineHeight: 1.4, color: INK, textWrap: 'pretty' }}>
                  <span style={{ fontWeight: 600 }}>{c.bold}</span>{' '}
                  <span style={{ color: '#374151' }}>{c.body}</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — future + screenshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            <div style={{ flex: '0 0 auto', borderRadius: 10, overflow: 'hidden', border: `1px solid ${LINE}`, height: 240 }}>
              <Placeholder label="[ Analytics panel — week's worth of session data ]" />
            </div>

            <div style={{
              background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10,
              padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
                  Future Work
                </div>
                <div className="mono-label">NEXT</div>
              </div>
              <ul className="clean" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {future.map((f, i) =>
                <li key={i} style={{
                  fontSize: 17, color: '#1F2937', display: 'flex', gap: 12, alignItems: 'baseline',
                  paddingBottom: 8, borderBottom: i < future.length - 1 ? `1px solid ${LINE}` : 'none'
                }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: CIRTA_AMBER }}>→</span>
                    {f}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom banner — full width */}
        <div style={{
          margin: '40px -100px 0',
          padding: '36px 100px 56px',
          background: CIRTA_BLUE,
          color: '#fff',
          display: 'flex', alignItems: 'center', gap: 32
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.7)', writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            paddingTop: 8
          }}>FINAL STATEMENT</div>
          <div style={{
            fontSize: 38, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.02em',
            textWrap: 'balance', maxWidth: 1400
          }}>
            Cirta in its current state is a complete application that addresses{' '}
            <span style={{ color: CIRTA_AMBER }}>the problem it set out to solve.</span>
          </div>
        </div>
      </div>

      <SlideChrome index={10} total={TOTAL} />
    </section>);

}

Object.assign(window, {
  Slide01, Slide02, Slide03, Slide04, Slide04b, Slide05, Slide06, Slide07, Slide08, Slide09
});