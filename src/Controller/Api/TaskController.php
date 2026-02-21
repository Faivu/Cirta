<?php

namespace App\Controller\Api;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/tasks', name: 'api_tasks_')]
final class TaskController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $tasks = $this->entityManager->getRepository(Task::class)
            ->createQueryBuilder('t')
            ->where('t.user = :user')
            ->setParameter('user', $user)
            ->orderBy('t.isChecked', 'ASC')
            ->addOrderBy('t.id', 'DESC')
            ->getQuery()
            ->getResult();

        $data = array_map(function (Task $task) {
            return [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'isChecked' => $task->isChecked(),
                'scheduleDate' => $task->getScheduleDate()?->format('c'),
                'deadline' => $task->getDeadline()?->format('c'),
            ];
        }, $tasks);

        return $this->json($data);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || trim($data['title']) === '') {
            return $this->json(['error' => 'Title is required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $task = new Task();
            $task->setUser($user);
            $task->setTitle(trim($data['title']));
            $task->setIsChecked(false);

            if (!empty($data['scheduleDate'])) {
                $task->setScheduleDate(new \DateTime($data['scheduleDate']));
            }
            if (!empty($data['deadline'])) {
                $task->setDeadline(new \DateTime($data['deadline']));
            }

            $this->entityManager->persist($task);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'isChecked' => $task->isChecked(),
            'scheduleDate' => $task->getScheduleDate()?->format('c'),
            'deadline' => $task->getDeadline()?->format('c'),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $task = $this->entityManager->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        if ($task->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        try {
            if (isset($data['title'])) {
                $task->setTitle(trim($data['title']));
            }
            if (isset($data['isChecked'])) {
                $task->setIsChecked((bool) $data['isChecked']);
            }
            if (array_key_exists('scheduleDate', $data)) {
                $task->setScheduleDate($data['scheduleDate'] ? new \DateTime($data['scheduleDate']) : null);
            }
            if (array_key_exists('deadline', $data)) {
                $task->setDeadline($data['deadline'] ? new \DateTime($data['deadline']) : null);
            }

            $this->entityManager->flush();
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'isChecked' => $task->isChecked(),
            'scheduleDate' => $task->getScheduleDate()?->format('c'),
            'deadline' => $task->getDeadline()?->format('c'),
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $task = $this->entityManager->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        if ($task->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }
}
