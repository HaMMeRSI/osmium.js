module.exports = `
<template>
	import osim7 from './osim7-simpleModifier.js';
	<div class='osim6' id='osim66'>
		local modifier: {{local}}
		<osim if="{{bool}} === true">
			<osim7></osim7>
		</osim>
	</div>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.local = osim6!;
		modifiers.bool = true;
	}
</script>`;
