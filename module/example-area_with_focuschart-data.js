DD3.AreaWithFocusChart({
	element: "LineWithFocusChart",
	data: "../data/areawithfocus.json",
	height: 500,
	min:0,
	max:80,
	xLabel: "Streams",
	areaKey:["Total Shipment", "Delivered Shipment", "Undelivered Shipment"],
	color: ["#637939", "#d62728", "#3182bd", "#fd8d3c", "#31a354", "#756bb1", "#6baed6", "#e6550d", "#8c6d31", "#bd9e39", "#843c39", "#a55194"],
	onLoadFocus: true
});

