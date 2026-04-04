<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\TimeBlocking;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class TimeBlockingService implements SessionStrategy
{
    private const MIN_DURATION = 1;

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

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

    public function continueSession(Session $previous): TimeBlocking
    {
        if (!$previous instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }

        return $this->startSession(
            $previous->getUser(),
            $previous->getCustomGoal(),
            $previous->getTask(),
            $previous->getEvent()
        );
    }

    public function pauseSession(Session $session): void
    {
        if (!$session instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }

        $session->pause();
        $this->entityManager->flush();
    }

    public function resumeSession(Session $session): void
    {
        if (!$session instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }

        $session->resume();
        $this->entityManager->flush();
    }

    public function endSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }

        if ($session->getStartedAt() !== null) {
            $elapsed = (int) ((time() - $session->getStartedAt()->getTimestamp()) / 60);
            if ($elapsed < self::MIN_DURATION) {
                $this->entityManager->remove($session);
                $this->entityManager->flush();
                return;
            }
        }

        if ($actualDuration !== null) {
            $session->setActualDuration($actualDuration);
        }

        $session->end();
        $this->entityManager->flush();
    }

    public function interruptSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof TimeBlocking) {
            throw new \InvalidArgumentException('Expected TimeBlocking session');
        }

        if ($session->getStartedAt() !== null) {
            $elapsed = (int) ((time() - $session->getStartedAt()->getTimestamp()) / 60);
            if ($elapsed < self::MIN_DURATION) {
                $this->entityManager->remove($session);
                $this->entityManager->flush();
                return;
            }
        }

        $session->setEndedAt(new \DateTime());
        $session->interrupt();

        if ($actualDuration !== null) {
            $session->setActualDuration($actualDuration);
        } elseif ($session->getStartedAt() !== null) {
            $interval = $session->getStartedAt()->diff($session->getEndedAt());
            $session->setActualDuration(($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i);
        }

        $this->entityManager->flush();
    }

}
