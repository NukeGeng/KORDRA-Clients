<?php
/**
 * Change a seeded page's core title and body to verify WordPress renders both.
 *
 * @package Kordra
 */

$pages = array(
	'features'      => 'Features in development',
	'documentation' => 'Documentation',
	'releases'      => 'Releases',
);

foreach ( $pages as $slug => $title ) {
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( ! $page ) {
		WP_CLI::error( 'A public page was not seeded: ' . $slug );
	}

	$result = wp_update_post(
		array(
			'ID'           => $page->ID,
			'post_title'   => $title . ' - editorial title check',
			'post_content' => '<!-- wp:paragraph --><p>EDITOR BODY CHECK ' . strtoupper( $slug ) . '</p><!-- /wp:paragraph -->',
		),
		true
	);

	if ( is_wp_error( $result ) ) {
		WP_CLI::error( $result->get_error_message() );
	}
}
