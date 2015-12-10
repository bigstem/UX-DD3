DD3.Grouped_Histogram({
	element: "grouped_bars",
	data: "../data/ts_data.json", //"http://127.0.0.1:9200/dd3/examples?url="+document.URL,
	yAxisLabel: "IVR Values",
	xCategory: "xCategories",
	legend_width: 150,
	color: ["red", "blue", "green", "violet", "purple", "cyan"],	
	grid: true
});