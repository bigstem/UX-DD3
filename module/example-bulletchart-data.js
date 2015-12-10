$(function() {
   	DD3.BulletChart({
		element: "chart",
		height: 60,
		data: "../data/bullet.json",
		title: "title",
		subtitle: "subtitle",
		measureLabels: ["measure"],
		markerLabels: ["forecast"]
	});
});