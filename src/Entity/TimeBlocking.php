<?php

namespace App\Entity;

use App\Repository\TimeBlockingRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * TimeBlocking is an unstructured work session with no time constraints.
 * Simply tracks when start and stop working.
 */
#[ORM\Entity(repositoryClass: TimeBlockingRepository::class)]
class TimeBlocking extends Session
{
}
