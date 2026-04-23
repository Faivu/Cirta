<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class EventService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(string $id): ?Event
    {
        return $this->entityManager->getRepository(Event::class)->find($id);
    }

    public function list(User $user, ?string $start = null, ?string $end = null): array
    {
        $qb = $this->entityManager->getRepository(Event::class)
            ->createQueryBuilder('e')
            ->where('e.user = :user')
            ->setParameter('user', $user->getId(), 'uuid')
            ->orderBy('e.startAt', 'ASC');

        if ($start) {
            try {
                $qb->andWhere('e.endAt >= :start')
                   ->setParameter('start', new \DateTime($start));
            } catch (\Exception) {}
        }

        if ($end) {
            try {
                $qb->andWhere('e.startAt <= :end')
                   ->setParameter('end', new \DateTime($end));
            } catch (\Exception) {}
        }

        return $qb->getQuery()->getResult();
    }

    public function create(User $user, array $data): Event
    {
        $event = new Event();
        $event->setUser($user);
        $event->setTitle($data['title']);
        $event->setStartAt(new \DateTime($data['startAt']));
        $event->setEndAt(new \DateTime($data['endAt']));
        $event->setCategory($data['category'] ?? 'default');
        $event->setColor($data['color'] ?? '#3b82f6');
        $event->setAllDay($data['allDay'] ?? false);
        $event->setIsReoccurring($data['isReoccurring'] ?? false);

        if (isset($data['reoccurrencePattern'])) {
            $event->setReoccurrencePattern($data['reoccurrencePattern']);
        }
        if (isset($data['reoccurrenceEndDate'])) {
            $event->setReoccurrenceEndDate(new \DateTime($data['reoccurrenceEndDate']));
        }

        $this->entityManager->persist($event);
        $this->entityManager->flush();

        return $event;
    }

    public function update(Event $event, array $data): void
    {
        if (isset($data['title'])) {
            $event->setTitle($data['title']);
        }
        if (isset($data['startAt'])) {
            $event->setStartAt(new \DateTime($data['startAt']));
        }
        if (isset($data['endAt'])) {
            $event->setEndAt(new \DateTime($data['endAt']));
        }
        if (isset($data['category'])) {
            $event->setCategory($data['category']);
        }
        if (isset($data['color'])) {
            $event->setColor($data['color']);
        }
        if (isset($data['allDay'])) {
            $event->setAllDay($data['allDay']);
        }

        $this->entityManager->flush();
    }

    public function delete(Event $event): void
    {
        $this->entityManager->remove($event);
        $this->entityManager->flush();
    }
}
