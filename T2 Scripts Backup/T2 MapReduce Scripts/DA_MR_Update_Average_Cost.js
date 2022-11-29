/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search'],
	function(record, search) {
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
					type: "transaction",
					filters: [
						[
							["type", "anyof", "ItemShip"], "AND", ["status", "anyof", "ItemShip:C"], "AND", ["mainline", "is", "T"], "AND", ["systemnotes.date", "within", "today"], "AND", ["systemnotes.field", "anyof", "TRANDOC.IMPACT"], "AND", ["createdfrom.type", "anyof", "SalesOrd"]
						],
						"OR",
						[
							["type", "anyof", "CustInvc"], "AND", ["mainline", "is", "T"], "AND", ["systemnotes.date", "within", "today"], "AND", ["systemnotes.field", "anyof", "TRANDOC.IMPACT"], "AND", ["createdfrom.type", "anyof", "@NONE@"]
						],
						"OR",
						[
							["type", "anyof", "CashSale"], "AND", ["mainline", "is", "T"], "AND", ["systemnotes.date", "within", "today"], "AND", ["systemnotes.field", "anyof", "TRANDOC.IMPACT"], "AND", ["createdfrom.type", "anyof", "@NONE@"]
						]
					],
					columns: [
						search.createColumn({
							name: "trandate",
							label: "Date"
						}),
						search.createColumn({
							name: "tranid",
							label: "Document Number"
						}),
						search.createColumn({
							name: "type",
							label: "Type"
						}),
						search.createColumn({
							name: "recordtype",
							label: "Record Type"
						}),
						search.createColumn({
							name: "internalid",
							label: "Internal id"
						})
					]
				});
				var searchResultCount = transactionSearchObj.runPaged().count;
				log.debug("transactionSearchObj result count", searchResultCount);
				transactionSearchObj.run().each(function(result) {
					var type = result.getValue('recordtype');
					var itemFullfilmentRec = record.load({
						type: type,
						id: result.id
					});
					itemFullfilmentRec.save({
						enableSourcing: true,
						ignoreMandatoryFeilds: true
					});
					return true;
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
				var tranID = values["internalid"].value;
				log.debug('values', values);
				var recType = values["recordtype"];
				log.debug('recType', recType);
				var keyArr = [];
				keyArr.push(tranID, recType);
				context.write({
					key: keyArr,
					value: 1
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
				var keyValues = JSON.parse(context.key);
				var tranID = keyValues[0];
				var tranType = keyValues[1];
				log.debug('tranid', tranID);
				log.debug('tranType', tranType);
				if (tranType == "invoice" || tranType == "salesorder" || tranType == "cashsale") {
					var invoiceRec = record.load({
						type: 'invoice',
						id: tranID,
						isDynamic: true
					});
					var lineCount = invoiceRec.getLineCount({
						sublistId: 'item'
					});
					for (var i = 0; i < lineCount; i++) {
						var itemId = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						var location = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
                      var itemType = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type',
							line: i
						});
var unitCost;
						if(itemType == 1){
						
						var itemSearchObj = search.create({
							type: "item",
							filters: [
								["internalid", "anyof", itemId],
								"AND",
								["inventorylocation.internalid", "anyof", location]
							],
							columns: [
								search.createColumn({
									name: "locationaveragecost",
									label: "Location Average Cost"
								})
							]
						});
						var searchResultCount = itemSearchObj.runPaged().count;
						itemSearchObj.run().each(function(result) {
							unitCost = result.getValue('locationaveragecost');
							return true;
						});
                          
						invoiceRec.selectLine({
                            sublistId: 'item',
                            line: i
                        });
						invoiceRec.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_average_cost_in_decimal',
                            value:unitCost
						});
                        invoiceRec.commitLine({
                          sublistId: 'item'
                        });
                        }
					}
					invoiceRec.save();
				} else {
					var rec = record.load({
						type: tranType,
						id: tranID
					});
					rec.save({
						enableSourcing: true,
						ignoreMandatoryFeilds: true
					});
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function time_convert(num) {
			return (num / 60).toFixed(2);
		}
		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 *
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(summary) {
			try {} catch (ex) {
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