-- Allow app user to connect from any host (for local development)
-- Password is set via MYSQL_PASSWORD env var when user is created
GRANT ALL ON app.* TO 'app'@'%';
FLUSH PRIVILEGES;
