<?php

namespace App\Entity;

use App\Repository\FlowtimeRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Flowtime is a flexible productivity technique where you work until you naturally
 * lose focus, then take a break proportional to your work time (typically 1:5 ratio).
 */
#[ORM\Entity(repositoryClass: FlowtimeRepository::class)]
class Flowtime extends Session
{
    /**
     * Break ratio - break time = work time / breakRatio
     * Default is 5, meaning 5 minutes of work = 1 minute of break
     */
    #[ORM\Column]
    private int $breakRatio = 5;

    /**
     * Suggested break duration in minutes (calculated after session ends)
     */
    #[ORM\Column(nullable: true)]
    private ?int $suggestedBreakDuration = null;

    public function getBreakRatio(): int
    {
        return $this->breakRatio;
    }

    public function setBreakRatio(int $breakRatio): static
    {
        $this->breakRatio = $breakRatio;

        return $this;
    }

    /**
     * Get suggested break duration in minutes
     */
    public function getSuggestedBreakDuration(): ?int
    {
        return $this->suggestedBreakDuration;
    }

    /**
     * Set suggested break duration in minutes
     */
    public function setSuggestedBreakDuration(?int $suggestedBreakDuration): static
    {
        $this->suggestedBreakDuration = $suggestedBreakDuration;

        return $this;
    }

    /**
     * Override end() to calculate suggested break duration
     */
    public function end(): static
    {
        parent::end();

        // Calculate suggested break duration based on actual work time
        if ($this->actualDuration !== null && $this->actualDuration > 0) {
            $this->suggestedBreakDuration = (int) ceil($this->actualDuration / $this->breakRatio);
        }

        return $this;
    }

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
