import React, { useState, useEffect, useMemo } from 'react';

const RANGES = [
    { id: 'today', label: 'Day' },
    { id: 'week',  label: 'Week'  },
    { id: 'month', label: 'Month' },
];

const STRATEGY_META = {
    pomodoro:      { label: 'Pomodoro',      color: 'var(--strategy-pomodoro)' },
    flowtime:      { label: 'Flowtime',      color: 'var(--strategy-flowtime)' },
    time_blocking: { label: 'Time Blocking', color: 'var(--strategy-time-blocking)' },
};

function formatMinutes(mins) {
    if (!mins) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function toDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function isToday(dateStr) {
    return dateStr === toDateStr(new Date());
}

/** Compute the from/to Date objects for a given range + offset (0 = current, 1 = previous, …) */
function computeDates(range, offset) {
    const DAYS = range === 'week' ? 7 : 30;

    if (range === 'today') {
        const from = new Date();
        from.setDate(from.getDate() - offset);
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);
        return { from, to };
    }

    // week / month
    const to = new Date();
    if (offset > 0) {
        to.setDate(to.getDate() - DAYS * offset);
        to.setHours(23, 59, 59, 999);
    }
    const from = new Date(to);
    from.setDate(from.getDate() - (DAYS - 1));
    from.setHours(0, 0, 0, 0);
    return { from, to };
}

