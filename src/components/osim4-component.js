module.exports = `
<template>
	import osim2 from './osim2-component.js';
	import osim7 from './osim7-simpleModifier.js';
	toggle: {{isToggleOn}}
	<div>
		What is on: <br/>
		<osim if="{{isToggleOn}} === true">
			<br/>
			Hello if statement! :)<br/>
			adding {{batata}} here
			<br/>
			<div><osim2 name="{{name}}" sub-domain="{{minarc}}" day="3"></osim2></div>	
			<br/>
		</osim>
		sper
		<osim if="{{isToggleOn}} === false">
			<br/>
			Hello if statement 2! :)<br/>
			adding {{batata}} again
			<br/>
		</osim>
		<button @click="{{toggleText}}">Toggle button</button>
	</div>
</template>

<script>
export default (modifiers, props) => {
	modifiers.isToggleOn = false;
	modifiers.toggleText = (e) => {
		modifiers.isToggleOn = !modifiers.isToggleOn;
	};
	modifiers.minarc = 'osim4 minarc';
}
</script>`;
/* <osim if="{{batata}} === true && {{isToggleOn}} === true">
				testing batata..
			</osim>
*/
