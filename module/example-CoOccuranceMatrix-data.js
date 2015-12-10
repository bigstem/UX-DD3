var width = $("#xyz").parent().width();
DD3.CoOccuranceMatrix({
		element: "xyz",
		sorting: "name",
		width: width,
		height: width,
		// margin_top: 120,
		// margin_left: 120,
		margin : 50,
		data: "../data/CoOccuranceExpr.json",
		color:["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
		updateSorting: "#choose",
		tipTitle: "Count"

	});