module.exports = `
<template>
	import osim from './osim2-component';

	<div class='wefwef fwefw' id='wefwef'>
		<input type="text" value="ewf"/>
		<span>3      3</span>
		<div>
			<button value="4">hey</button>
		</div>
		<osim name="wef" day="3"/>
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
