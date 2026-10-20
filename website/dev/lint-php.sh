#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
website_dir="$script_dir/.."

if ! docker info >/dev/null 2>&1; then
	printf '%s\n' 'Docker is not running. Start Docker Desktop, then rerun PHP lint.' >&2
	exit 1
fi

docker run --rm \
	--entrypoint sh \
	-v "$website_dir:/website:ro" \
	wordpress:7.1.3-php8.3-apache \
	-ec 'find /website/theme/kordra /website/dev /website/tests -type f -name "*.php" -print0 | xargs -0 -n1 php -l'
