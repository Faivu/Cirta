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
     * Override end() to calculate suggested break duration
     */
    public function end(): static
    {
        parent::end();

        if ($this->actualDuration !== null && $this->actualDuration > 0) {
            $this->suggestedBreak = (int) ceil($this->actualDuration / $this->breakRatio);
        }

        return $this;
    }

}
