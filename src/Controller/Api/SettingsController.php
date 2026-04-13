<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\SettingsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/settings', name: 'api_settings_')]
final class SettingsController extends AbstractController
{
    private const VALID_WEEK_STARTS  = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    private const VALID_VIEWS        = ['day', 'week', 'month'];
    private const VALID_TIME_FORMATS = ['12h', '24h'];
    private const VALID_STRATEGIES   = ['pomodoro', 'flowtime', 'time_blocking'];
    private const VALID_FILTERS      = ['today', 'all'];

    public function __construct(
        private SettingsService $settingsService,
        private EntityManagerInterface $entityManager,
    ) {}

    #[Route('', name: 'get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) return $user;

        $settings = $this->settingsService->getOrCreate($user);

        return $this->json($this->settingsService->serialize($settings));
    }

    #[Route('', name: 'update', methods: ['PUT'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user instanceof JsonResponse) return $user;

        $data     = json_decode($request->getContent(), true) ?? [];
        $settings = $this->settingsService->getOrCreate($user);

        if (isset($data['calendarDragConfirm'])) {
            $settings->setCalendarDragConfirm((bool) $data['calendarDragConfirm']);
        }
        if (isset($data['calendarWeekStart']) && in_array($data['calendarWeekStart'], self::VALID_WEEK_STARTS, true)) {
            $settings->setCalendarWeekStart($data['calendarWeekStart']);
        }
        if (isset($data['calendarDefaultView']) && in_array($data['calendarDefaultView'], self::VALID_VIEWS, true)) {
            $settings->setCalendarDefaultView($data['calendarDefaultView']);
        }
        if (isset($data['calendarTimeFormat']) && in_array($data['calendarTimeFormat'], self::VALID_TIME_FORMATS, true)) {
            $settings->setCalendarTimeFormat($data['calendarTimeFormat']);
        }
        if (isset($data['defaultStrategy']) && in_array($data['defaultStrategy'], self::VALID_STRATEGIES, true)) {
            $settings->setDefaultStrategy($data['defaultStrategy']);
        }
        if (isset($data['pomodoroSeriousMode'])) {
            $settings->setPomodoroSeriousMode((bool) $data['pomodoroSeriousMode']);
        }
        if (isset($data['pomodoroWorkDuration'])) {
            $settings->setPomodoroWorkDuration(max(1, min(99, (int) $data['pomodoroWorkDuration'])));
        }
        if (isset($data['pomodoroShortBreak'])) {
            $settings->setPomodoroShortBreak(max(1, min(30, (int) $data['pomodoroShortBreak'])));
        }
        if (isset($data['pomodoroLongBreak'])) {
            $settings->setPomodoroLongBreak(max(1, min(60, (int) $data['pomodoroLongBreak'])));
        }
        if (isset($data['flowtimeBreakRatio'])) {
            $settings->setFlowtimeBreakRatio(max(1, min(10, (int) $data['flowtimeBreakRatio'])));
        }
        if (isset($data['todoDefaultFilter']) && in_array($data['todoDefaultFilter'], self::VALID_FILTERS, true)) {
            $settings->setTodoDefaultFilter($data['todoDefaultFilter']);
        }
        if (isset($data['todoKeepFinishedVisible'])) {
            $settings->setTodoKeepFinishedVisible((bool) $data['todoKeepFinishedVisible']);
        }
        if (isset($data['todoUncheckedNoConfirm'])) {
            $settings->setTodoUncheckedNoConfirm((bool) $data['todoUncheckedNoConfirm']);
        }
        if (isset($data['timezone']) && $this->isValidTimezone($data['timezone'])) {
            $settings->setTimezone($data['timezone']);
        }
        if (isset($data['darkMode'])) {
            $settings->setDarkMode((bool) $data['darkMode']);
        }

        $this->entityManager->flush();

        return $this->json($this->settingsService->serialize($settings));
    }

    private function isValidTimezone(string $timezone): bool
    {
        return in_array($timezone, \DateTimeZone::listIdentifiers(), true);
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
