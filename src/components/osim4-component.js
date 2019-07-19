module.exports = `
<template>
	toggle: {{isToggleOn}}
	<div>
		What is on: <br/>
		<osim if="{{isToggleOn}} === true">
			<br/>
			Hello if statement! :)<br/>
			adding {{batata}} here
			<br/>
		</osim>
		<button @click="{{toggleText}}">Toggle button</button>
	</div>
</template>

<script>
export default (modifiers, props) => {
	modifiers.toggleText((e) => {
		modifiers.isToggleOn(!modifiers.isToggleOn());
	})
}
</script>`;
/* <osim if="{{batata}} === true && {{isToggleOn}} === true">
				testing batata..
			</osim>
*/
