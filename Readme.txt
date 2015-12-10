/*---------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------- DD3 Library Documentation ---------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------------------------------------------------*/


	For use this API =>
	
	a). you firstly include the basic js file in this order
		jquery.min.js 
		d3.v3.min.js
		DD3.js.
	b). After, you make your own Script File and include here
		example-abc-data.js


/*----------------------------------------------------------- Some Important Points------------------------------------------------------------------------------*/
1. For Single Module :	Area, Histogram, Pie, Donut
	xAxis and yAxis keys are internally fix. you can pass here a flat JSON 
	You can use these keys in data.
	for xAxis	: "key"
	for yAxis	: "value"
	
2. For Mutiple Categories Module :	Grouped Histogram, Line, Scatterplot
	your Flat Json is converted internally their own structure.
	but here you need to specify "xCategories" for xAxis.
	
3. 
	