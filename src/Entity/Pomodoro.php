<?php

namespace App\Entity;

use App\Repository\PomodoroRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PomodoroRepository::class)]
class Pomodoro extends Session
{
    /**
     * Target duration in minutes (default: 25 minutes for standard Pomodoro)
     */
    #[ORM\Column]
    private int $targetDuration = 25;

    /**
     * Total time spent paused in minutes (calculated on end)
     */
    #[ORM\Column]
    private int $pauseDuration = 0;

    /**
     * Suggested break duration in minutes (5 for short, 15 for long break)
     */
    #[ORM\Column]
    private int $breakDuration = 5;


    public function getTargetDuration(): int
    {
        return $this->targetDuration;
    }

    public function setTargetDuration(int $targetDuration): static
    {
        $this->targetDuration = $targetDuration;

        return $this;
    }

    public function getPauseDuration(): int
    {
        return $this->pauseDuration;
    }

    public function setPauseDuration(int $pauseDuration): static
    {
        $this->pauseDuration = $pauseDuration;

        return $this;
    }

    public function getBreakDuration(): int
    {
        return $this->breakDuration;
    }

    public function setBreakDuration(int $breakDuration): static
    {
        $this->breakDuration = $breakDuration;

        return $this;
    }

    /**
     * Complete the Pomodoro session
     *
     * @param int $actualDuration The actual working time in minutes (sent from frontend)
     */
    public function complete(int $actualDuration): static
    {
        $this->endedAt = new \DateTime();
        $this->status = self::STATUS_COMPLETED;
        $this->actualDuration = $actualDuration;

        // Calculate pause duration: total wall time - actual working time
        if ($this->startedAt !== null) {
            $interval = $this->startedAt->diff($this->endedAt);
            $wallTimeMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            $this->pauseDuration = max(0, $wallTimeMinutes - $actualDuration);
        }

        return $this;
    }

    /**
     * Check if the Pomodoro has reached its target duration
     */
    public function hasReachedTarget(int $elapsedMinutes): bool
    {
        return $elapsedMinutes >= $this->targetDuration;
    }
}
