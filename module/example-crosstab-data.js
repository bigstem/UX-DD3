$(function() {
    DD3.CrossTab({
		element : "Cross",
		data: "../data/CrossTab.json",
		columns: ["Name", "Father Name", "Roll-No."],
		keys: ["name", "father_name", "roll-no."]		
	});
});