<?php

namespace ProcessWire;



/** @var Page $page */
/** @var Pages $pages */
/** @var Config $config */

$home = $pages->get('/');
/** @var HomePage $home */

?>
<!DOCTYPE html>
<html lang="fr">

<head id="html-head">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title><?php echo $page->title; ?></title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@112.5,100&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="<?php echo $config->urls->templates; ?>styles/main.css" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.js"></script>
	<script src="<?php echo $config->urls->templates; ?>scripts/addScreenPositionFunction.js"></script>
	<script src="<?php echo $config->urls->templates; ?>scripts/canvas.js"></script>
	<script src="<?php echo $config->urls->templates; ?>scripts/main.js"></script>
	<script src="<?php echo $config->urls->templates; ?>scripts/volet.js"></script>
</head>

<body id="html-body">

	<div id="content">
		Default content
	</div>



</body>

</html>