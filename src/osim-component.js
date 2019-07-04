module.exports = `
<template>
	import osim from './osim2-component.js';
	import osim2 from './osim2-component.js';

	<osim name="\${name}" day="3"/>
	<osim2 name="\${name}" day="3"/>
</template>

<script>
	export default (modifires, props) => {

	}
</script>`;

/*
() => {
	return c(osim, [[name, '${name}'], [day, 3]], [])
}
___________
() => { 
	return h('div', [["class", ".."], ["id", ".."]], [
		t(name()),
		t(day())
	])
}
*/
