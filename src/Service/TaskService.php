<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class TaskService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(string $id): ?Task
    {
        return $this->entityManager->getRepository(Task::class)->find($id);
    }

    public function list(User $user): array
    {
        return $this->entityManager->createQueryBuilder()
            ->select('t', 'SUM(s.actualDuration) as totalDuration')
            ->from(Task::class, 't')
            ->leftJoin('t.sessions', 's', 'WITH', 's.actualDuration IS NOT NULL')
            ->where('t.user = :user')
            ->setParameter('user', $user->getId(), 'uuid')
            ->groupBy('t.id')
            ->orderBy('t.isChecked', 'ASC')
            ->addOrderBy('t.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function create(User $user, array $data): Task
    {
        $task = new Task();
        $task->setUser($user);
        $task->setTitle(trim($data['title']));
        $task->setIsChecked(false);

        if (!empty($data['scheduleDate'])) {
            $task->setScheduleDate(new \DateTime($data['scheduleDate']));
        }

        if (!empty($data['eventId'])) {
            $event = $this->entityManager->getRepository(Event::class)->find($data['eventId']);
            if (!$event || $event->getUser() !== $user) {
                throw new \InvalidArgumentException('Event not found');
            }
            $task->setEvent($event);
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $task;
    }

    public function update(Task $task, User $user, array $data): void
    {
        if (isset($data['title'])) {
            $task->setTitle(trim($data['title']));
        }
        if (isset($data['isChecked'])) {
            $task->setIsChecked((bool) $data['isChecked']);
        }
        if (array_key_exists('scheduleDate', $data)) {
            $task->setScheduleDate($data['scheduleDate'] ? new \DateTime($data['scheduleDate']) : null);
        }
        if (array_key_exists('eventId', $data)) {
            if ($data['eventId']) {
                $event = $this->entityManager->getRepository(Event::class)->find($data['eventId']);
                if (!$event || $event->getUser() !== $user) {
                    throw new \InvalidArgumentException('Event not found');
                }
                $task->setEvent($event);
            } else {
                $task->setEvent(null);
            }
        }

        $this->entityManager->flush();
    }

    public function delete(Task $task): void
    {
        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }
}
