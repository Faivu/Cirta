<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserSettings;
use App\Repository\UserSettingsRepository;
use Doctrine\ORM\EntityManagerInterface;

class SettingsService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserSettingsRepository $userSettingsRepository,
    ) {}

    public function getOrCreate(User $user): UserSettings
    {
        $settings = $this->userSettingsRepository->findByUser($user);

        if (!$settings) {
            $settings = new UserSettings();
            $settings->setUser($user);
            $this->entityManager->persist($settings);
            $this->entityManager->flush();
        }

        return $settings;
    }

    public function serialize(UserSettings $settings): array
    {
        return [
            'calendarDragConfirm'      => $settings->isCalendarDragConfirm(),
            'calendarWeekStart'        => $settings->getCalendarWeekStart(),
            'calendarDefaultView'      => $settings->getCalendarDefaultView(),
            'calendarTimeFormat'       => $settings->getCalendarTimeFormat(),
            'defaultStrategy'          => $settings->getDefaultStrategy(),
            'pomodoroSeriousMode'      => $settings->isPomodoroSeriousMode(),
            'pomodoroWorkDuration'     => $settings->getPomodoroWorkDuration(),
            'pomodoroShortBreak'       => $settings->getPomodoroShortBreak(),
            'pomodoroLongBreak'        => $settings->getPomodoroLongBreak(),
            'flowtimeBreakRatio'       => $settings->getFlowtimeBreakRatio(),
            'todoDefaultFilter'        => $settings->getTodoDefaultFilter(),
            'todoKeepFinishedVisible'  => $settings->isTodoKeepFinishedVisible(),
            'todoUncheckedNoConfirm'   => $settings->isTodoUncheckedNoConfirm(),
            'timezone'                 => $settings->getTimezone(),
        ];
    }
}
