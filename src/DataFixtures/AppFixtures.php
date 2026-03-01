<?php

namespace App\DataFixtures;

use App\Entity\Event;
use App\Entity\Pomodoro;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $user = $manager->getRepository(User::class)->findOneBy(['email' => 'glitsh77@gmail.com']);

        if (!$user) {
            throw new \RuntimeException('User not found. Log in first to create your account.');
        }

        $now = new \DateTime();

        // --- Events ---
        $events = [];

        $e1 = new Event();
        $e1->setUser($user)
           ->setTitle('Deep Work Block')
           ->setCategory('Work')
           ->setColor('#6366f1')
           ->setStartAt((clone $now)->modify('-2 days')->setTime(9, 0))
           ->setEndAt((clone $now)->modify('-2 days')->setTime(11, 0))
           ->setAllDay(false)
           ->setIsReoccurring(false);
        $manager->persist($e1);
        $events[] = $e1;

        $e2 = new Event();
        $e2->setUser($user)
           ->setTitle('Study Session')
           ->setCategory('Learning')
           ->setColor('#10b981')
           ->setStartAt((clone $now)->modify('-1 day')->setTime(14, 0))
           ->setEndAt((clone $now)->modify('-1 day')->setTime(16, 0))
           ->setAllDay(false)
           ->setIsReoccurring(false);
        $manager->persist($e2);
        $events[] = $e2;

        $e3 = new Event();
        $e3->setUser($user)
           ->setTitle('Project Planning')
           ->setCategory('Work')
           ->setColor('#f59e0b')
           ->setStartAt((clone $now)->setTime(10, 0))
           ->setEndAt((clone $now)->setTime(11, 30))
           ->setAllDay(false)
           ->setIsReoccurring(false);
        $manager->persist($e3);
        $events[] = $e3;

        $e4 = new Event();
        $e4->setUser($user)
           ->setTitle('Reading')
           ->setCategory('Personal')
           ->setColor('#ec4899')
           ->setStartAt((clone $now)->modify('+1 day')->setTime(20, 0))
           ->setEndAt((clone $now)->modify('+1 day')->setTime(21, 0))
           ->setAllDay(false)
           ->setIsReoccurring(false);
        $manager->persist($e4);
        $events[] = $e4;

        // --- Pomodoros ---

        // Completed pomodoro 2 days ago, linked to Deep Work Block
        $p1 = new Pomodoro();
        $p1->setUser($user)
           ->setEvent($e1)
           ->setTargetDuration(25)
           ->setStatus('completed')
           ->setStartedAt((clone $now)->modify('-2 days')->setTime(9, 0))
           ->setEndedAt((clone $now)->modify('-2 days')->setTime(9, 27))
           ->setActualDuration(25)
           ->setPauseDuration(2)
           ->setPauseCount(1)
           ->setBreakDuration(5)
           ->setBreakTaken(5);
        $manager->persist($p1);

        // Second completed pomodoro same day
        $p2 = new Pomodoro();
        $p2->setUser($user)
           ->setEvent($e1)
           ->setTargetDuration(25)
           ->setStatus('completed')
           ->setStartedAt((clone $now)->modify('-2 days')->setTime(9, 35))
           ->setEndedAt((clone $now)->modify('-2 days')->setTime(10, 0))
           ->setActualDuration(25)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(5)
           ->setBreakTaken(null);
        $manager->persist($p2);

        // Interrupted pomodoro yesterday, linked to Study Session
        $p3 = new Pomodoro();
        $p3->setUser($user)
           ->setEvent($e2)
           ->setTargetDuration(25)
           ->setStatus('interrupted')
           ->setStartedAt((clone $now)->modify('-1 day')->setTime(14, 0))
           ->setEndedAt((clone $now)->modify('-1 day')->setTime(14, 12))
           ->setActualDuration(12)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(5)
           ->setBreakTaken(null);
        $manager->persist($p3);

        // Completed pomodoro yesterday
        $p4 = new Pomodoro();
        $p4->setUser($user)
           ->setEvent($e2)
           ->setTargetDuration(25)
           ->setStatus('completed')
           ->setStartedAt((clone $now)->modify('-1 day')->setTime(14, 20))
           ->setEndedAt((clone $now)->modify('-1 day')->setTime(14, 47))
           ->setActualDuration(25)
           ->setPauseDuration(2)
           ->setPauseCount(1)
           ->setBreakDuration(5)
           ->setBreakTaken(5);
        $manager->persist($p4);

        // Completed pomodoro today, linked to Project Planning
        $p5 = new Pomodoro();
        $p5->setUser($user)
           ->setEvent($e3)
           ->setTargetDuration(25)
           ->setStatus('completed')
           ->setStartedAt((clone $now)->setTime(10, 0))
           ->setEndedAt((clone $now)->setTime(10, 25))
           ->setActualDuration(25)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(5)
           ->setBreakTaken(5);
        $manager->persist($p5);

        // No-event standalone pomodoro (completed, no specific event)
        $p6 = new Pomodoro();
        $p6->setUser($user)
           ->setTargetDuration(25)
           ->setCustomGoal('Inbox zero')
           ->setStatus('completed')
           ->setStartedAt((clone $now)->modify('-3 days')->setTime(8, 0))
           ->setEndedAt((clone $now)->modify('-3 days')->setTime(8, 25))
           ->setActualDuration(25)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(5)
           ->setBreakTaken(5);
        $manager->persist($p6);

        $manager->flush();

        // Created 4 events and 6 pomodoros for glitsh77@gmail.com
    }
}
