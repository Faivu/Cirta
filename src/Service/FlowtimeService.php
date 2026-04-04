<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Flowtime;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class FlowtimeService implements SessionStrategy
{
    private const MIN_DURATION = 1;

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

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
        if (!$previous instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
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
        if (!$session instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
        }

        $session->pause();
        $this->entityManager->flush();
    }

    public function resumeSession(Session $session): void
    {
        if (!$session instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
        }

        $session->resume();
        $this->entityManager->flush();
    }

    public function endSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
        }

        if ($session->getStartedAt() !== null) {
            $elapsed = (int) ((time() - $session->getStartedAt()->getTimestamp()) / 60);
            if ($elapsed < self::MIN_DURATION) {
                $this->entityManager->remove($session);
                $this->entityManager->flush();
                return;
            }
        }

        // Use the frontend-provided duration (excludes pause time) if available.
        // Session::end() would recalculate from wall-clock, which includes pauses.
        if ($actualDuration !== null) {
            $session->setActualDuration($actualDuration);
        }

        $session->end();
        $this->entityManager->flush();
    }

    public function interruptSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof Flowtime) {
            throw new \InvalidArgumentException('Expected Flowtime session');
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
