module.exports = `
<template>
	<div class='osim3' id='osim33'>
		name: {{name}}
		day: {{day}}
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
