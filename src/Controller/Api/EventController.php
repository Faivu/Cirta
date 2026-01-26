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
}
