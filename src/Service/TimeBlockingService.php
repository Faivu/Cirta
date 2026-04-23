<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\TimeBlocking;
use App\Entity\User;

class TimeBlockingService extends SessionService
{
    public function startSession(User $user, ?string $customGoal = null, ?Task $task = null, ?Event $event = null, ?int $targetDuration = null): TimeBlocking
    {
        $timeBlocking = new TimeBlocking();
        $timeBlocking->setUser($user);
        $timeBlocking->setCustomGoal($customGoal);
        $timeBlocking->setTask($task);
        $timeBlocking->setEvent($event);
        $timeBlocking->start();

        $this->entityManager->persist($timeBlocking);
        $this->entityManager->flush();

        return $timeBlocking;
    }

    public function repeatSession(Session $previous): TimeBlocking
    {
        $this->assertType($previous);

        return $this->startSession(
            $previous->getUser(),
            $previous->getCustomGoal(),
            $previous->getTask(),
            $previous->getEvent()
        );
    }

    protected function assertType(Session $session): void
    {
        if (!$session instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }
    }
}
