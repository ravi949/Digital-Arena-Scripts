/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime','N/currency'],
	function(record, search, runtime, currency) {
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
					name: 'custscript_payroll_id'
				});
				var paycheckRecID = record.create({
					type: 'customtransaction_da_paycheck_journal'
				}).getValue('customtype');
				var icPaycheckRecID = record.create({
					type: 'customtransaction_da_ic_paycheck_journal'
				}).getValue('customtype');
				var transactionSearchObj = search.create({
					type: "transaction",
					filters: [
						["type", "anyof", "Custom" + paycheckRecID, "Custom" + icPaycheckRecID],
						"AND",
						["custbody_da_created_from_payroll_sheet", "anyof", payrollId],
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

				var payrollSubsidairy = record.load({
					type:'customrecord_da_pay_run_scheduling',
					id: payrollId
				}).getValue('custrecord_da_override_primary_subsidair');
				return search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_scheduling", "anyof", payrollId],
						"AND",
						["custrecord_da_payrun_ic_subsidiary", "noneof", "@NONE@"],
						"AND",
						["custrecord_da_payrun_ic_subsidiary", "noneof", payrollSubsidairy]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_payrun_ic_subsidiary",
							summary: "GROUP",
							label: "IC Subsidiary"
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
				var searchResult = JSON.parse(context.value);
				log.debug('searchResult in map',searchResult); 
				var subsidairyId  = searchResult.values["GROUP(custrecord_da_payrun_ic_subsidiary)"]["value"];
				log.debug('subsidairyId',subsidairyId);

				context.write({
					key : subsidairyId,
					value: subsidairyId
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
				var subsidairyId = JSON.parse(context.key);
				log.debug('subsidairyId', subsidairyId);

				var payrollId = runtime.getCurrentScript().getParameter({
					name: 'custscript_payroll_id'
				});

				var customrecord_da_general_settingsSearchObj = search.create({
						   type: "customrecord_da_general_settings",
						   filters:
						   [
						      ["custrecord_da_settings_subsidiary","anyof",subsidairyId]
						   ],
						   columns:
						   [
						      search.createColumn({name: "custrecord_da_intercompany_account_recei", label: "Intercompany Receivable Account"}),
						      search.createColumn({name: "custrecord_da_intercompany_account_payab", label: "Intercompany Payable Account"})
						   ]
						});
						var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
						log.debug("customrecord_da_general_settingsSearchObj result count",searchResultCount);

						var icPayableAccount ;
						customrecord_da_general_settingsSearchObj.run().each(function(result){
						   icPayableAccount = result.getValue('custrecord_da_intercompany_account_payab');
						   return true;
						});

						var originalPayrollCurrency = record.load({
							type :'customrecord_da_pay_run_scheduling',
							id: payrollId
						}).getValue('custrecord_da_payroll_currency');

						var targetCurrency = record.load({
							type :'subsidiary',
							id: subsidairyId
						}).getValue('currency');

						var rate = currency.exchangeRate({
						    source: originalPayrollCurrency,
						    target: targetCurrency,
						    date: new Date()
						});
						log.debug('rate', rate);

						//Intercompany Payroll Sheet Creation

						var icPayrollSheetRec =  record.create({
							type:'customrecord_da_intercompany_payroll',
							isDynamic: true
						});

						icPayrollSheetRec.setValue('custrecord_da_ic_payroll_ic_subsidiary', subsidairyId);
						icPayrollSheetRec.setValue('custrecord_da_ic_payable_account', icPayableAccount);
						icPayrollSheetRec.setValue('custrecord_da_created_from_payroll_sheet', payrollId);

						var customrecord_da_pay_run_itemsSearchObj = search.create({
						   type: "customrecord_da_pay_run_items",
						   filters:
						   [
						      ["custrecord_da_pay_run_scheduling","anyof",payrollId], 
						      "AND", 
						      ["custrecord_da_payrun_ic_subsidiary","noneof","@NONE@"], 
						      "AND", 
						      ["custrecord_da_payrun_ic_subsidiary","anyof",subsidairyId]
						   ],
						   columns:
						   [
						      search.createColumn({name: "internalid", label: "Internal ID"}),
						      search.createColumn({name: "custrecord_da_pay_run_item_amount", label: "Amount"}),
						      search.createColumn({name: "custrecord_da_pay_run_ded_amount", label: "Deducted Amount"})

						   ]
						});
						var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
						log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
						customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
						   	icPayrollSheetRec.selectNewLine({
								sublistId:'recmachcustrecordda_ic_payroll_parent'
							});
							icPayrollSheetRec.setCurrentSublistValue({
								sublistId:'recmachcustrecordda_ic_payroll_parent',
								fieldId:'custrecord_da_payrun_item_parent',
								value: result.id
							});
							var amount = result.getValue('custrecord_da_pay_run_item_amount');
							icPayrollSheetRec.setCurrentSublistValue({
								sublistId:'recmachcustrecordda_ic_payroll_parent',
								fieldId:'custrecord_da_ic_payrun_amount',
								value: (amount * rate).toFixed(2)
							});
							var dedAmount = result.getValue('custrecord_da_pay_run_ded_amount');
							icPayrollSheetRec.setCurrentSublistValue({
								sublistId:'recmachcustrecordda_ic_payroll_parent',
								fieldId:'custrecord_da_ic_payrun_decducted_amt',
								value: (dedAmount * rate).toFixed(2)
							});
							icPayrollSheetRec.commitLine({
								sublistId:'recmachcustrecordda_ic_payroll_parent'
							});
						   return true;
						});

						icPayrollSheetRec.save();

						

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
				var payrunRecId = runtime.getCurrentScript().getParameter({
					name: 'custscript_payroll_id'
				});
				log.debug('payrunRecId', payrunRecId);
				//special terms updating with paid amount 
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_scheduling", "anyof", payrunRecId], "AND",
						["custrecord_da_payrun_spt_id", "isnotempty", ""]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_payroll_item_type",
							label: "Item Type"
						}),
						search.createColumn({
							name: "custrecord_da_pay_run_item_amount",
							label: "Amount"
						}),
						search.createColumn({
							name: "custrecord_da_frequencynew",
							label: "Frequency"
						}),
						search.createColumn({
							name: "custrecord_da_payrun_spt_id",
							label: "SPT ID"
						})
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					var sptId = result.getValue('custrecord_da_payrun_spt_id');
					var sptRec = record.load({
						type: 'customrecord_da_emp_special_terms',
						id: sptId
					});
					var paidAmount = sptRec.getValue('custrecord_da_paid_amount');
					if (!paidAmount) {
						paidAmount = 0;
					}
					var deductedAmount = result.getValue('custrecord_da_pay_run_item_amount');
					var totalAmountPaid = parseFloat(paidAmount) + parseFloat(deductedAmount);
					sptRec.setValue('custrecord_da_paid_amount', totalAmountPaid);
					sptRec.save();
					return true;
				});
              
              var customrecord_da_pay_run_itemsSearchObj = search.create({
                 type: "customrecord_da_pay_run_items",
                 filters:
                 [
                    ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId], "AND",["custrecord_da_payroll_loan_id","isnotempty",""]
                 ],
                 columns:
                 [
                    search.createColumn({name: "custrecord_da_payroll_loan_id", label: "Loan Id"})
                 ]
              });
              var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
              log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
              customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
                 record.submitFields({
                   type:'customrecord_da_hr_loan_installment',
                   id : result.getValue('custrecord_da_payroll_loan_id'),
                   values:{
                     'custrecord_da_hr_loan_paid': true
                   }
                 })
                 return true;
              });
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
						"AND",
						["custrecord_da_payroll_ref_id", "isnotempty", ""]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_payroll_ref_id",
							sort: search.Sort.ASC,
							label: "ID"
						})
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					
						var recId = result.getValue('custrecord_da_payroll_ref_id');
						var id = record.submitFields({
							type: 'customrecord_monthly_add_and_deductions',
							id: Number(recId),
							values: {
								'custrecord_da_already_included_in_payrol': true
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields: true
							}
						});
						return true;
				});
             
				var payrollRec = record.load({
					type: 'customrecord_da_pay_run_scheduling',
					id: payrunRecId
				})
                var employessList = payrollRec.getValue("custrecord_da_sch_pay_run_emplist");
				log.debug("employessList", employessList);
              
              var payrollPeriod = payrollRec.getValue("custrecord_da_sch_pay_run_period");
              
              employessList = JSON.parse(employessList);
              
              var quickPay = payrollRec.getValue('custrecord_da_sch_pay_run_quick_pay');
              if(quickPay){
                for(var i = 0 ; i < employessList.length ; i++){
                  var empId = employessList[i];
                  log.debug('empId', empId);
                   record.load({
                     type :'employee',
                     id : empId
                   }).setValue('custentity_da_last_accountg_period', payrollPeriod).save();
                }
              }
				//sick leaves updating is deducted
				var customrecord_da_month_wise_leaveSearchObj = search.create({
					type: "customrecord_da_monthly_leaves",
					filters: [						
						["custrecord_da_emp_leaves.custrecord_da_emp_leavetype", "anyof", "2"],
						"AND",
						["custrecord_da_emp_month_leave.internalid", "anyof", JSON.parse(employessList)]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_month_name",
							label: "Month"
						})
					]
				});
				var searchResultCount = customrecord_da_month_wise_leaveSearchObj.runPaged().count;
				log.debug("customrecord_da_month_wise_leaveSearchObj result count", searchResultCount);
				customrecord_da_month_wise_leaveSearchObj.run().each(function(result) {
					record.submitFields({
						type: 'customrecord_da_monthly_leaves',
						id: result.id,
						values: {
							'custrecord_da_is_deducted_leave': true
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields: true
						}
					});
					return true;
				});
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