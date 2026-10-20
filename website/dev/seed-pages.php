<?php
/**
 * Seed the starter copy for public pages without replacing editorial changes.
 *
 * @package Kordra
 */

$pages = array(
	array(
		'slug'         => 'features',
		'title'        => 'Features in development',
		'legacy_title' => 'Features',
		'pattern'      => 'kordra/features-page',
	),
	array(
		'slug'         => 'documentation',
		'title'        => 'Documentation',
		'legacy_title' => 'Documentation',
		'pattern'      => 'kordra/documentation-page',
	),
	array(
		'slug'         => 'releases',
		'title'        => 'Releases',
		'legacy_title' => 'Releases',
		'pattern'      => 'kordra/releases-page',
	),
);

$registry = WP_Block_Patterns_Registry::get_instance();

foreach ( $pages as $page_config ) {
	$page = get_page_by_path( $page_config['slug'], OBJECT, 'page' );
	if ( $page && '1' === get_post_meta( $page->ID, '_kordra_website_seeded', true ) ) {
		continue;
	}
	if ( $page && '' !== trim( $page->post_content ) ) {
		update_post_meta( $page->ID, '_kordra_website_seeded', '1' );
		continue;
	}

	$pattern = $registry->get_registered( $page_config['pattern'] );
	if ( ! is_array( $pattern ) || empty( $pattern['content'] ) ) {
		WP_CLI::error( 'The starter pattern is unavailable: ' . $page_config['pattern'] );
	}

	$post_data = array(
		'post_type'    => 'page',
		'post_status'  => $page ? $page->post_status : 'publish',
		'post_name'    => $page_config['slug'],
		'post_content' => $pattern['content'],
	);

	if ( $page ) {
		$post_data['ID'] = $page->ID;
		if ( $page_config['legacy_title'] === $page->post_title ) {
			$post_data['post_title'] = $page_config['title'];
		}
	} else {
		$post_data['post_title'] = $page_config['title'];
	}

	$result = wp_insert_post( $post_data, true );
	if ( is_wp_error( $result ) ) {
		WP_CLI::error( $result->get_error_message() );
	}
	update_post_meta( $result, '_kordra_website_seeded', '1' );
}
