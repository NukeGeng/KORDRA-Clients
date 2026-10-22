#!/usr/bin/env sh
set -eu

delete_core_default() {
	post_type=$1
	slug=$2
	post_id=$(wp post list --post_type="$post_type" --name="$slug" --field=ID | head -n 1)
	if [ -n "$post_id" ]; then
		wp post delete "$post_id" --force
	fi
}

if ! wp core is-installed; then
	wp core install \
		--url="$LOCAL_SITE_URL" \
		--title="KORDRA" \
		--admin_user="$WORDPRESS_ADMIN_USER" \
		--admin_password="$WORDPRESS_ADMIN_PASSWORD" \
		--admin_email="$WORDPRESS_ADMIN_EMAIL" \
		--skip-email
	delete_core_default post hello-world
	delete_core_default page sample-page
fi

wp option update blogname "KORDRA"
wp option update blogdescription "One Control Plane. Any Infrastructure."
wp theme activate kordra
wp option update permalink_structure "/%postname%/"
wp rewrite flush --hard

home_id=$(wp post list --post_type=page --name=home --field=ID | head -n 1)
if [ -z "$home_id" ]; then
	home_id=$(wp post create --post_type=page --post_status=publish --post_title="Home" --post_name="home" --post_content="" --porcelain)
fi
wp option update show_on_front page
wp option update page_on_front "$home_id"
wp option update page_for_posts 0

wp eval-file /seed-pages.php

if ! wp term get category updates --by=slug --field=term_id >/dev/null 2>&1; then
	wp term create category Updates --slug=updates
fi
