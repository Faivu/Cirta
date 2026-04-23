<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\User;

interface SessionStrategy
{
    public function startSession(User $user, ?string $customGoal = null, ?Task $task = null, ?Event $event = null, ?int $targetDuration = null): Session;

    public function continueSession(Session $previous): Session;

    public function pauseSession(Session $session): void;

    public function resumeSession(Session $session): void;

    public function endSession(Session $session, ?int $actualDuration = null): void;

    public function interruptSession(Session $session, ?int $actualDuration = null): void;

    public function recordBreak(Session $session, int $duration): void;
}
