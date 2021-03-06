import reducers from "../../src/js/redux/reducers";
import actionTypes from "../../src/js/redux/actionTypes";
import catList from "../../src/data/cats.json";


describe("Given reducer functions", () => {
	describe("When the CATS_RECEIVED action is received", () => {
		it("It should modify state accordingly", () => {
			const state = reducers(
				{},
				{
					type: actionTypes.CATS_RECEIVED,
					payload: catList
				});
				
			expect(state.cats.length).toBe(4);
			expect(state.cats[1].name).toBe("Fluffy");
			expect(state.cats[2].name).toBe("Luna");
			expect(state.cats[3].name).toBe("Bella");
		});
	});
	
	describe("When the CAT_SELECTED action is received", () => {
		it("It should modify state accordingly", () => {
			const state = reducers(
				{},
				{
					type: actionTypes.CAT_SELECTED,
					id: "4"
				});
			
			expect(state.catSelected).toBe("4");
		});
	});
	
	describe("When the FILTER_STRING_SET action is received", () => {
		it("It should modify state accordingly", () => {
			const state = reducers(
				{},
				{
					type: actionTypes.FILTER_STRING_SET,
					filterString: "fuffly"
				});
				
			expect(state.filterString).toEqual("fuffly");
		});
	});
});
