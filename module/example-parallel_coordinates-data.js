DD3.ParallelCoordinates({
	element: "Parallel_Coordinates",
	data: "../data/Parallel.json",				//ParallelCoordinates.json",
	dimensionName: ["economy (mpg)", "cylinders", "displacement (cc)", "power (hp)", "weight (lb)", "peak (k)", "0-60 mph (s)", "year"],
	dimensionFormat: ["0.5f", "e", "g", "d", "", "%", "p"],
	height: 500
	//color: ["red", "yellow", "green", "pink", "purple", "orange", "skyblue", "grey", "brown", "lemon"]
})