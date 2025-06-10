<?php

namespace ProcessWire;

$title = $page->get('title');
$projects = $pages->find("template=project");
$gallery = array();

foreach ($projects as $project) {
	if ($project->gallery) {
		foreach ($project->gallery as $image) {
			array_push($gallery, array(
				$project->name => $image->url
			));
		}
	}
}
?>

<div id="content">
	<div class="projects ">
		<div id="canvasForHTML" class="canvas-container"></div>
		<?php
		$i = 0;
		foreach ($projects as $project) :
			$attribut = "";
			if ($i % 2 == 0) {
				$attribut = "left";
			} else {
				$attribut = "right";
			}
		?>
			<div class='project <?= $attribut ?>' id='<?= $project->name ?>'>
				<?php foreach($project->content as $c) :?>
					<p><?= $c->title ?></p>
					
				<?php  endforeach; ?>	
				<p><?= $i ?></p>
			</div>

		<?php $i++;
		endforeach; ?>

	</div>
	<div class="scene">
		<?php
		$totalProjects = count($projects);
		$i = 0;
		foreach ($projects as $project) :
			$i++;
			$class = ($i === $totalProjects) ? ' class="focus"' : '';
		?>
			<a href="#<?= $project->url ?>" <?= $class ?>><?= $project->title?></a>
		<?php endforeach; ?>

	</div>
	<span id="back"></span>
	<script>
		const data = window.PRELOAD_IMAGES = <?= json_encode($gallery, JSON_UNESCAPED_SLASHES); ?>;
		  const filterData = Object.keys(data);
		const sortedData = filterData.reduce((acc, key) => {
			const entry = data[key];
			const projectName = Object.keys(entry)[0];
			const imagePath = entry[projectName];

			if (!acc[projectName]) {
			acc[projectName] = [];
			}
			acc[projectName].push(imagePath);

			return acc;
		}, {});

		// Convertir l'objet en tableau pour pouvoir utiliser forEach
		const sortedDataArray = Object.entries(sortedData).map(([projectName, images]) => ({
			projectName: projectName,
			images: images
		}));
		ready({data, sortedData, sortedDataArray});
	</script>
</div>