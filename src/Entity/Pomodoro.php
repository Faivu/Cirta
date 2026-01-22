<?php

namespace App\Entity;

use App\Repository\PomodoroRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PomodoroRepository::class)]
class Pomodoro
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $targetDuration = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTargetDuration(): ?int
    {
        return $this->targetDuration;
    }

    public function setTargetDuration(int $targetDuration): static
    {
        $this->targetDuration = $targetDuration;

        return $this;
    }
}
