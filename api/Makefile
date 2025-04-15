.PHONY: up down logs shell migrate init tests format lint
run:
	uv run uvicorn src.main:app --reload

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec api bash

migrate:
	docker compose exec api alembic upgrade head

init:
	@echo "Installing dependencies..."
	python -m pip install -e .
	@echo "Creating development environment..."
	docker compose up -d postgres
	@echo "Running initial migrations..."
	sleep 5 # Give the database time to start
	alembic upgrade head

tests:
	pytest

format:
	black .
	isort .

lint:
	black --check .
	isort --check .