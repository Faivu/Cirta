<?php

namespace App\Entity;

use App\Doctrine\UuidV7Generator;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\MappedSuperclass]
abstract class BaseEntity
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidV7Generator::class)]
    private ?Uuid $id = null;

    public function getId(): ?string
    {
        return $this->id?->toRfc4122();
    }
}
