<?php

namespace App\Repository;

use App\Entity\Flowtime;
use App\Entity\Pomodoro;
use App\Entity\Session;
use App\Entity\TimeBlocking;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Session>
 */
class SessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Session::class);
    }

    /**
     * @return Session[]
     */
    public function findHistoryPage(User $user, int $offset, int $limit, ?\DateTime $since): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.user = :user')
            ->andWhere('s.status IN (:statuses)')
            ->setParameter('user', $user->getId(), 'uuid')
            ->setParameter('statuses', [Session::STATUS_COMPLETED, Session::STATUS_INTERRUPTED])
            ->orderBy('s.startedAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($since !== null) {
            $qb->andWhere('s.startedAt >= :since')->setParameter('since', $since);
        }

        return $qb->getQuery()->getResult();
    }

    public function countHistory(User $user, ?\DateTime $since): int
    {
        $qb = $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.user = :user')
            ->andWhere('s.status IN (:statuses)')
            ->setParameter('user', $user->getId(), 'uuid')
            ->setParameter('statuses', [Session::STATUS_COMPLETED, Session::STATUS_INTERRUPTED]);

        if ($since !== null) {
            $qb->andWhere('s.startedAt >= :since')->setParameter('since', $since);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Aggregate analytics data for a user within a date range.
     * Returns summary stats, per-day focus minutes, and strategy breakdown.
     */
    public function getAnalytics(User $user, ?\DateTime $from, ?\DateTime $to): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // Use raw SQL for performance — JOINED inheritance requires joining session + subtype tables
        $rangeWhere  = 's.started_at IS NOT NULL';
        $params      = ['user' => $user->getId()];
        $types       = ['user' => 'string'];

        if ($from !== null) {
            $rangeWhere .= ' AND s.started_at >= :from';
            $params['from'] = $from->format('Y-m-d H:i:s');
        }
        if ($to !== null) {
            $rangeWhere .= ' AND s.started_at <= :to';
            $params['to'] = $to->format('Y-m-d H:i:s');
        }

        // Summary: totals
        $summary = $conn->fetchAssociative("
            SELECT
                COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.actual_duration ELSE 0 END), 0) AS total_minutes,
                COALESCE(SUM(s.actual_duration), 0) AS all_minutes,
                COUNT(CASE WHEN s.status = 'completed' THEN 1 END) AS completed,
                COUNT(CASE WHEN s.status = 'interrupted' THEN 1 END) AS interrupted,
                COUNT(CASE WHEN s.type = 'pomodoro' AND s.status = 'completed' THEN 1 END) AS pomodoros,
                COALESCE(AVG(CASE WHEN s.status = 'completed' THEN s.actual_duration END), 0) AS avg_duration
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status IN ('completed', 'interrupted')
              AND {$rangeWhere}
        ", $params, $types);

        // Per-day focus minutes (completed sessions only)
        $dailyRows = $conn->fetchAllAssociative("
            SELECT
                DATE(s.started_at) AS day,
                SUM(s.actual_duration) AS minutes
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status = 'completed'
              AND {$rangeWhere}
            GROUP BY DATE(s.started_at)
            ORDER BY day ASC
        ", $params, $types);

        // Strategy breakdown (completed + interrupted sessions)
        $strategyRows = $conn->fetchAllAssociative("
            SELECT
                s.type AS strategy,
                SUM(s.actual_duration) AS minutes,
                COUNT(*) AS count
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status IN ('completed', 'interrupted')
              AND {$rangeWhere}
            GROUP BY s.type
        ", $params, $types);

        // Per-day per-strategy minutes (for stacked bar coloring)
        $dailyStrategyRows = $conn->fetchAllAssociative("
            SELECT
                DATE(s.started_at) AS day,
                s.type             AS strategy,
                SUM(s.actual_duration) AS minutes
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status IN ('completed', 'interrupted')
              AND {$rangeWhere}
            GROUP BY DATE(s.started_at), s.type
            ORDER BY day ASC
        ", $params, $types);

        // Individual sessions for timeline view
        $sessionRows = $conn->fetchAllAssociative("
            SELECT
                s.started_at,
                s.actual_duration AS duration,
                s.type            AS strategy,
                s.status
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status IN ('completed', 'interrupted')
              AND {$rangeWhere}
            ORDER BY s.started_at ASC
        ", $params, $types);

        // Streak: get all distinct dates with ≥1 completed session, compute current + longest
        $allDates = $conn->fetchFirstColumn("
            SELECT DISTINCT DATE(s.started_at) AS day
            FROM session s
            WHERE s.user_id = UNHEX(REPLACE(:user, '-', ''))
              AND s.status = 'completed'
            ORDER BY day DESC
        ", ['user' => $user->getId()], ['user' => 'string']);

        [$currentStreak, $longestStreak] = $this->computeStreaks($allDates);

        return [
            'totalFocusMinutes'    => (int) $summary['total_minutes'],
            'sessionsCompleted'    => (int) $summary['completed'],
            'sessionsInterrupted'  => (int) $summary['interrupted'],
            'pomodorosCompleted'   => (int) $summary['pomodoros'],
            'averageSessionMinutes'=> round((float) $summary['avg_duration'], 1),
            'currentStreak'        => $currentStreak,
            'longestStreak'        => $longestStreak,
            'dailyMinutes'         => array_map(
                fn($r) => ['date' => $r['day'], 'minutes' => (int) $r['minutes']],
                $dailyRows
            ),
            'strategyBreakdown'    => array_map(
                fn($r) => ['strategy' => $r['strategy'], 'minutes' => (int) $r['minutes'], 'count' => (int) $r['count']],
                $strategyRows
            ),
            'dailyStrategyMinutes' => array_map(
                fn($r) => ['date' => $r['day'], 'strategy' => $r['strategy'], 'minutes' => (int) $r['minutes']],
                $dailyStrategyRows
            ),
            'timelineSessions'     => array_map(
                fn($r) => [
                    'startTime' => $r['started_at'],
                    'duration'  => (int) $r['duration'],
                    'strategy'  => $r['strategy'],
                    'status'    => $r['status'],
                ],
                $sessionRows
            ),
        ];
    }

    /**
     * @param string[] $dates ISO date strings DESC
     * @return array{int, int} [currentStreak, longestStreak]
     */
    private function computeStreaks(array $dates): array
    {
        if (empty($dates)) return [0, 0];

        $today     = new \DateTime('today');
        $yesterday = new \DateTime('yesterday');
        $dateObjs  = array_map(fn($d) => new \DateTime($d), $dates);

        // Current streak: must start today or yesterday (allow for not having done one yet today)
        $current = 0;
        $first   = $dateObjs[0];
        if ($first->format('Y-m-d') !== $today->format('Y-m-d')
            && $first->format('Y-m-d') !== $yesterday->format('Y-m-d')) {
            $current = 0;
        } else {
            $current    = 1;
            $prev       = $first;
            foreach (array_slice($dateObjs, 1) as $d) {
                $diff = (int) $prev->diff($d)->days;
                if ($diff === 1) { $current++; $prev = $d; }
                else break;
            }
        }

        // Longest streak
        $longest = 1;
        $run     = 1;
        $prev    = $dateObjs[0];
        foreach (array_slice($dateObjs, 1) as $d) {
            $diff = (int) $prev->diff($d)->days;
            if ($diff === 1) { $run++; }
            else { $run = 1; }
            if ($run > $longest) $longest = $run;
            $prev = $d;
        }

        return [$current, $longest];
    }
}
