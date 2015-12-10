# UX-DD3
Data Science Visualization Product

Here we provide the details on the open source product UX-DD3 . The idea is to share our efforts for anyone to download and start using it.

In order to make  any chart, for instance , Stackable Chart, or Visualization Inferences, for example, SunBurst Chart, today one has to explore D3 library cut and paste code and start debugging it. Needless to say, this enormously increase dashboard development time. We claim that using our product is so convenient compared to D3 JS and can be used out of the box. Furthermore, D3 JS had some limitations for which we had to look into NVD JS. Essentially, our product is a wrap of D3 JS and NVD JS however, our key innovation is in simplying usage and the construct to an extent that designing a complex dashboard take less time. In addition, the reason for not including High Charts is that D3 and NVD have most of the construct needed to design a proper visualization. 

The prime philosophy behind developing our own product was the chaos a developer had to go through while designing a Dashboard using D3 JS. Apparently, we found numerous problems in using D3 JS in a production environment such as code duplication , names clashes and multiple construct formats and lack of common API structure, these factors envisioned us to create UX DD3.

The architecture of UX DD3 is very simple - at core it has DD3 JS or NVD JS code wrapped around friendly API. Furthermore, it supports three different mechanisms to extract data for display: 
firstly, local json file ( ideal for Windows based and offline reporting. )
Secondly, remote json file ( complete server path from where data needs to be pulled from.)
Lastly, Ajax API ( this primarily works for streaming cases, where the data is pulled by a web service before the construct is displayed. ) 


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
	