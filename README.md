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

## scripts

### add a http status check

```sh
yarn statuscheck:http:add --domain example.com --path /
# with optional params
yarn statuscheck:http:add --domain example.com --path / --label foo --protocol http --interval 50
```

* **domain** (string) - required
* **path** (string) - required
* **label** (optional) - defaults to `--domain`
* **protocol** (optional) - defaults to `https`
* **interval** (optional) - defaults to `60` (seconds)
* **threshold** (optional) - # of failing checks before a notification is sent. defaults to `1`

### remove a status check

```sh
# delete by id
yarn statuscheck:remove --id 1234
# or by label
yarn statuscheck:remove --label example.com
```
