<?php

namespace App\Controller\Api;

use App\Repository\SessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/analytics', name: 'api_analytics_')]
final class AnalyticsController extends AbstractController
{
    public function __construct(
        private SessionRepository $sessionRepository,
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $from = null;
        $to   = null;

        if ($fromStr = $request->query->get('from')) {
            $from = new \DateTime($fromStr);
        }
        if ($toStr = $request->query->get('to')) {
            $to = new \DateTime($toStr);
        }

        return $this->json($this->sessionRepository->getAnalytics($user, $from, $to));
    }
}
