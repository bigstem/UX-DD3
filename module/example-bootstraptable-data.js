DD3.Table({
			element: "bootstrapTable",
			method: "GET",
			data: "../data/tabledata1.json",  //"http://127.0.0.1:9200/dd3/examples?url="+document.URL,		
			contentType : "application/json",
			dataType: "application/json",
			columns : [
						{
							field: "id",
							title: "ID",
							align: "center",
							valign: "center",
							sortable: true
						},
						{
							field: "name",
							title: "Name",
							align: "center",
							valign: "center",
							sortable: true
						},
						{
							field: "price",
							title: "Price",
							align: "center",
							valign: "center",
							sortable: true
						}
						
					  ]
		});
