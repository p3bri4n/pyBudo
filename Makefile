# helpful Makefile to build and launch all (backend+Frontend), just the backend, or just the frontend
.PHONY: all backend frontend logs down restart

all:
	docker-compose build && docker-compose up -d

backend:
	docker-compose build api && docker-compose up -d db api

frontend:
	docker-compose build frontend && docker-compose up -d frontend

logs:
	docker-compose logs -f

down:
	docker-compose down

restart:
	docker-compose restart
