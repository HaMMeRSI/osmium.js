export default `
<template>
	<div class='wefwef fwefw' id='wefwef'>
		3      3
	</div>
</template>

<script>
	export default (modifires, props) => {

	}
</script>`;

`
h('div.wefwef.fwefw#wefwef', [
	h('input', [['type', 'text'],['value', 'ewf']]),
	h('span', ['3   3']),
	h('div', [
		h('button', [['value', '4']], ['hey'])
	])
])
`;
