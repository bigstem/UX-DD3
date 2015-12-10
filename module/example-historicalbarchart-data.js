
DD3.HistoricalBarchart({
	element: "HistoricalBarChart",
	data: "../data/historicalbarchart.json",
	height: 500,
	group: ['Value 1','Value 2','Value 3'],
	colors: ['#ff7f0e','#2ca02c','#caf7b5'],
	xkey: "Time (s)",
	ykey: "Voltage (v)",
	max_boxWidth: 100,
	interactiveTip: true
});

