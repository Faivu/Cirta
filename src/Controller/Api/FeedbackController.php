<?php

namespace App\Controller\Api;

use App\Entity\Feedback;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/feedback', name: 'api_feedback_')]
final class FeedbackController extends AbstractController
{
    private const VALID_CATEGORIES = ['bug', 'ui', 'feature', 'general'];

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'submit', methods: ['POST'])]
    public function submit(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        $category = $data['category'] ?? null;
        if (!in_array($category, self::VALID_CATEGORIES, true)) {
            return $this->json(['error' => 'Invalid category'], Response::HTTP_BAD_REQUEST);
        }

        $comment = trim($data['comment'] ?? '');
        if ($comment === '') {
            return $this->json(['error' => 'Comment is required'], Response::HTTP_BAD_REQUEST);
        }

        $feedback = new Feedback();
        $feedback->setUser($user);
        $feedback->setCategory($category);
        $feedback->setComment($comment);

        $this->entityManager->persist($feedback);
        $this->entityManager->flush();

        return $this->json(['success' => true], Response::HTTP_CREATED);
    }
}
