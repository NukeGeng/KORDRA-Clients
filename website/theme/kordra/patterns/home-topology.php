<?php
/**
 * Title: KORDRA home — conceptual orbital topology
 * Slug: kordra/home-topology
 * Categories: kordra
 * Inserter: no
 */
?>
<!-- wp:html -->
<section class="kordra-section kordra-topology" aria-labelledby="kordra-topology-title">
	<div class="kordra-section__inner kordra-topology__inner">
		<div class="kordra-topology__copy">
			<h2 id="kordra-topology-title">WORK WITH<br />WHAT EXISTS.</h2>
			<p>KORDRA is designed to coordinate release intent across existing delivery systems—not rebuild CI, infrastructure controllers or observability from scratch.</p>
			<p class="kordra-text-link"><a href="https://github.com/NukeGeng/KORDRA/blob/main/docs/product/roadmap.md" target="_blank" rel="noopener noreferrer">Read the roadmap <span aria-hidden="true">↗</span></a></p>
		</div>
		<figure class="kordra-orbit-map">
			<svg viewBox="0 0 580 390" role="img" aria-labelledby="kordra-orbit-title kordra-orbit-description" xmlns="http://www.w3.org/2000/svg">
				<title id="kordra-orbit-title">Conceptual KORDRA control topology</title>
				<desc id="kordra-orbit-description">Geometric relationships between a build, policy, recovery and an infrastructure target around a central KORDRA control plane.</desc>
				<defs><pattern id="kordra-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#353a40" stroke-width=".45" /></pattern></defs>
				<rect width="580" height="390" fill="url(#kordra-grid)" opacity=".7" />
				<circle cx="302" cy="190" r="149" stroke="#858c95" stroke-opacity=".45" fill="none" stroke-dasharray="3 7" />
				<circle cx="302" cy="190" r="112" stroke="#707983" stroke-opacity=".38" fill="none" />
				<circle cx="302" cy="190" r="69" stroke="#c3cbd1" stroke-opacity=".65" fill="none" />
				<path d="M54 115 302 190 518 89M78 297 302 190 519 317" stroke="#828990" stroke-width="1" stroke-opacity=".68" fill="none" />
				<path d="M169 76 302 190 416 325" stroke="#d6d7d5" stroke-width="1" stroke-opacity=".36" stroke-dasharray="5 7" fill="none" />
				<circle cx="302" cy="190" r="30" fill="#0e1114" stroke="#f2f1ec" stroke-width="1.7" />
				<path d="M291 175v30m0-15h10l11-16m-11 16 11 15" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none" />
				<g fill="#e7e8e4"><circle cx="54" cy="115" r="5.4" /><circle cx="518" cy="89" r="6" /><circle cx="78" cy="297" r="5.4" /><circle cx="519" cy="317" r="5.4" /><circle cx="302" cy="41" r="3.5" /><circle cx="153" cy="190" r="3.5" /></g>
				<g class="kordra-orbit-map__labels"><text x="42" y="99">BUILD</text><text x="468" y="73">TARGET</text><text x="43" y="327">POLICY</text><text x="454" y="343">RECOVER</text><text x="266" y="242">CONTROL</text></g>
			</svg>
			<figcaption>CONCEPTUAL CONTROL TOPOLOGY · NOT LIVE TELEMETRY</figcaption>
		</figure>
	</div>
</section>
<!-- /wp:html -->
