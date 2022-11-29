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
				return search.create({
					type: "employee",
					filters: [
						["internalid", "anyof", "-5"],
					],
					columns: [
						search.createColumn({
							name: "entityid",
							label: "Name"
						}),
						search.createColumn({
							name: "email",
							label: "Email"
						}),
						search.createColumn({
							name: "custentity_da_emp_include_in_payroll",
							label: "Include in payroll?"
						}),
						search.createColumn({
							name: "internalid",
							sort: search.Sort.ASC,
							label: "Internal ID"
						})
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
				var payrunRecId = runtime.getCurrentScript().getParameter({
					name: 'custscript_ic_payroll_id'
				});
				//  log.debug('payrunRecId', payrunRecId);
				var deductionRec = record.load({
					type: 'customrecord_da_intercompany_payroll',
					id: payrunRecId
				});
				// log.debug('deductionRec', deductionRec.getValue('custrecord_da_sch_pay_run_emplist'));
				var arr = JSON.parse(deductionRec.getValue('custrecord_da_ic_employees_array'));
				log.debug('arr', arr);
				for (var i = 0; i < arr.length; i++) {
					// log.debug('i', arr[i]);
					context.write({
						key: arr[i],
						value: arr[i]
					});
				}
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
				// log.debug('empId', empId);
				var payrunRecId = runtime.getCurrentScript().getParameter({
					name: 'custscript_ic_payroll_id'
				});
				log.debug('payrunRecId', payrunRecId);
				var payrunSchRec = record.load({
					type: 'customrecord_da_intercompany_payroll',
					id: payrunRecId
				});
				var pperiod = payrunSchRec.getValue('custrecord_da_ic_posting_period');
				var subsidiary = payrunSchRec.getValue('custrecord_da_ic_payroll_ic_subsidiary');
				var paycheckJournalRec = record.create({
					type: "customtransaction_da_ic_paycheck_journal",
					isDynamic: true
				});
				var date = payrunSchRec.getValue('custrecord_da_ic_end_date');
				var account = payrunSchRec.getValue('custrecord_da_ic_payable_account');
				paycheckJournalRec.setValue('subsidiary', subsidiary);
				// paycheckJournalRec.setValue('account',account);
				paycheckJournalRec.setValue('custbody_da_ic_paycheck_employee', empId);
				paycheckJournalRec.setValue('custbody_da_created_from_ic_payroll_sh', payrunRecId);
				//paycheckJournalRec.setValue('location','');
				paycheckJournalRec.setValue('trandate', date);
				paycheckJournalRec.setValue('postingperiod', pperiod);
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_ic_pay_run_items",
					filters: [
						["custrecordda_ic_payroll_parent", "anyof", payrunRecId],
						"AND",
						["custrecord_da_ic_payrun_employee", "anyof", empId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_ic_payrun_decducted_amt",
							summary: "SUM",
							label: "Deducted Amount"
						})
					]
				});
				var totalNetPaid = 0;
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				// log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					totalNetPaid = result.getValue({
						name: 'custrecord_da_ic_payrun_decducted_amt',
						summary: search.Summary.SUM
					});
					return true;
				});
				// var icRecAccount = payrunSchRec.getValue('custrecord_da_payroll_ic_ar_account');
				paycheckJournalRec.selectNewLine({
					sublistId: 'line'
				});
				paycheckJournalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'account',
					value: account
				});
				paycheckJournalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'credit',
					value: totalNetPaid
				});
				/*paycheckJournalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'entity',
					value: empId
				});*/
				paycheckJournalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'memo',
					value: "Total Net Paid Salary"
				});
				paycheckJournalRec.commitLine({
					sublistId: 'line'
				});
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_ic_pay_run_items",
					filters: [
						["custrecordda_ic_payroll_parent", "anyof", payrunRecId],
						"AND",
						["custrecord_da_ic_payrun_employee", "anyof", empId]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						}),
						search.createColumn({
							name: "custrecord_da_ic_payrun_employee",
							label: "Employee"
						}),
						search.createColumn({
							name: "custrecord_da_ic_payrun_item_type",
							label: "Item Type"
						}),
						search.createColumn({
							name: "custrecord_da_ic_payrun_payroll_item",
							label: "Payroll Item"
						}),
						search.createColumn({
							name: "custrecord_da_ic_payrun_amount",
							label: "Amount"
						})
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					//log.debug('result', result);
					var payrollType = result.getText('custrecord_da_ic_payrun_item_type');
					var digitalPayrollId = result.getValue('custrecord_da_ic_payrun_payroll_item');
					var payrollItemRec = record.load({
						type: 'customrecord_da_payroll_items',
						id: digitalPayrollId
					})
					if (payrollType == "Earnings") { //earnings
						var account = payrollItemRec.getValue('custrecord_da_item_expense_account');
						paycheckJournalRec.selectNewLine({
							sublistId: 'line'
						});
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: account
						});
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: result.getValue('custrecord_da_ic_payrun_amount')
						});
						/*paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'entity',
							value: empId
						});*/
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: result.getText('custrecord_da_ic_payrun_payroll_item')
						});
						paycheckJournalRec.commitLine({
							sublistId: 'line'
						});
					}
					if (payrollType == "Deductions") { //deductions
						var account = payrollItemRec.getValue('custrecord_da_item_expense_account');
						paycheckJournalRec.selectNewLine({
							sublistId: 'line'
						});
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: account
						});
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: result.getValue('custrecord_da_ic_payrun_amount')
						});
						/*paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'entity',
							value: empId
						});*/
						paycheckJournalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: result.getText('custrecord_da_ic_payrun_payroll_item')
						});
						paycheckJournalRec.commitLine({
							sublistId: 'line'
						});
					}
					return true;
				});
				var paycheck = paycheckJournalRec.save({
					enableSourcing: false,
					ignoreMandatoryFields: true
				});
				log.debug('paycheck', paycheck);
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