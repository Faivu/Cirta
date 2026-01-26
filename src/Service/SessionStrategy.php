<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\User;

interface SessionStrategy
{
    /**
     * Start a new session
     *
     * @param int|null $targetDuration Optional target duration in minutes (used by Pomodoro)
     */
    public function startSession(User $user, ?string $customGoal = null, ?Task $task = null, ?Event $event = null, ?int $targetDuration = null): Session;

    /**
     * Pause the session
     */
    public function pauseSession(Session $session): void;

    /**
     * Resume the session from pause
     */
    public function resumeSession(Session $session): void;

    /**
     * End/complete the session
     *
     * @param Session $session The session to end
     * @param int|null $actualDuration Optional actual duration in minutes (required for Pomodoro)
     */
    public function endSession(Session $session, ?int $actualDuration = null): void;

    /**
     * Interrupt/cancel the session before completion
     *
     * @param Session $session The session to interrupt
     * @param int|null $actualDuration Optional actual duration worked before interruption
     */
    public function interruptSession(Session $session, ?int $actualDuration = null): void;
}
