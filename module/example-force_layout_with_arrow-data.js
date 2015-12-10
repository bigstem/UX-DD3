DD3.Force_Layout({
	element: "force",
	height : 600,
	arrow : true,
	data: "../data/force.json", 	//"http://127.0.0.1:9200/dd3/examples?url="+document.URL, 
	charge: -150,
	linkDistance: 60,
	nodeRadius: 9,
	//color: ["red", "blue", "green", "violet", "purple", "cyan"]
});