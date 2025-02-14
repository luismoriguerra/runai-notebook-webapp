
DB_NAME=runai-notebook-db

dev:
	npm run dev

build:
	npm run pages:build

deploy:
	npx wrangler d1 migrations apply $(DB_NAME) --remote
	npm run deploy

migration:
	npx wrangler d1 migrations create $(DB_NAME) ${name}

migrate:
	npx wrangler d1 migrations apply $(DB_NAME) --local
