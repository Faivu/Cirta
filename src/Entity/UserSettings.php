<?php

namespace App\Entity;

use App\Repository\UserSettingsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserSettingsRepository::class)]
class UserSettings extends BaseEntity
{
    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    // --- Calendar ---

    #[ORM\Column]
    private bool $calendarDragConfirm = true;

    #[ORM\Column(length: 10)]
    private string $calendarWeekStart = 'monday';

    #[ORM\Column(length: 10)]
    private string $calendarDefaultView = 'month';

    #[ORM\Column(length: 3)]
    private string $calendarTimeFormat = '24h';

    // --- Session ---

    #[ORM\Column(length: 20)]
    private string $defaultStrategy = 'pomodoro';

    #[ORM\Column]
    private bool $pomodoroSeriousMode = false;

    #[ORM\Column]
    private int $pomodoroWorkDuration = 25;

    #[ORM\Column]
    private int $pomodoroShortBreak = 5;

    #[ORM\Column]
    private int $pomodoroLongBreak = 15;

    #[ORM\Column]
    private int $flowtimeBreakRatio = 5;

    // --- To-do ---

    #[ORM\Column(length: 10)]
    private string $todoDefaultFilter = 'today';

    #[ORM\Column]
    private bool $todoKeepFinishedVisible = true;

    #[ORM\Column]
    private bool $todoUncheckedNoConfirm = false;

    // --- General ---

    #[ORM\Column(length: 64)]
    private string $timezone = 'UTC';

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function isCalendarDragConfirm(): bool { return $this->calendarDragConfirm; }
    public function setCalendarDragConfirm(bool $v): static { $this->calendarDragConfirm = $v; return $this; }

    public function getCalendarWeekStart(): string { return $this->calendarWeekStart; }
    public function setCalendarWeekStart(string $v): static { $this->calendarWeekStart = $v; return $this; }

    public function getCalendarDefaultView(): string { return $this->calendarDefaultView; }
    public function setCalendarDefaultView(string $v): static { $this->calendarDefaultView = $v; return $this; }

    public function getCalendarTimeFormat(): string { return $this->calendarTimeFormat; }
    public function setCalendarTimeFormat(string $v): static { $this->calendarTimeFormat = $v; return $this; }

    public function getDefaultStrategy(): string { return $this->defaultStrategy; }
    public function setDefaultStrategy(string $v): static { $this->defaultStrategy = $v; return $this; }

    public function isPomodoroSeriousMode(): bool { return $this->pomodoroSeriousMode; }
    public function setPomodoroSeriousMode(bool $v): static { $this->pomodoroSeriousMode = $v; return $this; }

    public function getPomodoroWorkDuration(): int { return $this->pomodoroWorkDuration; }
    public function setPomodoroWorkDuration(int $v): static { $this->pomodoroWorkDuration = $v; return $this; }

    public function getPomodoroShortBreak(): int { return $this->pomodoroShortBreak; }
    public function setPomodoroShortBreak(int $v): static { $this->pomodoroShortBreak = $v; return $this; }

    public function getPomodoroLongBreak(): int { return $this->pomodoroLongBreak; }
    public function setPomodoroLongBreak(int $v): static { $this->pomodoroLongBreak = $v; return $this; }

    public function getFlowtimeBreakRatio(): int { return $this->flowtimeBreakRatio; }
    public function setFlowtimeBreakRatio(int $v): static { $this->flowtimeBreakRatio = $v; return $this; }

    public function getTodoDefaultFilter(): string { return $this->todoDefaultFilter; }
    public function setTodoDefaultFilter(string $v): static { $this->todoDefaultFilter = $v; return $this; }

    public function isTodoKeepFinishedVisible(): bool { return $this->todoKeepFinishedVisible; }
    public function setTodoKeepFinishedVisible(bool $v): static { $this->todoKeepFinishedVisible = $v; return $this; }

    public function isTodoUncheckedNoConfirm(): bool { return $this->todoUncheckedNoConfirm; }
    public function setTodoUncheckedNoConfirm(bool $v): static { $this->todoUncheckedNoConfirm = $v; return $this; }

    public function getTimezone(): string { return $this->timezone; }
    public function setTimezone(string $v): static { $this->timezone = $v; return $this; }
}
