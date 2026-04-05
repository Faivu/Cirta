<?php

namespace App\Controller\Api;

use App\Entity\Event;
use App\Entity\Flowtime;
use App\Entity\Pomodoro;
use App\Entity\Session;
use App\Entity\Task;
use App\Entity\TimeBlocking;
use App\Repository\SessionRepository;
use App\Service\SessionStrategy;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ServiceLocator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/session', name: 'api_session_')]
final class SessionController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SessionRepository $sessionRepository,
        private ServiceLocator $strategies,
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
     * Get session history
     */
    #[Route('/history', name: 'history', methods: ['GET'])]
    public function history(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $page  = max(1, $request->query->getInt('page', 1));
        $limit = min(50, max(1, $request->query->getInt('limit', 20)));

        $since = null;
        if ($sinceRaw = $request->query->get('since')) {
            $since = new \DateTime($sinceRaw);
        }

        $sessions = $this->sessionRepository->findHistoryPage($user, ($page - 1) * $limit, $limit, $since);
        $total    = $this->sessionRepository->countHistory($user, $since);

        return $this->json([
            'sessions' => array_map($this->serializeSession(...), $sessions),
            'total'    => $total,
            'page'     => $page,
            'pages'    => (int) ceil($total / $limit),
        ]);
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

        $data        = json_decode($request->getContent(), true);
        $strategyKey = $data['strategy'] ?? null;

        if (!$strategyKey || !$this->strategies->has($strategyKey)) {
            return $this->json(['error' => 'Invalid strategy'], Response::HTTP_BAD_REQUEST);
        }

        $event = null;
        $task  = null;

        if (!empty($data['eventId'])) {
            $event = $this->entityManager->getRepository(Event::class)->find($data['eventId']);
            if (!$event || $event->getUser() !== $user) {
                return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
            }
        }

        if (!empty($data['taskId'])) {
            $task = $this->entityManager->getRepository(Task::class)->find($data['taskId']);
            if (!$task || $task->getUser() !== $user) {
                return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
            }
        }

        $session = $this->strategies->get($strategyKey)->startSession(
            $user,
            $data['customGoal'] ?? null,
            $task,
            $event,
            isset($data['targetDuration']) ? (int) $data['targetDuration'] : null
        );

        return $this->json([
            'id'        => $session->getId(),
            'status'    => $session->getStatus(),
            'startedAt' => $session->getStartedAt()?->format('c'),
        ], Response::HTTP_CREATED);
    }

    /**
     * Continue with a new session based on a previous one
     */
    #[Route('/{id}/continue', name: 'continue', methods: ['POST'])]
    public function continueSession(string $id): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $newSession = $this->strategyForSession($session)->continueSession($session);

        $response = [
            'id'         => $newSession->getId(),
            'status'     => $newSession->getStatus(),
            'startedAt'  => $newSession->getStartedAt()?->format('c'),
            'customGoal' => $newSession->getCustomGoal(),
        ];

        if ($newSession instanceof Pomodoro) {
            $response['targetDuration'] = $newSession->getTargetDuration();
        }

        return $this->json($response, Response::HTTP_CREATED);
    }

    /**
     * Pause a session
     */
    #[Route('/{id}/pause', name: 'pause', methods: ['POST'])]
    public function pause(string $id): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $this->strategyForSession($session)->pauseSession($session);

        return $this->json([
            'id'     => $session->getId(),
            'status' => $session->getStatus(),
        ]);
    }

    /**
     * Resume a paused session
     */
    #[Route('/{id}/resume', name: 'resume', methods: ['POST'])]
    public function resume(string $id): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $this->strategyForSession($session)->resumeSession($session);

        return $this->json([
            'id'     => $session->getId(),
            'status' => $session->getStatus(),
        ]);
    }

    /**
     * End/complete a session normally
     */
    #[Route('/{id}/end', name: 'end', methods: ['POST'])]
    public function end(string $id, Request $request): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $data           = json_decode($request->getContent(), true) ?? [];
        $actualDuration = isset($data['actualDuration']) ? (int) $data['actualDuration'] : null;

        $this->strategyForSession($session)->endSession($session, $actualDuration);

        // Session may have been deleted (< 1 min)
        if ($session->getId() === null) {
            return $this->json(['deleted' => true]);
        }

        $response = [
            'id'             => $session->getId(),
            'status'         => $session->getStatus(),
            'actualDuration' => $session->getActualDuration(),
        ];

        if ($session instanceof Pomodoro) {
            $response['breakDuration'] = $session->getBreakDuration();
        } elseif ($session instanceof Flowtime) {
            $response['suggestedBreakDuration'] = $session->getSuggestedBreakDuration();
        }

        return $this->json($response);
    }

    /**
     * Interrupt/cancel a session
     */
    #[Route('/{id}/interrupt', name: 'interrupt', methods: ['POST'])]
    public function interrupt(string $id, Request $request): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $data           = json_decode($request->getContent(), true) ?? [];
        $actualDuration = isset($data['actualDuration']) ? (int) $data['actualDuration'] : null;

        $this->strategyForSession($session)->interruptSession($session, $actualDuration);

        if ($session->getId() === null) {
            return $this->json(['deleted' => true]);
        }

        return $this->json([
            'id'             => $session->getId(),
            'status'         => $session->getStatus(),
            'actualDuration' => $session->getActualDuration(),
        ]);
    }

    /**
     * Record the actual break taken after a session
     */
    #[Route('/{id}/break', name: 'break', methods: ['POST'])]
    public function recordBreak(string $id, Request $request): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $data     = json_decode($request->getContent(), true) ?? [];
        $duration = isset($data['duration']) ? max(0, (int) $data['duration']) : 0;

        $session->setBreakAfter($duration);
        $this->entityManager->flush();

        return $this->json([
            'id'         => $session->getId(),
            'breakAfter' => $session->getBreakAfter(),
        ]);
    }

    /**
     * Get session details
     */
    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        $session = $this->findUserSession($id);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        return $this->json($this->serializeSession($session));
    }

    /**
     * Serialize a session to an array for API responses
     */
    private function serializeSession(Session $session): array
    {
        $data = [
            'id'             => $session->getId(),
            'type'           => match (true) {
                $session instanceof Pomodoro     => 'pomodoro',
                $session instanceof Flowtime     => 'flowtime',
                $session instanceof TimeBlocking => 'time_blocking',
                default                          => 'unknown',
            },
            'status'         => $session->getStatus(),
            'customGoal'     => $session->getCustomGoal(),
            'startedAt'      => $session->getStartedAt()?->format('c'),
            'endedAt'        => $session->getEndedAt()?->format('c'),
            'actualDuration' => $session->getActualDuration(),
            'pauseCount'     => $session->getPauseCount(),
            'breakAfter'     => $session->getBreakAfter(),
        ];

        if ($session instanceof Pomodoro) {
            $data['targetDuration'] = $session->getTargetDuration();
            $data['breakDuration']  = $session->getBreakDuration();
        } elseif ($session instanceof Flowtime) {
            $data['suggestedBreakDuration'] = $session->getSuggestedBreakDuration();
        }

        return $data;
    }

    /**
     * Get the strategy service for a given session
     */
    private function strategyForSession(Session $session): SessionStrategy
    {
        $key = match (true) {
            $session instanceof Pomodoro     => 'pomodoro',
            $session instanceof Flowtime     => 'flowtime',
            $session instanceof TimeBlocking => 'time_blocking',
        };

        return $this->strategies->get($key);
    }

    /**
     * Find a session that belongs to the current user
     */
    private function findUserSession(string $id): Session|JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['error' => 'Session not found'], Response::HTTP_NOT_FOUND);
        }

        if ($session->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $session;
    }
}
