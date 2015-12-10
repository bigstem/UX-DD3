		DD3.Heatmap({
			element: "heatmap",
			data: "../data/heat.json",
			height: 500,
			blockSize: 24,
			margin_top:50,
			margin_right:20,
			margin_bottom:100,
			margin_left: 50,
			bucket: 10,
			color:["rgb(244, 0, 37)","rgb(208, 80, 99)","rgba(240, 13, 56, 0.73)","rgba(240, 13, 56, 0.27)","rgb(137, 204, 231)","#1d91c0","#225ea8","#253494","rgb(17, 55, 161)", "rgb(9, 36, 110)"],
			rowLabel:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			columnLabel:["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h", "24h"],
			xkey: "day",
			ykey: "hour",
			value: "value"			
		});
