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
        $this->endSession($session, $actualDuration);
    }

    public function recordBreak(Session $session, int $duration): void
    {
        $session->setBreakAfter($duration);
        $this->entityManager->flush();
    }

    abstract protected function assertType(Session $session): void;
}
