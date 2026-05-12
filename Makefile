.PHONY: dev build start export migrate

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

export:
	@curl -s -H "X-API-Key: $$(grep '^API_KEY=' .env.local | cut -d= -f2-)" http://localhost:3000/api/export

migrate:
	npx tsx scripts/migrate.ts
