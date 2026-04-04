<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Flowtime;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\User;

class FlowtimeService extends AbstractTimedSessionService
{
    public function startSession(User $user, ?string $customGoal = null, ?Task $task = null, ?Event $event = null, ?int $targetDuration = null): Flowtime
    {
        $flowtime = new Flowtime();
        $flowtime->setUser($user);
        $flowtime->setCustomGoal($customGoal);
        $flowtime->setTask($task);
        $flowtime->setEvent($event);
        $flowtime->start();

        $this->entityManager->persist($flowtime);
        $this->entityManager->flush();

        return $flowtime;
    }

    public function continueSession(Session $previous): Flowtime
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
        if (!$session instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
        }
    }
}
