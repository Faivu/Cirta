<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260405131941 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_settings (id BINARY(16) NOT NULL, calendar_drag_confirm TINYINT NOT NULL, calendar_week_start VARCHAR(10) NOT NULL, calendar_default_view VARCHAR(10) NOT NULL, calendar_time_format VARCHAR(3) NOT NULL, default_strategy VARCHAR(20) NOT NULL, pomodoro_serious_mode TINYINT NOT NULL, pomodoro_work_duration INT NOT NULL, pomodoro_short_break INT NOT NULL, pomodoro_long_break INT NOT NULL, flowtime_break_ratio INT NOT NULL, todo_default_filter VARCHAR(10) NOT NULL, todo_keep_finished_visible TINYINT NOT NULL, todo_unchecked_no_confirm TINYINT NOT NULL, timezone VARCHAR(64) NOT NULL, user_id BINARY(16) NOT NULL, UNIQUE INDEX UNIQ_5C844C5A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE user_settings ADD CONSTRAINT FK_5C844C5A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_settings DROP FOREIGN KEY FK_5C844C5A76ED395');
        $this->addSql('DROP TABLE user_settings');
    }
}
