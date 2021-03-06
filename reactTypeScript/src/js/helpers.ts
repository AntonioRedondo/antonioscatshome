export function sortByName(itemsArray) {
	return itemsArray.sort((a, b) => {
		if (a.name < b.name)
			return -1;
		if (a.name > b.name)
			return 1;
		return 0;
	});
}

export function isNode() {
	return typeof module !== "undefined" && module.exports && typeof window === "undefined";
}
