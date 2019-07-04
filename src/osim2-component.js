module.exports = `
<template>
	import osim3 from './osim3-component.js';
	<div class='osm2' id='osim22'>
		\${name}
		\${day}
		
		<osim3 name="\${name}" day="3"/>
	</div>
</template>

<script>
	export default (modifiers, props) => {

	}
</script>`;

/*
(staticProps) => {
	return h('div', [["class", ".."], ["id", ".."]], [
		t(name()),
		t(day())
	])
}


modifiers: {
	name: () => {},
	day: () => {}
}
*/
