<?php

namespace App\Entity;

use App\Repository\FreeSessionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * FreeSession is an unstructured work session with no time constraints.
 * Simply track when you start and stop working.
 */
#[ORM\Entity(repositoryClass: FreeSessionRepository::class)]
class FreeSession extends Session
{
    /**
     * Get elapsed working time in minutes (for real-time display)
     */
    public function getElapsedTime(): int
    {
        if ($this->startedAt === null) {
            return 0;
        }

        if ($this->endedAt !== null) {
            return $this->actualDuration ?? 0;
        }

        $now = new \DateTime();
        $interval = $this->startedAt->diff($now);

        return ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
    }
}
