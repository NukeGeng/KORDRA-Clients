<?php
/**
 * Title: KORDRA home — original orbital banner
 * Slug: kordra/home-hero
 * Categories: kordra
 * Inserter: no
 */

$banner_webp = esc_url( get_theme_file_uri( 'assets/images/banner.webp' ) );
$banner_png  = esc_url( get_theme_file_uri( 'assets/images/banner.png' ) );
?>
<!-- wp:html -->
<section class="kordra-art-hero" aria-label="KORDRA brand visual">
	<div class="kordra-art-hero__image">
		<picture>
			<source srcset="<?php echo $banner_webp; ?>" type="image/webp" />
			<img src="<?php echo $banner_png; ?>" alt="KORDRA wordmark between two orbital network structures" width="1672" height="941" fetchpriority="high" decoding="async" />
		</picture>
	</div>
	<p class="kordra-art-hero__edge kordra-art-hero__edge--left" aria-hidden="true">RELEASE CONTROL / OPEN DEVELOPMENT</p>
	<p class="kordra-art-hero__edge kordra-art-hero__edge--right" aria-hidden="true">BUILT TO CONTROL THE HANDOFF</p>
	<div class="kordra-art-hero__status">
		<p><span class="kordra-status-dot" aria-hidden="true"></span> FOUNDATION · IN DEVELOPMENT</p>
		<p>PRODUCT DIRECTION</p>
	</div>
</section>
<!-- /wp:html -->
