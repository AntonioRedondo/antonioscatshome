import axios from "axios";

import { sortByName } from "../helpers";
import actionTypes from "./actionTypes";


export default {
	requestCats(url = "data/cats.json") {
		return dispatch => {
			return axios.get(url)
				.then(response => dispatch({ type: actionTypes.CATS_RECEIVED, payload: sortByName(response.data) }))
				.catch(error => dispatch({ type: actionTypes.CATS_RECEIVED_ERROR, error }));
		};
	},
	
	setSelected(id) {
		return {
			type: actionTypes.CAT_SELECTED,
			id
		};
	},
	
	setFilterString(filterString) {
		return {
			type: actionTypes.FILTER_STRING_SET,
			filterString
		};
	}
};
