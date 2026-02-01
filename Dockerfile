FROM dunglas/frankenphp:latest

# Install PHP extensions
RUN install-php-extensions \
    pdo_mysql \
    intl \
    opcache

# Set working directory
WORKDIR /app

# Copy application
COPY . /app

# Install composer dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Install Node and build assets
RUN apt-get update && apt-get install -y nodejs npm
RUN npm ci && npm run build

# Set permissions
RUN chown -R www-data:www-data /app/var

# Configure Caddy for Symfony
RUN echo '{\n\
    auto_https off\n\
    admin off\n\
    frankenphp\n\
}\n\
\n\
:${PORT} {\n\
    root * /app/public\n\
    encode zstd gzip\n\
    php_server\n\
}' > /etc/caddy/Caddyfile

EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
