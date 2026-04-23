<?php

namespace App\Service;

use App\Entity\Event;
use App\Entity\Pomodoro;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class PomodoroService implements SessionStrategy
{
    private const DEFAULT_DURATION = 25;
    private const POMODOROS_BEFORE_LONG_BREAK = 4;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private SettingsService $settingsService,
    ) {}

    /**
     * Start a new Pomodoro session
     */
    public function startSession(User $user, ?string $customGoal = null, ?Task $task = null, ?Event $event = null, ?int $targetDuration = null): Pomodoro
    {
        $pomodoro = new Pomodoro();
        $pomodoro->setUser($user);
        $pomodoro->setCustomGoal($customGoal);
        $pomodoro->setTask($task);
        $pomodoro->setEvent($event);
        $pomodoro->setTargetDuration($targetDuration ?? self::DEFAULT_DURATION);
        $pomodoro->start();

        $this->entityManager->persist($pomodoro);
        $this->entityManager->flush();

        return $pomodoro;
    }

    /**
     * Continue with a new session based on a previous one (same settings)
     */
    public function continueSession(Session $previous): Pomodoro
    {
        if (!$previous instanceof Pomodoro) {
            throw new \InvalidArgumentException('Expected Pomodoro session');
        }

        return $this->startSession(
            $previous->getUser(),
            $previous->getCustomGoal(),
            $previous->getTask(),
            $previous->getEvent(),
            $previous->getTargetDuration()
        );
    }

    /**
     * Pause the session
     */
    public function pauseSession(Session $session): void
    {
        if (!$session instanceof Pomodoro) {
            throw new \InvalidArgumentException('Expected Pomodoro session');
        }

        $session->pause();
        $this->entityManager->flush();
    }

    /**
     * Resume the session
     */
    public function resumeSession(Session $session): void
    {
        if (!$session instanceof Pomodoro) {
            throw new \InvalidArgumentException('Expected Pomodoro session');
        }

        $session->resume();
        $this->entityManager->flush();
    }

    /**
     * End/complete the session
     */
    public function endSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof Pomodoro) {
            throw new \InvalidArgumentException('Expected Pomodoro session');
        }

        if ($actualDuration === null) {
            throw new \InvalidArgumentException('actualDuration is required for Pomodoro sessions');
        }

        // Don't save sessions with less than minimum duration
        if ($actualDuration < Session::MIN_DURATION) {
            $this->entityManager->remove($session);
            $this->entityManager->flush();
            return;
        }

        $session->setActualDuration($actualDuration);
        $session->end();

        if ($session->getStartedAt() !== null) {
            $interval = $session->getStartedAt()->diff($session->getEndedAt());
            $wallTimeMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            $session->setPauseDuration(max(0, $wallTimeMinutes - $actualDuration));
        }

        // Count sessions already completed today (current session not flushed yet, so not included)
        $alreadyCompleted = $this->countCompletedToday($session->getUser());
        $cyclePosition = ($alreadyCompleted + 1) % self::POMODOROS_BEFORE_LONG_BREAK;
        $userSettings = $this->settingsService->getOrCreate($session->getUser());

        if ($cyclePosition === 0) {
            $session->setBreakDuration($userSettings->getPomodoroLongBreak());
            $session->setBreakType('long');
        } else {
            $session->setBreakDuration($userSettings->getPomodoroShortBreak());
            $session->setBreakType('short');
        }

        $this->entityManager->flush();
    }

    /**
     * Interrupt/cancel the session
     */
    public function interruptSession(Session $session, ?int $actualDuration = null): void
    {
        if (!$session instanceof Pomodoro) {
            throw new \InvalidArgumentException('Expected Pomodoro session');
        }

        // If duration provided and less than minimum, delete instead of saving
        if ($actualDuration !== null && $actualDuration < Session::MIN_DURATION) {
            $this->entityManager->remove($session);
            $this->entityManager->flush();
            return;
        }

        $session->setEndedAt(new \DateTime());
        $session->interrupt();

        if ($actualDuration !== null) {
            $session->setActualDuration($actualDuration);

            if ($session->getStartedAt() !== null) {
                $interval = $session->getStartedAt()->diff($session->getEndedAt());
                $wallTimeMinutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
                $session->setPauseDuration(max(0, $wallTimeMinutes - $actualDuration));
            }
        }

        $alreadyDone = $this->countCompletedToday($session->getUser());
        $cyclePosition = ($alreadyDone + 1) % self::POMODOROS_BEFORE_LONG_BREAK;
        $userSettings = $this->settingsService->getOrCreate($session->getUser());

        if ($cyclePosition === 0) {
            $session->setBreakDuration($userSettings->getPomodoroLongBreak());
            $session->setBreakType('long');
        } else {
            $session->setBreakDuration($userSettings->getPomodoroShortBreak());
            $session->setBreakType('short');
        }

        $this->entityManager->flush();
    }

    /**
     * Record actual break taken
     */
    public function recordBreak(Session $session, int $duration): void
    {
        $session->setBreakAfter($duration);
        $this->entityManager->flush();
    }

    /**
     * Count completed pomodoros for a user today
     */
    private function countCompletedToday(User $user): int
    {
        $today = new \DateTime('today');
        $tomorrow = new \DateTime('tomorrow');

        return $this->entityManager->getRepository(Pomodoro::class)
            ->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.user = :user')
            ->andWhere('p.status IN (:statuses)')
            ->andWhere('p.endedAt >= :today')
            ->andWhere('p.endedAt < :tomorrow')
            ->setParameter('user', $user->getId(), 'uuid')
            ->setParameter('statuses', [Session::STATUS_COMPLETED, Session::STATUS_INTERRUPTED])
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
