		DD3.LineWithArea({
			element: "lines",
			group: ["Total CDR", "Total Unique Subs", "Total Transfer", "Total Terminate", "Total Average Calls"],
			data: "../data/LineWithArea1.json",
			color:["red", "blue", "green", "violet", "purple", "cyan"],
			lebelY: "Call Records",
			labelX: "Time Stamp",
			yFormater: ",.3s",
			area : 	[1, 0, 1, 1, 0],		//["Total Call Transfered", "Total Call Terminated Subs"],
			dashed : [0, 1, 1, 0, 0],					//["Total CDR", "Total Call Terminated Subs"],
			areaOpacity: 0.4,
			//dateTime: true,
			height: 500,
			interactiveTip: true
		});
