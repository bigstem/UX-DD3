$(function() {
	DD3.PadigreeTree({
		element:"chart1",
		data: "../data/padigree.json",
		height: 900,
		title: "name",
		subMenu:["Total Offered", "Sub Menu Transferred", "Terminated", "Agent"],
		width: 1300,
		wildMenu: { 0 : "Unique Offered", 2 : "Unique Terminated", 3: "Unique Agent"},
		valueFormatter: ",.3s",
		wildFormatter: ",.3s"
	});
});

		