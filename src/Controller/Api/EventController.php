<?php

namespace App\Controller\Api;

use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/events', name: 'api_events_')]
final class EventController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Get events for the current user
     *
     * Query params:
     * - start: ISO date string for range start (optional)
     * - end: ISO date string for range end (optional)
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $qb = $this->entityManager->getRepository(Event::class)
            ->createQueryBuilder('e')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->orderBy('e.startAt', 'ASC');

        // Optional date range filtering
        $start = $request->query->get('start');
        $end = $request->query->get('end');

        if ($start) {
            try {
                $startDate = new \DateTime($start);
                $qb->andWhere('e.endAt >= :start')
                   ->setParameter('start', $startDate);
            } catch (\Exception $e) {
                // Invalid date, ignore filter
            }
        }

        if ($end) {
            try {
                $endDate = new \DateTime($end);
                $qb->andWhere('e.startAt <= :end')
                   ->setParameter('end', $endDate);
            } catch (\Exception $e) {
                // Invalid date, ignore filter
            }
        }

        $events = $qb->getQuery()->getResult();

        $data = array_map(function (Event $event) {
            return [
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'category' => $event->getCategory(),
                'color' => $event->getColor(),
                'startAt' => $event->getStartAt()?->format('c'),
                'endAt' => $event->getEndAt()?->format('c'),
                'allDay' => $event->isAllDay(),
                'isReoccurring' => $event->isReoccurring(),
                'reoccurrencePattern' => $event->getReoccurrencePattern(),
            ];
        }, $events);

        return $this->json($data);
    }

    /**
     * Get a single event
     */
    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $event = $this->entityManager->getRepository(Event::class)->find($id);

        if (!$event) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        if ($event->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'id' => $event->getId(),
            'title' => $event->getTitle(),
            'category' => $event->getCategory(),
            'color' => $event->getColor(),
            'startAt' => $event->getStartAt()?->format('c'),
            'endAt' => $event->getEndAt()?->format('c'),
            'allDay' => $event->isAllDay(),
            'isReoccurring' => $event->isReoccurring(),
            'reoccurrencePattern' => $event->getReoccurrencePattern(),
            'reoccurrenceEndDate' => $event->getReoccurrenceEndDate()?->format('c'),
        ]);
    }

    /**
     * Create a new event
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || !isset($data['startAt']) || !isset($data['endAt'])) {
            return $this->json(['error' => 'Title, startAt, and endAt are required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $event = new Event();
            $event->setUser($user);
            $event->setTitle($data['title']);
            $event->setStartAt(new \DateTime($data['startAt']));
            $event->setEndAt(new \DateTime($data['endAt']));
            $event->setCategory($data['category'] ?? 'default');
            $event->setColor($data['color'] ?? '#3b82f6');
            $event->setAllDay($data['allDay'] ?? false);
            $event->setIsReoccurring($data['isReoccurring'] ?? false);

            if (isset($data['reoccurrencePattern'])) {
                $event->setReoccurrencePattern($data['reoccurrencePattern']);
            }
            if (isset($data['reoccurrenceEndDate'])) {
                $event->setReoccurrenceEndDate(new \DateTime($data['reoccurrenceEndDate']));
            }

            $this->entityManager->persist($event);
            $this->entityManager->flush();

            return $this->json([
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'category' => $event->getCategory(),
                'color' => $event->getColor(),
                'startAt' => $event->getStartAt()?->format('c'),
                'endAt' => $event->getEndAt()?->format('c'),
                'allDay' => $event->isAllDay(),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Update an event
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $event = $this->entityManager->getRepository(Event::class)->find($id);

        if (!$event) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        if ($event->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        try {
            if (isset($data['title'])) {
                $event->setTitle($data['title']);
            }
            if (isset($data['startAt'])) {
                $event->setStartAt(new \DateTime($data['startAt']));
            }
            if (isset($data['endAt'])) {
                $event->setEndAt(new \DateTime($data['endAt']));
            }
            if (isset($data['category'])) {
                $event->setCategory($data['category']);
            }
            if (isset($data['color'])) {
                $event->setColor($data['color']);
            }
            if (isset($data['allDay'])) {
                $event->setAllDay($data['allDay']);
            }

            $this->entityManager->flush();

            return $this->json([
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'category' => $event->getCategory(),
                'color' => $event->getColor(),
                'startAt' => $event->getStartAt()?->format('c'),
                'endAt' => $event->getEndAt()?->format('c'),
                'allDay' => $event->isAllDay(),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete an event
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $event = $this->entityManager->getRepository(Event::class)->find($id);

        if (!$event) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }

        if ($event->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($event);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }
}
