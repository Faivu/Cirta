<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260308170540 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename free_session to time_blocking (table + discriminator values)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('RENAME TABLE free_session TO time_blocking');
        $this->addSql("UPDATE session SET type = 'time_blocking' WHERE type = 'free_session'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('RENAME TABLE time_blocking TO free_session');
        $this->addSql("UPDATE session SET type = 'free_session' WHERE type = 'time_blocking'");
    }
}
