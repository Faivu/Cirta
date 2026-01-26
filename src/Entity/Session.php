<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type', type: 'string')]
#[ORM\DiscriminatorMap([
    'pomodoro' => Pomodoro::class,
    'flowtime' => Flowtime::class,
    'free_session' => FreeSession::class,
])]
abstract class Session
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_INTERRUPTED = 'interrupted';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    protected ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    protected ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Event::class, inversedBy: 'sessions')]
    #[ORM\JoinColumn(nullable: true)]
    protected ?Event $event = null;

    #[ORM\ManyToOne(targetEntity: Task::class, inversedBy: 'sessions')]
    #[ORM\JoinColumn(nullable: true)]
    protected ?Task $task = null;

    #[ORM\Column(length: 255, nullable: true)]
    protected ?string $customGoal = null;

    #[ORM\Column(length: 20)]
    protected string $status = self::STATUS_PENDING;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    protected ?\DateTimeInterface $startedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    protected ?\DateTimeInterface $endedAt = null;

    /**
     * Actual duration in minutes
     */
    #[ORM\Column(nullable: true)]
    protected ?int $actualDuration = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getEvent(): ?Event
    {
        return $this->event;
    }

    public function setEvent(?Event $event): static
    {
        $this->event = $event;

        return $this;
    }

    public function getTask(): ?Task
    {
        return $this->task;
    }

    public function setTask(?Task $task): static
    {
        $this->task = $task;

        return $this;
    }

    public function getCustomGoal(): ?string
    {
        return $this->customGoal;
    }

    public function setCustomGoal(?string $customGoal): static
    {
        $this->customGoal = $customGoal;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getStartedAt(): ?\DateTimeInterface
    {
        return $this->startedAt;
    }

    public function setStartedAt(?\DateTimeInterface $startedAt): static
    {
        $this->startedAt = $startedAt;

        return $this;
    }

    public function getEndedAt(): ?\DateTimeInterface
    {
        return $this->endedAt;
    }

    public function setEndedAt(?\DateTimeInterface $endedAt): static
    {
        $this->endedAt = $endedAt;

        return $this;
    }

    /**
     * Get actual duration in minutes
     */
    public function getActualDuration(): ?int
    {
        return $this->actualDuration;
    }

    /**
     * Set actual duration in minutes
     */
    public function setActualDuration(?int $actualDuration): static
    {
        $this->actualDuration = $actualDuration;

        return $this;
    }

    /**
     * Start the session
     */
    public function start(): static
    {
        $this->startedAt = new \DateTime();
        $this->status = self::STATUS_IN_PROGRESS;

        return $this;
    }

    /**
     * End the session and calculate the actual duration
     */
    public function end(): static
    {
        $this->endedAt = new \DateTime();
        $this->status = self::STATUS_COMPLETED;

        if ($this->startedAt !== null) {
            $interval = $this->startedAt->diff($this->endedAt);
            // Convert to total minutes
            $this->actualDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
        }

        return $this;
    }

    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function isPaused(): bool
    {
        return $this->status === self::STATUS_PAUSED;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isInterrupted(): bool
    {
        return $this->status === self::STATUS_INTERRUPTED;
    }
}
