FROM dunglas/frankenphp:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN install-php-extensions \
    pdo_mysql \
    intl \
    opcache

# Set working directory
WORKDIR /app

# Copy application
COPY . /app

# Create minimal .env for build (real values come from Railway env vars)
RUN echo "APP_ENV=prod" > /app/.env

# Install composer dependencies (skip scripts to avoid cache:clear during build)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Build assets
RUN npm ci && npm run build

# Set permissions
RUN mkdir -p /app/var && chown -R www-data:www-data /app/var

# Create startup script that runs migrations and generates Caddyfile
RUN echo '#!/bin/sh\n\
\n\
# Create database schema (first deploy) or run migrations (subsequent deploys)\n\
php bin/console doctrine:schema:update --force || true\n\
\n\
# Generate Caddyfile\n\
echo "{\n\
    auto_https off\n\
    admin off\n\
    frankenphp\n\
}\n\
\n\
:${PORT:-8080} {\n\
    root * /app/public\n\
    encode zstd gzip\n\
    php_server\n\
}" > /etc/caddy/Caddyfile\n\
\n\
exec frankenphp run --config /etc/caddy/Caddyfile' > /start.sh && chmod +x /start.sh

EXPOSE 8080

CMD ["/bin/sh", "/start.sh"]
