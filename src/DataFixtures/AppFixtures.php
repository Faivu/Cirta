<?php

namespace App\DataFixtures;

use App\Entity\Event;
use App\Entity\Flowtime;
use App\Entity\Pomodoro;
use App\Entity\Task;
use App\Entity\TimeBlocking;
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

        // Current week days (today = Thursday Mar 19)
        $mon = (clone $now)->modify('-3 days');
        $tue = (clone $now)->modify('-2 days');
        $wed = (clone $now)->modify('-1 day');
        $thu = clone $now;
        $fri = (clone $now)->modify('+1 day');

        // Helper to set time on a date
        $at = fn(\DateTime $day, int $h, int $m) => (clone $day)->setTime($h, $m);

        // --- Weekly lecture schedule ---

        $lectures = [
            // Monday
            ['Algorithms',          'Lectures', '#3b82f6', $mon, 9,  0, 11, 0],
            ['Database Systems',    'Lectures', '#8b5cf6', $mon, 13, 0, 15, 0],
            ['Gym',                 'Personal', '#14b8a6', $mon, 17, 0, 18, 30],
            // Tuesday
            ['Software Engineering','Lectures', '#10b981', $tue, 10, 0, 12, 0],
            ['Linear Algebra',      'Lectures', '#f59e0b', $tue, 14, 0, 16, 0],
            // Wednesday
            ['Algorithms',          'Lectures', '#3b82f6', $wed, 9,  0, 11, 0],
            ['Operating Systems',   'Lectures', '#ef4444', $wed, 13, 0, 14, 30],
            ['Gym',                 'Personal', '#14b8a6', $wed, 17, 0, 18, 30],
            // Thursday
            ['Database Systems',    'Lectures', '#8b5cf6', $thu, 11, 0, 13, 0],
            ['Software Engineering','Lectures', '#10b981', $thu, 15, 0, 17, 0],
            // Friday
            ['Linear Algebra',      'Lectures', '#f59e0b', $fri, 9,  0, 11, 0],
            ['Operating Systems',   'Lectures', '#ef4444', $fri, 12, 0, 13, 30],
        ];

        foreach ($lectures as [$title, $category, $color, $day, $sh, $sm, $eh, $em]) {
            $event = new Event();
            $event->setUser($user)
                  ->setTitle($title)
                  ->setCategory($category)
                  ->setColor($color)
                  ->setStartAt($at($day, $sh, $sm))
                  ->setEndAt($at($day, $eh, $em))
                  ->setAllDay(false)
                  ->setIsReoccurring(false);
            $manager->persist($event);
        }

        // --- Events ---

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

        // --- Tasks ---

        $t1 = new Task();
        $t1->setUser($user)
           ->setTitle('Write project proposal')
           ->setIsChecked(false)
           ->setScheduleDate((clone $now));
        $manager->persist($t1);

        $t2 = new Task();
        $t2->setUser($user)
           ->setTitle('Review lecture notes')
           ->setIsChecked(true)
           ->setScheduleDate((clone $now)->modify('-1 day'));
        $manager->persist($t2);

        $t3 = new Task();
        $t3->setUser($user)
           ->setTitle('Read chapter 5')
           ->setIsChecked(false)
           ->setScheduleDate((clone $now));
        $manager->persist($t3);

        // --- Pomodoros ---

        $p1 = new Pomodoro();
        $p1->setUser($user)
           ->setEvent($e1)
           ->setTask($t2)
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

        $p2 = new Pomodoro();
        $p2->setUser($user)
           ->setEvent($e1)
           ->setTask($t2)
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

        $p5 = new Pomodoro();
        $p5->setUser($user)
           ->setEvent($e3)
           ->setTask($t1)
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

        $p6 = new Pomodoro();
        $p6->setUser($user)
           ->setCustomGoal('Inbox zero')
           ->setStatus('completed')
           ->setTargetDuration(25)
           ->setStartedAt((clone $now)->modify('-3 days')->setTime(8, 0))
           ->setEndedAt((clone $now)->modify('-3 days')->setTime(8, 25))
           ->setActualDuration(25)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(5)
           ->setBreakTaken(5);
        $manager->persist($p6);

        // Long break pomodoro (after 4th in a cycle)
        $p7 = new Pomodoro();
        $p7->setUser($user)
           ->setCustomGoal('Algorithm practice')
           ->setStatus('completed')
           ->setTargetDuration(25)
           ->setStartedAt((clone $now)->modify('-1 day')->setTime(10, 0))
           ->setEndedAt((clone $now)->modify('-1 day')->setTime(10, 25))
           ->setActualDuration(25)
           ->setPauseDuration(0)
           ->setPauseCount(0)
           ->setBreakDuration(15)
           ->setBreakTaken(15);
        $manager->persist($p7);

        // --- Flowtime sessions ---

        // Long focused flowtime session yesterday
        $f1 = new Flowtime();
        $f1->setUser($user)
           ->setEvent($e2)
           ->setTask($t2)
           ->setCustomGoal('Review lecture notes')
           ->setStatus('completed')
           ->setBreakRatio(5)
           ->setSuggestedBreakDuration(9)
           ->setStartedAt((clone $now)->modify('-1 day')->setTime(15, 0))
           ->setEndedAt((clone $now)->modify('-1 day')->setTime(15, 45))
           ->setActualDuration(45);
        $manager->persist($f1);

        // Shorter flowtime today
        $f2 = new Flowtime();
        $f2->setUser($user)
           ->setTask($t1)
           ->setCustomGoal('Write project proposal')
           ->setStatus('completed')
           ->setBreakRatio(5)
           ->setSuggestedBreakDuration(6)
           ->setStartedAt((clone $now)->setTime(11, 0))
           ->setEndedAt((clone $now)->setTime(11, 30))
           ->setActualDuration(30);
        $manager->persist($f2);

        // Interrupted flowtime 3 days ago
        $f3 = new Flowtime();
        $f3->setUser($user)
           ->setCustomGoal('Research competitors')
           ->setStatus('completed')
           ->setBreakRatio(5)
           ->setSuggestedBreakDuration(18)
           ->setStartedAt((clone $now)->modify('-3 days')->setTime(13, 0))
           ->setEndedAt((clone $now)->modify('-3 days')->setTime(14, 30))
           ->setActualDuration(90);
        $manager->persist($f3);

        // Deep flowtime session 2 days ago
        $f4 = new Flowtime();
        $f4->setUser($user)
           ->setEvent($e1)
           ->setCustomGoal('System architecture design')
           ->setStatus('completed')
           ->setBreakRatio(5)
           ->setSuggestedBreakDuration(12)
           ->setStartedAt((clone $now)->modify('-2 days')->setTime(10, 30))
           ->setEndedAt((clone $now)->modify('-2 days')->setTime(11, 30))
           ->setActualDuration(60);
        $manager->persist($f4);

        // --- Time Blocking sessions ---

        // Full morning block yesterday
        $tb1 = new TimeBlocking();
        $tb1->setUser($user)
            ->setEvent($e2)
            ->setCustomGoal('Exam preparation block')
            ->setStatus('completed')
            ->setStartedAt((clone $now)->modify('-1 day')->setTime(9, 0))
            ->setEndedAt((clone $now)->modify('-1 day')->setTime(10, 0))
            ->setActualDuration(60);
        $manager->persist($tb1);

        // Shorter time block today
        $tb2 = new TimeBlocking();
        $tb2->setUser($user)
            ->setTask($t3)
            ->setCustomGoal('Read chapter 5')
            ->setStatus('completed')
            ->setStartedAt((clone $now)->setTime(8, 0))
            ->setEndedAt((clone $now)->setTime(8, 45))
            ->setActualDuration(45);
        $manager->persist($tb2);

        // Time block 3 days ago
        $tb3 = new TimeBlocking();
        $tb3->setUser($user)
            ->setCustomGoal('Weekly planning')
            ->setStatus('completed')
            ->setStartedAt((clone $now)->modify('-3 days')->setTime(7, 30))
            ->setEndedAt((clone $now)->modify('-3 days')->setTime(8, 0))
            ->setActualDuration(30);
        $manager->persist($tb3);

        // Interrupted time block
        $tb4 = new TimeBlocking();
        $tb4->setUser($user)
            ->setCustomGoal('Drafting report')
            ->setStatus('interrupted')
            ->setStartedAt((clone $now)->modify('-2 days')->setTime(16, 0))
            ->setEndedAt((clone $now)->modify('-2 days')->setTime(16, 20))
            ->setActualDuration(20);
        $manager->persist($tb4);

        $manager->flush();
    }
}
