# moin-bot

> (work in progress) discord bot for website monitoring

## deploy

```sh
sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres
sudo dokku plugin:install https://github.com/dokku/dokku-redis.git redis

sudo dokku apps:create moin
sudo dokku redis:create moin-redis
sudo dokku postgres:create moin-postgres
sudo dokku redis:link moin-redis moin
sudo dokku postgres:link moin-postgres moin
sudo dokku ps:scale moin worker=1 web=0

# first time setup
sudo dokku enter moin
yarn prisma:seed
```