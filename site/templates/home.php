<?php

namespace ProcessWire;

// Template file for “home” template used by the homepage
// ------------------------------------------------------
// The #content div in this file will replace the #content div in _main.php
// when the Markup Regions feature is enabled, as it is by default. 
// You can also append to (or prepend to) the #content div, and much more. 
// See the Markup Regions documentation:
// https://processwire.com/docs/front-end/output/markup-regions/
$title = $page->get('title');
$projects = $pages->find("template=project");
?>

<div id="content">
	<div class="projects ">
		<div id="canvasForHTML" class="canvas-container"></div>
		<?php
		$index = 0;
		foreach ($projects as $project) :
			$attribut = "";
			if ($index % 2 == 0) {
				$attribut = "left";
			} else {
				$attribut = "right";
			}
		?>
			<div class='project <?= $attribut ?>' id='t<?= $index ?>'>
				<p><?= $index ?></p>
			</div>

		<?php $index++;
		endforeach; ?>
		<!-- <div class="project" id="t1">
			<p>1</p>
		</div>
		<div class="project" id="t2">
			<p>2</p>
		</div>
		<div class="project" id="t3">
			<p>3</p>
		</div>
		<div class="project" id="t4">
			<p>4</p>
		</div>
		<div class="project" id="t5">
			<p>5</p>
		</div>
		<div class="project left" id="t6">
			<p>6</p>
		</div>
		<div class="project right " id="t7">
			<p>7</p>
		</div> -->

	</div>
	<div class="scene">
		<?php
		foreach ($projects as $project) :
			$attribut = "";

		?>
			<a href="#<?= $project->url ?>"><?= $project->title ?></a>
		<?php endforeach; ?>

		<!-- <a href="#Volet_0">Volet 0</a>
		<a href="#Volet_1">Volet 1</a>
		<a href="#Volet_2">Volet 2</a>
		<a href="#Volet_3">Volet 3</a>
		<a href="#Volet_4">Volet 4</a>
		<a href="#Volet_5">Volet 5</a>
		<a href="#Volet_6">Volet 6</a>
		<a class="focus" href="#Volet_7">Volet 7</a> -->
	</div>
</div>