function getPeriodLabel(range, offset, from, to) {
    if (range === 'today') {
        if (offset === 0) return 'Today';
        if (offset === 1) return 'Yesterday';
        return from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    if (offset === 0) return range === 'week' ? 'This week' : 'This month';
    if (offset === 1) return range === 'week' ? 'Last week' : 'Last month';
    const fmt = d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${fmt(from)} – ${fmt(to)}`;
}

/** Build a full list of date strings (no gaps) between from and to */
function buildDayList(from, to) {
    const days = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
        days.push(toDateStr(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
}

function sampleDays(days, n) {
    if (days.length <= n) return days;
    const result = [];
    const step = (days.length - 1) / (n - 1);
    for (let i = 0; i < n; i++) result.push(days[Math.round(i * step)]);
    return result;
}

function formatDayLabel(dateStr, range) {
    const d = new Date(dateStr + 'T00:00:00');
    if (range === 'month') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function AnalyticsPanel() {
    const [range, setRange]   = useState('today');
    const [offset, setOffset] = useState(0);
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const { from, to } = useMemo(() => computeDates(range, offset), [range, offset]);
    const periodLabel   = getPeriodLabel(range, offset, from, to);

    const handleRangeChange = (newRange) => {
        setRange(newRange);
        setOffset(0);
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
            from: from.toISOString(),
            to:   to.toISOString(),
        });
        fetch(`/api/analytics?${params}`, { headers: { Accept: 'application/json' } })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d  => { setData(d); setLoading(false); })
            .catch(() => { setError('Failed to load analytics.'); setLoading(false); });
    }, [from, to]);

    return (
        <div className="analytics-panel">
            <div className="analytics-range">
                {RANGES.map(r => (
                    <button
                        key={r.id}
                        className={`analytics-range-btn${range === r.id ? ' active' : ''}`}
                        onClick={() => handleRangeChange(r.id)}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
            <div className="analytics-header">
                <div className="analytics-nav">
                    <button className="analytics-nav-btn" onClick={() => setOffset(o => o + 1)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <span className="analytics-nav-label">{periodLabel}</span>
                    <button
                        className="analytics-nav-btn"
                        onClick={() => setOffset(o => o - 1)}
                        disabled={offset === 0}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="analytics-body">
                {loading && <div className="analytics-loading">Loading...</div>}
                {error   && <div className="analytics-error">{error}</div>}
                {!loading && !error && data && (
                    <div className="analytics-columns">
                        <div className="analytics-top-row">
                            <div className="analytics-top-card">
                                <span className="analytics-stat-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </span>
                                <div className="analytics-stat">
                                    <span className="analytics-stat-label">Focus time</span>
                                    <span className="analytics-stat-value accent">{formatMinutes(data.totalFocusMinutes)}</span>
                                </div>
                            </div>
                            <div className="analytics-top-card">
                                <span className="analytics-stat-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2a10 10 0 1 0 10 10" />
                                        <path d="M12 6v6l3 3" />
                                        <path d="M16 2l4 4-4 4" />
                                    </svg>
                                </span>
                                <div className="analytics-stat">
                                    <span className="analytics-stat-label">Avg session</span>
                                    <span className="analytics-stat-value">
                                        {data.averageSessionMinutes > 0 ? formatMinutes(Math.round(data.averageSessionMinutes)) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="analytics-col-chart">
                            {range === 'today'
                                ? <DayTimeline data={data} />
                                : <DailyChart data={data} range={range} from={from} to={to} />
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryStats({ data }) {
    return (
        <div className="analytics-summary-stats">
            <div className="analytics-stat">
                <span className="analytics-stat-label">Focus time</span>
                <span className="analytics-stat-value accent">{formatMinutes(data.totalFocusMinutes)}</span>
            </div>
            <div className="analytics-stat">
                <span className="analytics-stat-label">Avg session</span>
                <span className="analytics-stat-value">
                    {data.averageSessionMinutes > 0 ? formatMinutes(Math.round(data.averageSessionMinutes)) : '—'}
                </span>
            </div>
        </div>
    );
}

function getYTicks(maxMins) {
    const steps = [15, 30, 60, 90, 120, 180, 240, 300, 360, 480];
    const interval = steps.find(s => maxMins / s <= 4) || 480;
    const ticks = [];
    for (let t = interval; t <= maxMins; t += interval) ticks.push(t);
    return ticks;
}

function buildWeeks(from, to) {
    const weeks = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
        const weekStart = new Date(cursor);
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > end) weekEnd.setTime(end.getTime());
        weeks.push({ start: toDateStr(weekStart), end: toDateStr(weekEnd) });
        cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
}

function DailyChart({ data, range, from, to }) {
    const dayMap = Object.fromEntries((data.dailyMinutes || []).map(d => [d.date, d.minutes]));

    const stratByDay = {};
    (data.dailyStrategyMinutes || []).forEach(r => {
        if (!stratByDay[r.date]) stratByDay[r.date] = {};
        stratByDay[r.date][r.strategy] = r.minutes;
    });

    // Build display items — days for week view, weeks for month view
    let items;
    if (range === 'month') {
        items = buildWeeks(from, to).map(w => {
            const days = buildDayList(new Date(w.start), new Date(w.end));
            const mins = days.reduce((sum, d) => sum + (dayMap[d] || 0), 0);
            const stratMins = {};
            days.forEach(d => Object.entries(stratByDay[d] || {}).forEach(([s, m]) => {
                stratMins[s] = (stratMins[s] || 0) + m;
            }));
            const startD = new Date(w.start + 'T00:00:00');
            const endD   = new Date(w.end   + 'T00:00:00');
            const sameMonth = startD.getMonth() === endD.getMonth();
            let label, sublabel;
            if (sameMonth) {
                label    = `${startD.getDate()}–${endD.getDate()}`;
                sublabel = startD.toLocaleDateString(undefined, { month: 'short' });
            } else {
                label    = `${startD.getDate()} ${startD.toLocaleDateString(undefined, { month: 'short' })}`;
                sublabel = `– ${endD.getDate()} ${endD.toLocaleDateString(undefined, { month: 'short' })}`;
            }
            return { key: w.start, label, sublabel, mins, segments: Object.entries(stratMins), today: days.includes(toDateStr(new Date())) };
        });
    } else {
        const allDays = buildDayList(from, to);
        items = allDays.map(date => {
            const d = new Date(date + 'T00:00:00');
            return {
                key: date,
                label: d.toLocaleDateString(undefined, { weekday: 'short' }),
                sublabel: d.toLocaleDateString(undefined, { day: 'numeric' }),
                mins: dayMap[date] || 0,
                segments: Object.entries(stratByDay[date] || {}),
                today: isToday(date),
            };
        });
    }

    const maxMinutes = Math.max(...items.map(i => i.mins), 120);
    const ticks = getYTicks(maxMinutes);
    const title = range === 'month' ? 'Monthly Focus' : 'Weekly Focus';

    return (
        <div className="analytics-section">
            <div className="analytics-section-title">{title}</div>
            <div className="analytics-chart">
                {items.every(i => i.mins === 0) ? (
                    <div className="analytics-empty">No sessions in this period</div>
                ) : (
                    <div className="analytics-chart-inner">
                        <div className="analytics-y-axis">
                            {ticks.map(t => (
                                <span key={t} className="analytics-y-label" style={{ bottom: `${(t / maxMinutes) * 100}%` }}>
                                    {formatMinutes(t)}
                                </span>
                            ))}
                        </div>
                        <div className="analytics-bars-wrap">
                            {ticks.map(t => (
                                <div key={t} className="analytics-grid-line" style={{ bottom: `${(t / maxMinutes) * 100}%` }} />
                            ))}
                            <div className="analytics-bars">
                                {items.map(item => {
                                    const pct = Math.round((item.mins / maxMinutes) * 100);
                                    return (
                                        <div key={item.key} className="analytics-bar-col"
                                            title={`${item.label}: ${formatMinutes(item.mins)}`}
>
                                            <div
                                                className={`analytics-bar${item.mins > 0 ? ' has-data' : ''}${item.today ? ' today' : ''}`}
                                                style={{ height: `${Math.max(pct, item.mins > 0 ? 4 : 0)}%` }}
                                            >
                                                {item.segments.map(([strategy, sMins]) => {
                                                    const meta = STRATEGY_META[strategy] ?? { color: '#9ca3af' };
                                                    return <div key={strategy} style={{ flex: sMins, background: meta.color }} />;
                                                })}
                                            </div>
                                            <span className="analytics-bar-label" style={item.today ? { color: '#7c3aed', fontWeight: 600, background: '#ede9fe', borderRadius: 4 } : undefined}>
                                                {item.label}
                                                {item.sublabel && <><br />{item.sublabel}</>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="analytics-timeline-legend">
                {Object.entries(STRATEGY_META).map(([key, meta]) => (
                    <div key={key} className="analytics-legend-item">
                        <span className="analytics-legend-dot" style={{ background: meta.color }} />
                        <span className="analytics-strategy-name">{meta.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StrategyBreakdown({ data }) {
    const rows = data.strategyBreakdown || [];
    const totalSessions = rows.reduce((sum, r) => sum + r.count, 0);

    if (totalSessions === 0) {
        return (
            <div className="analytics-stacked-h-bar">
                <div className="analytics-section-title">Strategies</div>
                <div className="analytics-stacked-h-track">
                    <div style={{ width: '100%', height: '100%', background: '#e5e7eb', borderRadius: 8 }} />
                </div>
                <span className="analytics-strategy-comment">No sessions, no strategies.</span>
            </div>
        );
    }

    const strategyCount = rows.length;
    let comment;
    if (strategyCount === 1) {
        const meta = STRATEGY_META[rows[0].strategy] ?? { label: rows[0].strategy };
        comment = `${meta.label} lover.`;
    } else {
        comment = 'Mixed bag.';
    }

    return (
        <div className="analytics-stacked-h-bar">
            <div className="analytics-section-title">Strategies</div>
            <div className="analytics-stacked-h-track">
                {rows.map(row => {
                    const meta = STRATEGY_META[row.strategy] ?? { color: '#9ca3af' };
                    const pct  = (row.count / totalSessions) * 100;
                    return (
                        <div
                            key={row.strategy}
                            className="analytics-stacked-h-segment"
                            style={{ width: `${pct}%`, background: meta.color }}
                        />
                    );
                })}
            </div>
            <div className="analytics-stacked-h-labels">
                {rows.map(row => {
                    const meta = STRATEGY_META[row.strategy] ?? { color: '#9ca3af', label: row.strategy };
                    const pct  = Math.round((row.count / totalSessions) * 100);
                    return (
                        <div key={row.strategy} className="analytics-stacked-h-label" style={{ width: `${pct}%` }}>
                            {pct >= 12 && <span style={{ color: meta.color }}>{pct}%</span>}
                        </div>
                    );
                })}
            </div>
            <span className="analytics-strategy-comment">{comment}</span>
        </div>
    );
}

function formatHour(h) {
    if (h === 0 || h === 24) return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function DayTimeline({ data }) {
    const sessions = data.timelineSessions;
    const [tooltip, setTooltip] = useState(null);

    if (!sessions || sessions.length === 0) {
        return (
            <div className="analytics-section">
                <div className="analytics-section-title">Timeline</div>
                <div className="analytics-chart">
                    <div className="analytics-empty">No sessions today</div>
                </div>
                <div className="analytics-timeline-legend">
                    {Object.entries(STRATEGY_META).map(([key, meta]) => (
                        <div key={key} className="analytics-legend-item">
                            <span className="analytics-legend-dot" style={{ background: meta.color }} />
                            <span className="analytics-strategy-name">{meta.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const PAD = 30;
    const MINUTES_IN_DAY = 24 * 60;

    const startMinutes = sessions.map(s => {
        const d = new Date(s.startTime);
        return d.getHours() * 60 + d.getMinutes();
    });
    const endMinutes = sessions.map((s, i) => startMinutes[i] + s.duration);

    const viewStart = Math.max(0, Math.min(...startMinutes) - PAD);
    const viewEnd   = Math.min(MINUTES_IN_DAY, Math.max(...endMinutes) + PAD);
    const viewRange = viewEnd - viewStart;

    const startHour = Math.ceil(viewStart / 60);
    const endHour   = Math.floor(viewEnd / 60);
    const ticks = [];
    for (let h = startHour; h <= endHour; h++) ticks.push(h);

    return (
        <div className="analytics-section">
            <div className="analytics-section-title">Timeline</div>
            <div className="analytics-chart">
                <div className="analytics-timeline-wrap">
                    {tooltip && (
                        <div className="analytics-timeline-tooltip" style={{ left: `${tooltip.left}%` }}>
                            {tooltip.text}
                        </div>
                    )}
                    <div className="analytics-timeline-track">
                        {sessions.map((session, i) => {
                            const leftPct  = ((startMinutes[i] - viewStart) / viewRange) * 100;
                            const widthPct = Math.max((session.duration / viewRange) * 100, 0.4);
                            const meta     = STRATEGY_META[session.strategy] ?? { color: '#9ca3af', label: session.strategy };
                            return (
                                <div
                                    key={i}
                                    className="analytics-timeline-block"
                                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: meta.color }}
                                    onMouseEnter={() => setTooltip({
                                        left: leftPct + widthPct / 2,
                                        text: `${meta.label} · ${formatMinutes(session.duration)}`,
                                    })}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="analytics-timeline-labels">
                    {ticks.map(h => (
                        <span
                            key={h}
                            className="analytics-timeline-label"
                            style={{ left: `${((h * 60 - viewStart) / viewRange) * 100}%` }}
                        >
                            {formatHour(h)}
                        </span>
                    ))}
                </div>
            </div>
            <div className="analytics-timeline-legend">
                {Object.entries(STRATEGY_META).map(([key, meta]) => (
                    <div key={key} className="analytics-legend-item">
                        <span className="analytics-legend-dot" style={{ background: meta.color }} />
                        <span className="analytics-strategy-name">{meta.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CompletionRate({ data }) {
    const completed   = data.sessionsCompleted;
    const interrupted = data.sessionsInterrupted;
    const total       = completed + interrupted;
    if (total === 0) return null;

    const rate  = Math.round((completed / total) * 100);
    const r     = 20;
    const circ  = 2 * Math.PI * r;
    const dash  = (rate / 100) * circ;

    return (
        <div className="analytics-section">
            <div className="analytics-section-title">Completion Rate</div>
            <div className="analytics-completion">
                <svg className="analytics-donut" width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="28" cy="28" r={r} fill="none" stroke="#22c55e" strokeWidth="8"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeLinecap="round" transform="rotate(-90 28 28)" />
                    <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
                          fontSize="10" fontWeight="700" fill="#111827">{rate}%</text>
                </svg>
                <div className="analytics-completion-legend">
                    <div className="analytics-legend-item">
                        <span className="analytics-legend-dot" style={{ background: '#22c55e' }} />
                        <span>{completed} completed</span>
                    </div>
                    <div className="analytics-legend-item">
                        <span className="analytics-legend-dot" style={{ background: '#f87171' }} />
                        <span>{interrupted} interrupted</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
