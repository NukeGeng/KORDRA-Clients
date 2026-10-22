<?php
/**
 * KORDRA theme setup.
 *
 * @package Kordra
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_setup_theme',
	static function (): void {
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'editor-styles' );
		add_editor_style( 'assets/css/site.css' );
	}
);

add_action(
	'wp_enqueue_scripts',
	static function (): void {
		$theme = wp_get_theme();
		wp_enqueue_style(
			'kordra-site',
			get_theme_file_uri( 'assets/css/site.css' ),
			array(),
			$theme->get( 'Version' )
		);
		wp_enqueue_script(
			'kordra-gsap',
			get_theme_file_uri( 'assets/js/vendor/gsap.min.js' ),
			array(),
			'3.15.0',
			array( 'in_footer' => true, 'strategy' => 'defer' )
		);
		wp_enqueue_script(
			'kordra-mobile-navigation',
			get_theme_file_uri( 'assets/js/mobile-navigation.js' ),
			array( 'kordra-gsap' ),
			$theme->get( 'Version' ),
			array( 'in_footer' => true, 'strategy' => 'defer' )
		);
		if ( is_front_page() ) {
			wp_enqueue_script(
				'kordra-reveal',
				get_theme_file_uri( 'assets/js/reveal.js' ),
				array( 'kordra-gsap' ),
				$theme->get( 'Version' ),
				array( 'in_footer' => true, 'strategy' => 'defer' )
			);
		}
	}
);

add_action(
	'init',
	static function (): void {
		register_block_pattern_category(
			'kordra',
			array( 'label' => __( 'KORDRA', 'kordra' ) )
		);
	}
);
