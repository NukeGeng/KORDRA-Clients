#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
compose_file="$script_dir/compose.yaml"
env_file="$script_dir/.env"

if [ ! -f "$env_file" ]; then
	printf '%s\n' "Missing $script_dir/.env. Copy .env.example there and set local-only passwords." >&2
	exit 1
fi

if grep -Eq '^([A-Z0-9_]+)=local-only-' "$env_file"; then
	printf '%s\n' 'Replace the local-only example passwords in website/dev/.env before starting WordPress.' >&2
	exit 1
fi

compose() {
	docker compose --env-file "$env_file" --project-directory "$script_dir" -f "$compose_file" "$@"
}

if ! docker info >/dev/null 2>&1; then
	printf '%s\n' 'Docker is not running. Start Docker Desktop, then rerun this script.' >&2
	exit 1
fi

if python3 -c 'import socket; s=socket.socket(); s.settimeout(1); result=s.connect_ex(("127.0.0.1", 8081)); s.close(); raise SystemExit(0 if result == 0 else 1)'; then
	if ! compose ps --status running --services | grep -qx wordpress; then
		printf '%s\n' 'Port 8081 is already in use by another service. Stop here and choose an available local port.' >&2
		exit 1
	fi
fi

compose up -d --wait db wordpress
compose run --rm wpcli 'sh /bootstrap.sh'

printf '%s\n' 'Local KORDRA WordPress is ready at http://127.0.0.1:8081'
