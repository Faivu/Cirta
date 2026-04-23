<?php

namespace App\Controller\Api;

use App\Entity\Event;
use App\Entity\User;
use App\Service\EventService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/events', name: 'api_events_')]
final class EventController extends AbstractController
{
    public function __construct(
        private EventService $eventService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $events = $this->eventService->list(
            $user,
            $request->query->get('start'),
            $request->query->get('end')
        );

        return $this->json(array_map($this->serializeEvent(...), $events));
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $event = $this->findUserEvent($id, $user);
        if ($event instanceof JsonResponse) {
            return $event;
        }

        return $this->json([
            ...$this->serializeEvent($event),
            'reoccurrenceEndDate' => $event->getReoccurrenceEndDate()?->format('c'),
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || !isset($data['startAt']) || !isset($data['endAt'])) {
            return $this->json(['error' => 'Title, startAt, and endAt are required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $event = $this->eventService->create($user, $data);
        } catch (\Exception) {
            return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json($this->serializeEvent($event), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $event = $this->findUserEvent($id, $user);
        if ($event instanceof JsonResponse) {
            return $event;
        }

        try {
            $this->eventService->update($event, json_decode($request->getContent(), true));
        } catch (\Exception) {
            return $this->json(['error' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json($this->serializeEvent($event));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $event = $this->findUserEvent($id, $user);
        if ($event instanceof JsonResponse) {
            return $event;
        }

        $this->eventService->delete($event);

        return $this->json(['success' => true]);
    }

    private function serializeEvent(Event $event): array
    {
        return [
            'id'                  => $event->getId(),
            'title'               => $event->getTitle(),
            'category'            => $event->getCategory(),
            'color'               => $event->getColor(),
            'startAt'             => $event->getStartAt()?->format('c'),
            'endAt'               => $event->getEndAt()?->format('c'),
            'allDay'              => $event->isAllDay(),
            'isReoccurring'       => $event->isReoccurring(),
            'reoccurrencePattern' => $event->getReoccurrencePattern(),
        ];
    }

    private function findUserEvent(string $id, User $user): Event|JsonResponse
    {
        $event = $this->eventService->findById($id);

        if (!$event) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        if ($event->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $event;
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
