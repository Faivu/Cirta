<?php

namespace App\Twig;

use App\Service\SettingsService;
use Symfony\Bundle\SecurityBundle\Security;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class AppExtension extends AbstractExtension implements GlobalsInterface
{
    public function __construct(
        private Security $security,
        private SettingsService $settingsService,
    ) {}

    public function getGlobals(): array
    {
        $user = $this->security->getUser();

        if (!$user) {
            return ['darkMode' => false];
        }

        $settings = $this->settingsService->getOrCreate($user);

        return ['darkMode' => $settings->isDarkMode()];
    }
}
