DD3.MultiChart({
	element: "MultiChart",
	data: "../data/multi.json",
	height: 500,
	group : ["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eight","Ninth"], // here 9 different values are used in json data set
	type : ["area","area","line","line","scatter","scatter","bar","bar","bar"], // 3 types - area, line, scatter and bar
	yAxis : [1,1,1,2,1,2,2,2,2],    // 1 for left and 2 for right
	xformater: ",f",
	yformater1: ",.1f",			// for left y Axis
	yformater2: ",.2f",			// for left y Axis
});

