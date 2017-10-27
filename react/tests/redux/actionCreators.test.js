import nock from "nock";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import XML from "xmlhttprequest";

import actionCreators from "../../src/js/redux/actionCreators.js";
import c from "../../src/js/redux/actionTypes.js";
import catList from "../../src/data/cats.json";
import catListSorted from "../../tests/catsSortedByName.json";


describe("Given Redux actionCreators", () => {
	const mockStore = configureMockStore([ thunk ]);
	const store = mockStore({ transactions: [] });
	
	describe("When the requestCatList action creator is executed", () => {
		beforeAll(() => {
			XMLHttpRequest = XML.XMLHttpRequest; // eslint-disable-line no-global-assign
			nock(/localhost:3000/).get("/data/cats.json").reply(200, catList);
		});
		
		beforeEach(() => {
			store.clearActions();
		});
		
		it("Should dispatch the RECEIVE_ITEMS action with expected type and data load", () => {
			return store.dispatch(actionCreators.requestCatList("http://localhost:3000/data/cats.json")).then(() => {
				expect(store.getActions()[0]).toEqual({ type: c.RECEIVE_ITEMS, items: catListSorted });
			});
		});
		
		describe("When there is some connection error", () => {
			it("Should dispatch the RECEIVE_ITEMS_ERROR action with expected type and data load", () => {
				return store.dispatch(actionCreators.requestCatList("http://wrongurl.bad")).then(() => {
					expect(store.getActions()[0].type).toEqual(c.RECEIVE_ITEMS_ERROR);
				});
			});
		});
	});
	
	describe("When the setSelected action creator is executed", () => {
		it("Should dispatch the SET_CARD_SELECTED action with expected type and data load", () => {
			expect(actionCreators.setSelected("2")).toEqual({ type: c.SET_CARD_SELECTED, id: "2" });
		});
	});
	
	describe("When the setFilterString action creator is executed", () => {
		it("Should dispatch the SET_FILTER_STRING action with expected type and data load", () => {
			expect(actionCreators.setFilterString("flu")).toEqual({ type: c.SET_FILTER_STRING, filterString: "flu" });
		});
	});
});
