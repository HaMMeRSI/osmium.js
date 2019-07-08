module.exports = `
<template>
	import osim3 from './osim3-component.js';
	<div class='osm2' id='osim22' value="{{day}}">
		name: {{name}}
		day: {{day}}
		
		<osim3 name="{{banana}}" day="89"></osim3>
		<input value="{{name}}"/>
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
