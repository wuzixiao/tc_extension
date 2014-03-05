//var title = document.getElementsByTagName("title");
var title = {"title":"lmy"}

var block_element = ['P', 'ADDRESS', 'DIV', 'TABLE', 'DD', 'H1','H2','H3','H4','H5','H6',
			  'HEADER','PRE','TFOOT','SECTION','OUTPUT','BLOCKQUOTE','ARTICLE','FORM',
			  'FIGURE','FIGCAPTION','DL','FIELDSET','HGROUP','HR','UL','VIDEO','AUDIO',
			  'NOSCRIPT'];

var block_element2 = ['P', 'DIV', 'TABLE', 'DD', 
			  'PRE','SECTION','OUTPUT','BLOCKQUOTE','ARTICLE','FORM',
			  'FIGURE','FIGCAPTION','DL','FIELDSET','HGROUP','HR','UL',
			  'NOSCRIPT'];


//chrome.extension.sendRequest(title);
//var len = document.getElementsByClassName("statusContent")[0].innerText.length;

//var text = document.getElementsByClassName("articalContent")[0].innerText;

//function postorder_walk(node) {
//}

//chrome.runtime.sendMessage(text,function(response) {
//			console.log(response.farewell);
//		});
function node_height(n) {
	if(n.offsetHeight > 0)
		return n.offsetHeight;
	else{
		if(!n.offsetParent)
			return 0;
		else
			return n.offsetParent.offsetHeight;
	}
}
/*
function get_similar_with_top(n, topRank) {
	return get_node_rank(n) / topRank * 100;
}



function check_same_parent(n1, n2) {
	if(n1.parentElement == n2.parentElement) {
		return true;
	}
	return false;
}
*/


function walk(n) {
	n.textCount = n.innerText.length;
	n.anchorCount = 0;
	n.anchorTextCount = 0;
	n.childrenCount = 0;
	n.textInChildrenCount = 0;
	n.anchorTextInChildrenCount = 0;
	n.layout = 0;
	
	for(var i = 0; i < n.children.length; i++) { 	
		//if(n.children[i].nodeType == 1 && n.children[i].offsetHeight > 0){
		if(n.children[i].nodeType == 1 
		&& node_height(n.children[i]) > 0) {
			//n.children[i].visionParent = n;
			walk(n.children[i]);
		}	
	}	
	if(n.tagName == 'A') {
		console.log(n.innerText);
		n.parentElement.anchorTextCount += n.innerText.length;
		n.parentElement.anchorCount += 1;
		n.parentElement.childrenCount += n.childrenCount + 1; 
		n.parentElement.anchorTextInChildrenCount += n.innerText.length;
	}
	else if(block_element.indexOf(n.tagName) >= 0) {
		//block element
		n.parentElement.childrenCount += n.childrenCount + 1;
		n.parentElement.anchorCount += n.anchorCount;
		n.parentElement.anchorTextCount += n.anchorTextCount;
		n.layout = 1;
		n.parentElement.textInChildrenCount += n.innerText.length;
		n.parentElement.anchorTextInChildrenCount += n.anchorTextInChildrenCount;
	}
	else { 
		//in inline element
		n.parentElement.childrenCount += n.childrenCount; 
		n.parentElement.anchorCount += n.anchorCount;
		n.parentElement.anchorTextCount += n.anchorTextCount;
	}
};

function get_node_rank(n) {
	var rank = 0;

	//1 size
	temp = node_height(n) * n.offsetWidth;
	rank += temp / 1000 > 60 ? 60 : temp/1000;
	rank += n.offsetWidth/10 > 40 ? 40 : n.offsetWidth / 10;

	//2 text lenght
	rank += n.textCount * 100 / body.textCount;

	//3 avarage node size
	if(n.childrenCount > 0)
		rank += (n.textCount-n.anchorTextCount) / n.childrenCount;
	else
		rank += n.textCount / 2;

	//4 
	if(n.anchorTextCount > 0) {
		temp = n.textCount / n.textCount;
		rank += temp > 100 ? 100 : temp;
	}
	else
		rank += 100;

	//5 
	temp = (body.offsetTop + body.offsetHeight/2) - (n.offsetTop + n.offsetHeight/2);
	rank += 10000/temp;

	return rank / 5;
}


