<?php

namespace App\Controller\Api;

use App\Entity\Flowtime;
use App\Entity\FreeSession;
use App\Entity\Pomodoro;
use App\Entity\Session;
use App\Service\PomodoroService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/session', name: 'api_session_')]
final class SessionController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PomodoroService $pomodoroService
    ) {}

    /**
     * Check if session is still valid (for tab sync)
     */
    #[Route('/check', name: 'check', methods: ['GET'])]
    public function check(): JsonResponse
    {
        if (!$this->getUser()) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json(['status' => 'ok']);
    }

    /**
     * Start a new session
     */
    #[Route('/start', name: 'start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['strategy'])) {
            return $this->json(['error' => 'Strategy is required'], Response::HTTP_BAD_REQUEST);
        }

        // Use service for Pomodoro
        if ($data['strategy'] === 'pomodoro') {
            $targetDuration = isset($data['targetDuration']) ? (int) $data['targetDuration'] : 25;
            $customGoal = $data['customGoal'] ?? null;

            $session = $this->pomodoroService->startSession($user, $customGoal, null, null, $targetDuration);

            return $this->json([
                'id' => $session->getId(),
                'status' => $session->getStatus(),
                'startedAt' => $session->getStartedAt()?->format('c'),
            ], Response::HTTP_CREATED);
        }

        // Handle other session types
        $session = match ($data['strategy']) {
            'flowtime' => $this->createFlowtime($data),
            'free_session' => $this->createFreeSession($data),
            default => null,
        };

        if (!$session) {
            return $this->json(['error' => 'Invalid strategy'], Response::HTTP_BAD_REQUEST);
        }

        $session->setUser($user);

        if (isset($data['customGoal'])) {
            $session->setCustomGoal($data['customGoal']);
        }

        $session->start();

        $this->entityManager->persist($session);
        $this->entityManager->flush();

        return $this->json([
            'id' => $session->getId(),
            'status' => $session->getStatus(),
            'startedAt' => $session->getStartedAt()?->format('c'),
        ], Response::HTTP_CREATED);
    }

    /**
     * Continue with a new session based on a previous one
     */
    #[Route('/{id}/continue', name: 'continue', methods: ['POST'])]
    public function continue(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Try Pomodoro first
        $previousPomodoro = $this->pomodoroService->findForUser($id, $user);

        if ($previousPomodoro) {
            $newSession = $this->pomodoroService->continueSession($previousPomodoro);

            return $this->json([
                'id' => $newSession->getId(),
                'status' => $newSession->getStatus(),
                'startedAt' => $newSession->getStartedAt()?->format('c'),
                'targetDuration' => $newSession->getTargetDuration(),
                'customGoal' => $newSession->getCustomGoal(),
            ], Response::HTTP_CREATED);
        }

        // Handle other session types
        $previousSession = $this->findUserSession($id);

        if ($previousSession instanceof JsonResponse) {
            return $previousSession;
        }

        // Create a new session of the same type
        if ($previousSession instanceof Flowtime) {
            $newSession = new Flowtime();
            $newSession->setBreakRatio($previousSession->getBreakRatio());
        } elseif ($previousSession instanceof FreeSession) {
            $newSession = new FreeSession();
        } else {
            return $this->json(['error' => 'Cannot continue this session type'], Response::HTTP_BAD_REQUEST);
        }

        $newSession->setUser($user);
        $newSession->setCustomGoal($previousSession->getCustomGoal());
        $newSession->setTask($previousSession->getTask());
        $newSession->setEvent($previousSession->getEvent());
        $newSession->start();

        $this->entityManager->persist($newSession);
        $this->entityManager->flush();

        return $this->json([
            'id' => $newSession->getId(),
            'status' => $newSession->getStatus(),
            'startedAt' => $newSession->getStartedAt()?->format('c'),
            'customGoal' => $newSession->getCustomGoal(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Pause a session (Pomodoro only)
     */
    #[Route('/{id}/pause', name: 'pause', methods: ['POST'])]
    public function pause(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $pomodoro = $this->pomodoroService->findForUser($id, $user);

        if (!$pomodoro) {
            return $this->json(['error' => 'Session not found'], Response::HTTP_NOT_FOUND);
        }

        $this->pomodoroService->pauseSession($pomodoro);

        return $this->json([
            'id' => $pomodoro->getId(),
            'status' => $pomodoro->getStatus(),
            'pauseCount' => $pomodoro->getPauseCount(),
        ]);
    }

    /**
     * Resume a paused session (Pomodoro only)
     */
    #[Route('/{id}/resume', name: 'resume', methods: ['POST'])]
    public function resume(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $pomodoro = $this->pomodoroService->findForUser($id, $user);

        if (!$pomodoro) {
            return $this->json(['error' => 'Session not found'], Response::HTTP_NOT_FOUND);
        }

        $this->pomodoroService->resumeSession($pomodoro);

        return $this->json([
            'id' => $pomodoro->getId(),
            'status' => $pomodoro->getStatus(),
        ]);
    }

    /**
     * End/complete a session normally
     */
    #[Route('/{id}/end', name: 'end', methods: ['POST'])]
    public function end(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        // Check if it's a Pomodoro first
        $pomodoro = $this->pomodoroService->findForUser($id, $user);

        if ($pomodoro) {
            if (!isset($data['actualDuration'])) {
                return $this->json(['error' => 'actualDuration is required for Pomodoro'], Response::HTTP_BAD_REQUEST);
            }

            $this->pomodoroService->endSession($pomodoro, (int) $data['actualDuration']);

            return $this->json([
                'id' => $pomodoro->getId(),
                'status' => $pomodoro->getStatus(),
                'actualDuration' => $pomodoro->getActualDuration(),
                'breakDuration' => $pomodoro->getBreakDuration(),
            ]);
        }

        // Handle other session types
        $session = $this->findUserSession($id);

        if ($session instanceof JsonResponse) {
            return $session;
        }

        $session->end();
        $this->entityManager->flush();

        $response = [
            'id' => $session->getId(),
            'status' => $session->getStatus(),
            'actualDuration' => $session->getActualDuration(),
        ];

        if ($session instanceof Flowtime) {
            $response['suggestedBreakDuration'] = $session->getSuggestedBreakDuration();
        }

        return $this->json($response);
    }

    /**
     * Interrupt/cancel a session
     */
    #[Route('/{id}/interrupt', name: 'interrupt', methods: ['POST'])]
    public function interrupt(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $actualDuration = isset($data['actualDuration']) ? (int) $data['actualDuration'] : null;

        // Check if it's a Pomodoro first
        $pomodoro = $this->pomodoroService->findForUser($id, $user);

        if ($pomodoro) {
            $this->pomodoroService->interruptSession($pomodoro, $actualDuration);

            return $this->json([
                'id' => $pomodoro->getId(),
                'status' => $pomodoro->getStatus(),
                'actualDuration' => $pomodoro->getActualDuration(),
            ]);
        }

        // Handle other session types
        $session = $this->findUserSession($id);

        if ($session instanceof JsonResponse) {
            return $session;
        }

        $session->setEndedAt(new \DateTime());
        $session->setStatus(Session::STATUS_INTERRUPTED);

        if ($session->getStartedAt()) {
            $interval = $session->getStartedAt()->diff($session->getEndedAt());
            $minutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            $session->setActualDuration($minutes);
        }

        $this->entityManager->flush();

        return $this->json([
            'id' => $session->getId(),
            'status' => $session->getStatus(),
            'actualDuration' => $session->getActualDuration(),
        ]);
    }

    /**
     * Get session details
     */
    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        $session = $this->findUserSession($id);

        if ($session instanceof JsonResponse) {
            return $session;
        }

        $response = [
            'id' => $session->getId(),
            'status' => $session->getStatus(),
            'customGoal' => $session->getCustomGoal(),
            'startedAt' => $session->getStartedAt()?->format('c'),
            'endedAt' => $session->getEndedAt()?->format('c'),
            'actualDuration' => $session->getActualDuration(),
        ];

        if ($session instanceof Pomodoro) {
            $response['type'] = 'pomodoro';
            $response['targetDuration'] = $session->getTargetDuration();
            $response['breakDuration'] = $session->getBreakDuration();
            $response['breakTaken'] = $session->getBreakTaken();
        } elseif ($session instanceof Flowtime) {
            $response['type'] = 'flowtime';
            $response['suggestedBreakDuration'] = $session->getSuggestedBreakDuration();
        } else {
            $response['type'] = 'free_session';
        }

        return $this->json($response);
    }

    /**
     * Create a Flowtime session
     */
    private function createFlowtime(array $data): Flowtime
    {
        $flowtime = new Flowtime();

        if (isset($data['breakRatio'])) {
            $flowtime->setBreakRatio((int) $data['breakRatio']);
        }

        return $flowtime;
    }

    /**
     * Create a FreeSession
     */
    private function createFreeSession(array $data): FreeSession
    {
        return new FreeSession();
    }

    /**
     * Find a session that belongs to the current user
     */
    private function findUserSession(int $id): Session|JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $session = $this->entityManager->getRepository(Session::class)->find($id);

        if (!$session) {
            return $this->json(['error' => 'Session not found'], Response::HTTP_NOT_FOUND);
        }

        if ($session->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $session;
    }
}
