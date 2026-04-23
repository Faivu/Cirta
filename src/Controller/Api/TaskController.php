<?php

namespace App\Controller\Api;

use App\Entity\Task;
use App\Entity\User;
use App\Service\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/tasks', name: 'api_tasks_')]
final class TaskController extends AbstractController
{
    public function __construct(
        private TaskService $taskService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $results = $this->taskService->list($user);

        return $this->json(array_map(function ($row) {
            $task = $row[0];
            return [
                'id'           => $task->getId(),
                'title'        => $task->getTitle(),
                'isChecked'    => $task->isChecked(),
                'scheduleDate' => $task->getScheduleDate()?->format('c'),
                'totalDuration' => (int) ($row['totalDuration'] ?? 0),
            ];
        }, $results));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || trim($data['title']) === '') {
            return $this->json(['error' => 'Title is required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $task = $this->taskService->create($user, $data);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (\Exception) {
            return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'id'           => $task->getId(),
            'title'        => $task->getTitle(),
            'isChecked'    => $task->isChecked(),
            'scheduleDate' => $task->getScheduleDate()?->format('c'),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $task = $this->findUserTask($id, $user);
        if ($task instanceof JsonResponse) {
            return $task;
        }

        try {
            $this->taskService->update($task, $user, json_decode($request->getContent(), true));
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (\Exception) {
            return $this->json(['error' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'id'           => $task->getId(),
            'title'        => $task->getTitle(),
            'isChecked'    => $task->isChecked(),
            'scheduleDate' => $task->getScheduleDate()?->format('c'),
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $task = $this->findUserTask($id, $user);
        if ($task instanceof JsonResponse) {
            return $task;
        }

        $this->taskService->delete($task);

        return $this->json(['success' => true]);
    }

    private function findUserTask(string $id, User $user): Task|JsonResponse
    {
        $task = $this->taskService->findById($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        if ($task->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $task;
    }

    private function getAuthenticatedUser(): User|JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        assert($user instanceof User);
        return $user;
    }
}
