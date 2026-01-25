<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260125095649 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE session (id INT AUTO_INCREMENT NOT NULL, custom_goal VARCHAR(255) DEFAULT NULL, status VARCHAR(20) NOT NULL, started_at DATETIME DEFAULT NULL, ended_at DATETIME DEFAULT NULL, actual_duration INT DEFAULT NULL, user_id INT NOT NULL, event_id INT DEFAULT NULL, task_id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, target_duration INT DEFAULT NULL, paused_at DATETIME DEFAULT NULL, total_paused_duration INT DEFAULT NULL, break_ratio INT DEFAULT NULL, suggested_break_duration INT DEFAULT NULL, notes LONGTEXT DEFAULT NULL, INDEX IDX_D044D5D4A76ED395 (user_id), INDEX IDX_D044D5D471F7E88B (event_id), INDEX IDX_D044D5D48DB60186 (task_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D4A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D471F7E88B FOREIGN KEY (event_id) REFERENCES event (id)');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D48DB60186 FOREIGN KEY (task_id) REFERENCES task (id)');
        $this->addSql('DROP TABLE flowtime');
        $this->addSql('DROP TABLE free_session');
        $this->addSql('DROP TABLE pomodoro');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE flowtime (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_general_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE free_session (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_general_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE pomodoro (id INT AUTO_INCREMENT NOT NULL, target_duration INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_general_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D4A76ED395');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D471F7E88B');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D48DB60186');
        $this->addSql('DROP TABLE session');
    }
}
