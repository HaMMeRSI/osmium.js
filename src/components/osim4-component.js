module.exports = `
<template>
	toggle: {{isToggleOn}}
	<div>
		<osim if="{{isToggleOn}} === true">
			Hello if statement! :)<br/>
			adding {{batata}} here
		</osim>
		<button @click="{{toggleText}}">Toggle button</button>
	</div>
</template>

<script>
(modifiers, props) => {
	export default modifiers.toggleText((e) => {
		modifiers.isToggleOn(!modifiers.isToggleOn());
	})
}
</script>`;
/* <osim if="{{batata}} === true && {{isToggleOn}} === true">
				testing batata..
			</osim>
*/
