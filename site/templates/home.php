<?php

namespace ProcessWire;

$title = $page->get('title');
$projects = $pages->find("template=project");
$gallery = array();

foreach ($projects as $project) {
	if ($project->gallery) {
		foreach ($project->gallery as $image) {
			// Redimensionner l'image à une largeur max de 1200px (ou la taille souhaitée)
			$resized = $image->size(920);
			array_push($gallery, array(
				$project->name => $resized->url
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
				<div class="images_preview">
					<?php foreach ($project->gallery as $img) : ?>
						<img class="image_content" src="<?=  $img->size(920)->url ?>" alt="">
					<?php endforeach; ?>
				</div>

				<div class="flat-content">
					<div class="first-page">
						<div class="p_header">
							<p class="p_title">[<?= $project->title ?>]</p>
							<p class="p_description"><?= $project->textarea ?></p>
						</div>
						<div class="specs p_tab">
							<?php foreach ($project->content as $c) : ?>
								<div><span class="label"><?= $c->title ?></span><span class="dots"></span></div>
							<?php endforeach; ?>
						</div>
						<div class="specs p_val">
							<?php foreach ($project->content as $c) : ?>
								<div><span class="label"><?= $c->text ?></span><span class="dots"></span></div>
							<?php endforeach; ?>

						</div>
						<div class=" p_images">
							<?php foreach ($project->gallery as $img) : ?>
								<img class="int_preview image_content" src="<?= $img->url ?>" alt="">
							<?php endforeach; ?>

						</div>
					</div>
					<div class="image_content p_video">
						<span class="dots"></span>
						<video class="v_player" src="<?= $project->video->url ?>" loop muted playsinline></video>
						<a class="v_player">
							<div class="controls">
								<div class="playControls">
									<button class="playToggle" data-role="pause" data-state="active">◻︎</button>
									<button class="playToggle" data-role="play" data-state="inactive">▷</button>
								</div>
								<span class="dots"></span>
								<div class="expandControls">
									<button class="expandToggle" data-state="inactive">↗</button>
									<button class="closeExpand" data-state="active">✕</button>
								</div>
							</div>
						</a>

					</div>

				</div>
			</div>

		<?php $i++;
		endforeach; ?>

	</div>
	<span id="back"></span>
	<div class="scene">
		<?php
		// $totalProjects = count($projects);
		// $i = 0;
		// foreach ($projects as $project) :
		// 	$i++;
		// 	$class = ($i === $totalProjects) ? ' class=""' : '';
		?>
		<a href="#<?= $project->url ?>" class="ptitle l-project"><?= $project->title ?></a>
		<a href="#<?= $project->url ?>" class="ptitle r-project"><?= $project->title ?></a>
		<?php
		// endforeach; 
		?>

	</div>
	
	<script>
		<?php
		$gallery_resized = array();
		foreach ($projects as $project) {
			if ($project->gallery) {
				foreach ($project->gallery as $image) {
					// Resize to max width of 1200px while maintaining aspect ratio
					$resized = $image->size(920);
					array_push($gallery_resized, array(
						$project->name => $resized->url
					));
				}
			}
		}
		?>
		const data = window.PRELOAD_IMAGES = <?= json_encode($gallery_resized, JSON_UNESCAPED_SLASHES); ?>;
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
		// Create an array of image arrays with project metadata
		let projectImages = [];
		Object.entries(sortedData).forEach(([projectName, urls], index) => {
			projectImages.push({
				id: index,
				name: projectName,
				position: index % 2 === 0 ? 'left' : 'right',
				images: urls
			});
		});





		const sortedDataArray = Object.entries(sortedData).map(([projectName, images]) => ({
			projectName: projectName,
			images: images
		}));
		ready({
			data,
			sortedData,
			sortedDataArray,
			projectImages
		});
	</script>
</div>