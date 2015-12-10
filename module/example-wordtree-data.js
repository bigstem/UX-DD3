$(function() {
    DD3.WordTree({     
        element: "vis",
		data: "../data/wordtree.txt",   //http://127.0.0.1:9200/dd3/examples?url="+document.URL, //"../data/loanWB20150115.json"
		startWord: "our",
		reverse: 0,
		phraseLine: 0		
    });
});