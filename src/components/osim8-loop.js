module.exports = `
<template>
	start loop:<br/>
	<osim for="item in {{items}}" key="item.uid">
		current {{name}} item: {{item.a}}<br/>
	</osim>
	<osim if="{{bool}} === true">
		ello from if
	</osim>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.items = [
			{
				uid:11,
				a:1,
				b:2
			}, 
			{
				uid:13,
				a:3,
				d:4
			}, 
			{
				uid:12,
				a:5
			}	
		];
		modifiers.bool = false;
		modifiers.name = "z";

		setTimeout(()=>{
			modifiers.items[0].a = 456;
		},3500);
	}
</script>`;