//function update_info(fat, cur, info
function walk2(n) {
	for(var i = 0; i < n.children.length; i++) {
		if(n.children[i].nodeType == 1) {
			if(n.children[i].offsetHeight == 0)
				continue;
			if(n.children[i].tagName == 'A') {
				n.anchorText += n.children[i].innerText.length;	
				continue;
			}
			walk2(n.children[i]);
		}
	}
}

var body = document.getElementsByTagName("body")[0];

walk(body);

console.log(body.anchorCount);
console.log(body.anchorTextCount);
console.log(body.textCount);
console.log(body.childrenCount);
console.log(body.textInChildrenCount);
console.log(body.anchorTextInChildrenCount);

console.log('walker');
//travel around the tree
var walker=document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, null, false);
//walker.currentNode().pro = 200;

console.log(walker.currentNode.tagName);
console.log(walker.firstChild().tagName);
walker.currentNode = walker.parentNode();
console.log(walker.currentNode.tagName);

var pList = [];

while(walker.nextNode()) {	

	if(walker.currentNode.layout === 0){
		while(walker.lastChild()){}
		continue;
	}
	else if(walker.currentNode.textCount < 10) {
		while(walker.lastChild()){}
		continue;
	}
	else if(walker.currentNode.offsetWidth / body.offsetWidth < 0.2 
			&& walker.currentNode.offsetWidth < 200) {
		while(walker.lastChild()) {}
		continue;
	}
	//have not get rid of 'return' in the innerText, so use (textCount-anchorCount)
	else if(walker.currentNode.anchorTextCount / (walker.currentNode.textCount-walker.currentNode.anchorCount) > 0.8 ) {
		while(walker.lastChild()) {}
		continue;
	}
	if(walker.currentNode.textCount < 200) {
		//no need to use this tool for text length less than 200
		pList.push(walker.currentNode);		
		while(walker.lastChild()) {}
	}
	else if(walker.currentNode.textInChildrenCount / walker.currentNode.textCount < 0.5) {
		pList.push(walker.currentNode);		
		while(walker.lastChild()) {}
	}
}

var topIndex = 0;
var topRank = 0;

for(var i = 0; i< pList.length; i++) {
	var rank = get_node_rank(pList[i]);
	console.log('list' + i);
	console.log(pList[i].innerText);
	console.log(rank);
	if(topRank < rank) {
		topIndex = i;
		topRank = rank;
	}
}

console.log(pList[topIndex]);

function check_node_similar(n1, n2) {
	var rank = 0;
	rank1 = get_node_rank(n1);
	rank2 = get_node_rank(n2);

	if(rank1 > rank2) {
		rank += rank1 - rank2 ;

	}

}	
/*
var topList = [];
for(var i = 0; i < pList.length; i++) {
	if(similar(pList[i], topRank) > 50) {
		topList.push(pList[i])
	}
}

//find title near topList[0]
//text length less than 15
//h1--h2
//strong
//parent is strong or b or big
//position in the middle of body
//height not too much
//center of the line, add sorce
function get_title_rank(n) {
	var rank = 0;
	if(n.innerText.length < 15) {
		rank += 3;
	}
	if(n.tagName == 'H1' || n.tagName == 'H2') {
		rank += 5;
	}
	if(n.tagName == 'STRONG' || n.tagName == 'B' || n.tagName == 'BIG') {
		rank += 2;
	}
	//how to check the node is in the middle
	//if(n.offsetLeft 
	if(n.parentElement.tagName == 'A') {
		rank -= 3;
	}
	return rank;
}

var titleList = [];
function make_title_list() {
	titleList.push(topList[0]);
	var c = 2;
	// 2 nodes before topList[0] and 2 nodes after topList[0]
	walker.currentNode = topList[0];

	while(c > 0) {
		temp = walker.lastNode();
		if(temp.innerText.length > 2) {
			titleList.push(temp);
			c--;
		}	
	}
	c = 2;
	walker.currentNode = topList[0];
	while(c > 0) {
		temp = walker.nextNode();
		if(temp.innerText.length > 2) {
			titleList.push(temp);
			c--;
		}	
	}
}
//
//
//
//output text (as old method) from topList[0] to pList[last]

walker.currentNode = topList[0];
console.log(walker.currentNode.innerText);
while(walker.nextNode() != pList[pList.length-1]) {
	console.log(walker.currentNode.innerText);
}

console.log(walker.currentNode.innerText);
*/




