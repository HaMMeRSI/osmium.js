module.exports = `
<template>
	first name: {{person.name.first}}<br/>
	subaba: {{subaba}}
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
