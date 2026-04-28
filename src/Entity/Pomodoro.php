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
     * Suggested break duration in minutes (5 for short, 15 for long break)
     */
    #[ORM\Column]
    private int $breakDuration = 5;

    /**
     * Transient: break type determined at completion time
     */
    private ?string $breakType = null;


    public function getTargetDuration(): int
    {
        return $this->targetDuration;
    }

    public function setTargetDuration(int $targetDuration): static
    {
        $this->targetDuration = $targetDuration;

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

    public function getBreakType(): ?string
    {
        return $this->breakType;
    }

    public function setBreakType(string $breakType): static
    {
        $this->breakType = $breakType;

        return $this;
    }

    /**
     * Override end() to calculate pause duration
     */
    public function end(): static
    {
        parent::end();

        if ($this->startedAt !== null && $this->actualDuration !== null) {
            $interval = $this->startedAt->diff($this->endedAt);
            $wallTimeMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            $this->pauseDuration = max(0, $wallTimeMinutes - $this->actualDuration);
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
