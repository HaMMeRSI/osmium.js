module.exports = `
<template>
	<pre>
		miniday: {{mimi}}
		name: {{name}}
		day: {{day}}
	</pre>
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
