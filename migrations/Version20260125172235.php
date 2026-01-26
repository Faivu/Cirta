<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260125172235 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE flowtime (break_ratio INT NOT NULL, suggested_break_duration INT DEFAULT NULL, id INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE free_session (id INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE pomodoro (target_duration INT NOT NULL, pause_duration INT NOT NULL, pause_count INT NOT NULL, id INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE flowtime ADD CONSTRAINT FK_C33096CDBF396750 FOREIGN KEY (id) REFERENCES session (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE free_session ADD CONSTRAINT FK_FAE004AABF396750 FOREIGN KEY (id) REFERENCES session (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE pomodoro ADD CONSTRAINT FK_2C4F0519BF396750 FOREIGN KEY (id) REFERENCES session (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE session DROP target_duration, DROP pause_duration, DROP break_ratio, DROP suggested_break_duration, DROP notes, DROP pause_count');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE flowtime DROP FOREIGN KEY FK_C33096CDBF396750');
        $this->addSql('ALTER TABLE free_session DROP FOREIGN KEY FK_FAE004AABF396750');
        $this->addSql('ALTER TABLE pomodoro DROP FOREIGN KEY FK_2C4F0519BF396750');
        $this->addSql('DROP TABLE flowtime');
        $this->addSql('DROP TABLE free_session');
        $this->addSql('DROP TABLE pomodoro');
        $this->addSql('ALTER TABLE session ADD target_duration INT DEFAULT NULL, ADD pause_duration INT DEFAULT NULL, ADD break_ratio INT DEFAULT NULL, ADD suggested_break_duration INT DEFAULT NULL, ADD notes LONGTEXT DEFAULT NULL, ADD pause_count INT DEFAULT NULL');
    }
}
