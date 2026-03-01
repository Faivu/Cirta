<?php

namespace App\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\AbstractIdGenerator;
use Symfony\Component\Uid\Uuid;

final class UuidV7Generator extends AbstractIdGenerator
{
    public function generateId(EntityManagerInterface $em, $entity): Uuid
    {
        return Uuid::v7();
    }
}
