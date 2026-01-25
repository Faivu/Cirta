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
    private ?int $targetDuration = 25;

    /**
     * Timestamp when the session was paused (used to calculate pause duration)
     */
    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $pausedAt = null;

    /**
     * Total time spent paused in minutes
     */
    #[ORM\Column(nullable: true)]
    private ?int $totalPausedDuration = 0;

    /**
     * Get target duration in minutes
     */
    public function getTargetDuration(): ?int
    {
        return $this->targetDuration;
    }

    /**
     * Set target duration in minutes
     */
    public function setTargetDuration(int $targetDuration): static
    {
        $this->targetDuration = $targetDuration;

        return $this;
    }

    public function getPausedAt(): ?\DateTimeInterface
    {
        return $this->pausedAt;
    }

    public function setPausedAt(?\DateTimeInterface $pausedAt): static
    {
        $this->pausedAt = $pausedAt;

        return $this;
    }

    /**
     * Get total paused duration in minutes
     */
    public function getTotalPausedDuration(): ?int
    {
        return $this->totalPausedDuration;
    }

    /**
     * Set total paused duration in minutes
     */
    public function setTotalPausedDuration(?int $totalPausedDuration): static
    {
        $this->totalPausedDuration = $totalPausedDuration;

        return $this;
    }

    /**
     * Pause the Pomodoro session
     */
    public function pause(): static
    {
        if ($this->status === self::STATUS_IN_PROGRESS) {
            $this->pausedAt = new \DateTime();
            $this->status = self::STATUS_PAUSED;
        }

        return $this;
    }

    /**
     * Resume the Pomodoro session from pause
     */
    public function resume(): static
    {
        if ($this->status === self::STATUS_PAUSED && $this->pausedAt !== null) {
            $now = new \DateTime();
            $interval = $this->pausedAt->diff($now);
            $pauseMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            $this->totalPausedDuration = ($this->totalPausedDuration ?? 0) + $pauseMinutes;
            $this->pausedAt = null;
            $this->status = self::STATUS_IN_PROGRESS;
        }

        return $this;
    }

    /**
     * Interrupt/cancel the Pomodoro session before completion
     */
    public function interrupt(): static
    {
        $this->endedAt = new \DateTime();
        $this->status = self::STATUS_INTERRUPTED;

        if ($this->startedAt !== null) {
            $interval = $this->startedAt->diff($this->endedAt);
            $this->actualDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            // Subtract paused time from actual duration
            $this->actualDuration -= ($this->totalPausedDuration ?? 0);
        }

        return $this;
    }

    /**
     * Override end() to account for paused time
     */
    public function end(): static
    {
        // If currently paused, add the current pause duration before ending
        if ($this->status === self::STATUS_PAUSED && $this->pausedAt !== null) {
            $now = new \DateTime();
            $interval = $this->pausedAt->diff($now);
            $pauseMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            $this->totalPausedDuration = ($this->totalPausedDuration ?? 0) + $pauseMinutes;
            $this->pausedAt = null;
        }

        $this->endedAt = new \DateTime();
        $this->status = self::STATUS_COMPLETED;

        if ($this->startedAt !== null) {
            $interval = $this->startedAt->diff($this->endedAt);
            $totalMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            // Subtract paused time from actual working duration
            $this->actualDuration = $totalMinutes - ($this->totalPausedDuration ?? 0);
        }

        return $this;
    }

    /**
     * Calculate remaining time in minutes
     */
    public function getRemainingTime(): int
    {
        if ($this->status === self::STATUS_COMPLETED || $this->status === self::STATUS_INTERRUPTED) {
            return 0;
        }

        if ($this->startedAt === null) {
            return $this->targetDuration ?? 25;
        }

        $now = new \DateTime();

        // If paused, calculate from pausedAt instead of now
        if ($this->status === self::STATUS_PAUSED && $this->pausedAt !== null) {
            $now = $this->pausedAt;
        }

        $interval = $this->startedAt->diff($now);
        $elapsedMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

        // Subtract already accumulated pause time
        $elapsedMinutes -= ($this->totalPausedDuration ?? 0);

        $remaining = ($this->targetDuration ?? 25) - $elapsedMinutes;

        return max(0, $remaining);
    }

    /**
     * Check if the Pomodoro timer has reached its target duration
     */
    public function isTimeUp(): bool
    {
        return $this->getRemainingTime() <= 0;
    }
}
