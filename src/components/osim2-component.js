module.exports = `
<template>
	import osim3 from './osim3-component.js';
	<div class='osm2' id='osim22' value="{{day}}">
		name: {{name}}
		day: {{day}}
		subDomain: {{sub-domain}}
		proper: {{proper}}
		<osim3 name="{{banana}}" day="89"></osim3>
		<input value="{{name}}" @change="{{osim2UpdateFunction}}"/>
	</div>
</template>

<script>
	export default (modifiers, props) => {
		modifiers['osim2UpdateFunction']((e) => {
			modifiers['banana'](e.target.value);
		});

		props((props) => {
			modifiers['proper'](props.name + ' ' + props['sub-domain']);
		});
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
