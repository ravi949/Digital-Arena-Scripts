/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],

		function(record, search, runtime, format) {

	/**
	 * Marks the beginning of the Map/Reduce process and generates input data.
	 *
	 * @typedef {Object} ObjectRef
	 * @property {number} id - Internal ID of the record instance
	 * @property {string} type - Record type id
	 *
	 * @return {Array|Object|Search|RecordRef} inputSummary
	 * @since 2015.1
	 */
	function getInputData() {
		//Getting payrun scheduling record with filter processing checkbox is true
		try {

			return search.create({
				   type: "item",
				   filters:
				   [
				   ],
				   columns:
				   [
					   search.createColumn({name: "internalid", label: "Name"}),
				      search.createColumn({name: "itemid", label: "Name"}),
				      search.createColumn({name: "displayname", label: "Display Name"}),
				      search.createColumn({name: "salesdescription", label: "Description"}),
				      search.createColumn({name: "type", label: "Type"}),
				      search.createColumn({name: "baseprice", label: "Base Price"})
				   ]
				});

			
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	/**
	 * Executes when the map entry point is triggered and applies to each key/value pair.
	 *
	 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
	 * @since 2015.1
	 */
	function map(context) {
		try {
			var searchResult = JSON.parse(context.value);
			var values = searchResult.values;
			log.debug('values',values);
			//var itemInternalID = searchResult.values.internalid.value;
			var itemInternalID = searchResult.values.internalid;

			var itemCode =  searchResult.values.itemid;

			context.write({
				key:itemCode,
				value:{
					itemInternalID:itemInternalID,
					itemCode:itemCode
				}
			})
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	/**
	 * Executes when the reduce entry point is triggered and applies to each group.
	 *
	 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	 * @since 2015.1
	 */
	function reduce(context) {
		try {
			var empId = JSON.parse(context.key);
			var data = JSON.parse(context.values[0]);
			var itemInternalID = data.itemInternalID;
			var itemCode = data.itemCode;
			
			log.debug('itemInternalID', itemInternalID);
			log.debug('itemCode', itemCode);
			
		} catch (ex) {
			log.error(ex.name, ex.message);

		}
	}



	

	/**
	 * Executes when the summarize entry point is triggered and applies to the result set.
	 *
	 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
	 * @since 2015.1
	 */
	function summarize(summary) {
		try {
			
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};

});