//chrome.extension.onRequest.addListener(function(title,sender,sendResponse) {
chrome.runtime.onMessage.addListener(function(title,sender,sendResponse) {
		console.log(title);
		//if (title.length > 0)
			chrome.pageAction.show(sender.tab.id);
		//sendResponse();
		}
		);

