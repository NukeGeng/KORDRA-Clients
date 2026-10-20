#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
theme_dir="$script_dir/../theme/kordra"

if ! docker info >/dev/null 2>&1; then
	printf '%s\n' 'Docker is not running. Start Docker Desktop, then rerun PHP lint.' >&2
	exit 1
fi

docker run --rm \
	--entrypoint sh \
	-v "$theme_dir:/theme:ro" \
	wordpress:7.1.3-php8.3-apache \
	-ec 'find /theme -type f -name "*.php" -exec php -l {} \;'
