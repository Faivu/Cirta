<?php

namespace App\Repository;

use App\Entity\Flowtime;
use App\Entity\Pomodoro;
use App\Entity\Session;
use App\Entity\TimeBlocking;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
}
