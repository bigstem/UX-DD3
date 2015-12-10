DD3.BubbleAxisChart({
	element: "bubble",
	data: "../data/BubbleAxis1.json",
	height: 400,
	width: 800,
	//labelX: "X Label",
	textRotate: "-45",
	timeformater: "%m/%d/%Y",
	labelY: "Y Label",
	xKey: "date",
	yKey: "y",
	group: "c",
	value: "duration",
	maxSize: 10,
	minSize: 3
});
