(function(cardList) {
	"use strict";
	
	cardList.data = [];
	
	cardList.mappingFunction = function(container, dataArray, templateString) {
		var oldCard;
		dataArray.forEach(function (data) {
			container.insertAdjacentHTML("beforeend", templateString);
			var element = container.lastElementChild;
			
			element.children[0].children[0].style.backgroundImage = "url('img\/" + data.id + ".jpg')";
			element.children[1].children[0].innerHTML = data.name;
			element.children[1].children[1].innerHTML = data.description;
			
			element.addEventListener("click", function () {
				if (oldCard && oldCard !== element)
					oldCard.classList.toggle("card--selected");
				element.classList.toggle("card--selected");
				oldCard = element;
			});
		});
		
		return container;
	};
	
	
	
	cardList.retrieveData = function(url, callback) {
		var request = new XMLHttpRequest();
		request.addEventListener("load", function () {
			callback(request.responseText);
		});
		request.open("GET", url);
		try {
			request.send();
		} catch (e) {
			console.log(e);
		}
	};
	
	
	
	cardList.sortData = function(data) {
		return data.sort(function(a, b) {
			if (a.name < b.name)
				return -1;
			if (a.name > b.name)
				return 1;
			else return 0;
		});
	};
	
	
	
	cardList.filter = function(items, filterString) {
		return items.filter(function(cat) {
			var catKeys = Object.keys(cat);
			for (var n=0; n<catKeys.length; ++n)
				if (cat[catKeys[n]] && cat[catKeys[n]].toLowerCase().indexOf(filterString.toLowerCase()) > -1)
					return true;
			return false;
		});
	};
	
	
	
	cardList.render = function(container, data, template) {
		return cardList.mappingFunction(container, data, template);
	};
	
	
	
	cardList.init = function(urlJsonFeed, inputField) {
		var jsonString, templateString;
		var container = document.getElementsByClassName("card-list")[0];
		
		// Retrieves the JSON data
		cardList.retrieveData(urlJsonFeed, function(responseText) {
			jsonString = responseText;
			cardList.data = cardList.sortData(JSON.parse(jsonString));
			if (templateString)
				cardList.render(container, cardList.data, templateString);
		});
		
		// Retrieves the HTML template for cards
		cardList.retrieveData("components/cardList/card.tpl.htm", function(responseText) {
			templateString = responseText;
			if (jsonString)
				cardList.render(container, cardList.data, templateString);
		});
		
		// Filters list by the string typed on the input field
		if (inputField)
			inputField.addEventListener("input", function(event) {
				container.innerHTML = "";
				cardList.render(container, cardList.filter(cardList.data, event.target.value), templateString);
			});
		
	};
	
	
}(window.cardList = window.cardList || {}));
