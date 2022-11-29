/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
	function(record, search, runtime) {
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
				log.debug('mapreduce script triggered');
				var payrollId = runtime.getCurrentScript().getParameter({
					name: 'custscript_ic_payroll_id_2'
				});
				
				var icPaycheckRecID = record.create({
					type: 'customtransaction_da_ic_paycheck_journal'
				}).getValue('customtype');
				var transactionSearchObj = search.create({
					type: "transaction",
					filters: [
						["type", "anyof", "Custom" + icPaycheckRecID],
						"AND",
						["custbody_da_created_from_ic_payroll_sh.custrecord_da_created_from_payroll_sheet","anyof",payrollId], 
						"AND",
						["mainline", "is", "T"]
					],
					columns: [
						search.createColumn({
							name: "internalid",
							summary: "GROUP",
							label: "Internal ID"
						}),
						search.createColumn({
							name: "recordtype",
							summary: "GROUP",
							label: "Record Type"
						})
					]
				});
				var searchResultCount = transactionSearchObj.runPaged().count;
				log.debug("transactionSearchObj result count", searchResultCount);
				transactionSearchObj.run().each(function(result) {
					var type = result.getValue({
						name: 'recordtype',
						summary: search.Summary.GROUP
					});
					log.debug('type', type);
					log.debug('recordtype', result.getText({
						name: 'recordtype',
						summary: search.Summary.GROUP
					}));
					record.load({
						type: type,
						id: result.getValue({
							name: 'internalid',
							summary: search.Summary.GROUP
						})
					}).setValue('transtatus', "B").save();
					return true;
				});
              
              var customrecord_da_intercompany_payrollSearchObj = search.create({
               type: "customrecord_da_intercompany_payroll",
               filters:
               [
                  ["custrecord_da_created_from_payroll_sheet","anyof",payrollId]
               ],
               columns:
               [
                  search.createColumn({
                     name: "id",
                     sort: search.Sort.ASC,
                     label: "ID"
                  })
               ]
            });
            var searchResultCount = customrecord_da_intercompany_payrollSearchObj.runPaged().count;
            log.debug("customrecord_da_intercompany_payrollSearchObj result count",searchResultCount);
            customrecord_da_intercompany_payrollSearchObj.run().each(function(result){
              record.submitFields({
                type :'customrecord_da_intercompany_payroll',
                id : result.id,
                values :{
                  'custrecord_da_ic_approval_status' : 3
                }
              })
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
			//summarize: summarize
		};
	});