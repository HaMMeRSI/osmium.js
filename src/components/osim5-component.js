module.exports = `
<template>
	<div class='osim5' id='osim55' name="{{person.name}}">
		name: {{person.name}}
		age: {{person.age}}
		randomness: {{r.baba}}
	</div>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.r = {
			baba: '23f'
		};
		setTimeout(()=> {
			modifiers.r.baba = '43';
		}, 1000)
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
