$(function() {
    DD3.Zoomable_Circle({
        element: "zoom_circle",
		stroke : "rgb(31, 119, 180)",
		key: "name",
		property : 1,
		data: "../data/yepme.json", 
		// data: "http://127.0.0.1:9200/dd3/examples?url="+document.URL,  //"../data/circle_packing.json",
		color:["rgb(31, 119, 180);", "rgb(31, 119, 180);"], //["white", "rgb(31, 119, 180);"],   //"rgb(31, 119, 180);"
		bodyColor: "#FFF",
		diameter: 1000
    });
});