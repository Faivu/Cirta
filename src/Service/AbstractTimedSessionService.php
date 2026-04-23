<?php

namespace App\Service;

use App\Entity\Session;
use Doctrine\ORM\EntityManagerInterface;

abstract class AbstractTimedSessionService implements SessionStrategy
{

    public function __construct(
        protected EntityManagerInterface $entityManager
    ) {}

    public function pauseSession(Session $session): void
    {
        $this->assertType($session);
        $session->pause();
        $this->entityManager->flush();
    }

    public function resumeSession(Session $session): void
    {
        $this->assertType($session);
        $session->resume();
        $this->entityManager->flush();
    }

    public function endSession(Session $session, ?int $actualDuration = null): void
    {
        $this->assertType($session);

        if ($session->getStartedAt() !== null) {
            $elapsed = (int) ((time() - $session->getStartedAt()->getTimestamp()) / 60);
            if ($elapsed < Session::MIN_DURATION) {
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
        $this->assertType($session);

        if ($session->getStartedAt() !== null) {
            $elapsed = (int) ((time() - $session->getStartedAt()->getTimestamp()) / 60);
            if ($elapsed < Session::MIN_DURATION) {
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

    public function recordBreak(Session $session, int $duration): void
    {
        $session->setBreakAfter($duration);
        $this->entityManager->flush();
    }

    abstract protected function assertType(Session $session): void;
}
