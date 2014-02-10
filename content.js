//var title = document.getElementsByTagName("title");
var title = {"title":"lmy"}

//chrome.extension.sendRequest(title);

chrome.runtime.sendMessage(title,function(response) {
			console.log(response.farewell);
		});
