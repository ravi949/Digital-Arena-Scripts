/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/search', 'N/currentRecord', 'N/record','N/url'],
	function(search, currentRecord, record, url) {
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		var mode, taxLiablityRecId, bankChargesRecID, bankInterestRecID;

		function pageInit(scriptContext) {
			try {
				mode = scriptContext.mode;
				var url_string = window.location.href;
				log.debug(url_string);
				var url1 = new URL('url_string',url_string);
				var recId = url1.searchParams.get("recid");
				var subsidairy = url1.searchParams.get("sub");
				var account = url1.searchParams.get("account");
				if (recId && subsidairy && account) {
					scriptContext.currentRecord.setValue('subsidiary', subsidairy);
					scriptContext.currentRecord.setValue('custbody_createdfrombankstatement', recId);
					scriptContext.currentRecord.setValue('custbody_da_bank_account', account);
				}
				taxLiablityRecId = record.create({
					type: 'customtransaction_da_write_tax_liability'
				}).getValue('customtype');
				log.debug('settlemntRecID', taxLiablityRecId);
				log.debug(recId, subsidairy, account);
				bankChargesRecID = record.create({
					type: 'customtransaction_bankcharges'
				}).getValue('customtype');
				log.debug('settlemntRecID', bankChargesRecID);
				bankInterestRecID = record.create({
					type: 'customtransaction_bank_interests'
				}).getValue('customtype');
				log.debug('settlemntRecID', bankInterestRecID);
			} catch (ex) {
				log.debug(ex.name, ex.message);
			}
		}

		function LinesBankCharge(recId, subsidairy, account, recTypeId) {
          var setUrl = url.resolveRecord({
			    recordType: 'customtransaction_bankcharges',
			    recordId: 0,
			    isEditMode: true,
				params:{'rectypeid':recTypeId,'sub':subsidairy,'recid': recId, 'account': account}
			});
          window.open(setUrl);
			//window.open(window.location.origin + "/app/accounting/transactions/custom.nl?customtype=" + recTypeId + "&sub=" + subsidairy + "&recid=" + recId + "&account=" + account + "&rectypeid=" + recTypeId);
		}

		function LinesInterest(recId, subsidairy, account, recTypeId) {
          var setUrl = url.resolveRecord({
			    recordType: 'customtransaction_bank_interests',
			    recordId: 0,
			    isEditMode: true,
				params:{'rectypeid':recTypeId,'sub':subsidairy,'recid': recId, 'account': account}
			});
          window.open(setUrl);
			//window.open(window.location.origin + "/app/accounting/transactions/custom.nl?customtype=" + recTypeId + "&sub=" + subsidairy + "&recid=" + recId + "&account=" + account + "&rectypeid=" + recTypeId);
		}
		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {
			try {
				var record = scriptContext.currentRecord;
				if (scriptContext.fieldId == 'custrecord_endingstatementbalance' || scriptContext.fieldId == 'custrecord_reconciledthisstatement') {
					var endingBalance = scriptContext.currentRecord.getValue('custrecord_endingstatementbalance');
					var currentReconciledAmount = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
					var lastReconciledAmount = scriptContext.currentRecord.getValue('custrecord_lastreconciledbalanceopening');
					var differenceAmount = parseFloat(endingBalance) - (parseFloat(currentReconciledAmount) + parseFloat(lastReconciledAmount));
					scriptContext.currentRecord.setValue('custrecord_statementdifference', differenceAmount);
				}
				if (scriptContext.fieldId == 'custrecord_reconcilecheckinflow') {
					var reconcile = record.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
						fieldId: 'custrecord_reconcilecheckinflow'
					});
					if (reconcile) {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
							fieldId: 'custrecord__amount3decimalinflow'
						});
                      log.debug('amount',amount);
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) + parseFloat(amount)).toFixed(3));
					} else {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
							fieldId: 'custrecord__amount3decimalinflow'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) - parseFloat(amount)).toFixed(3));
					}
				}
				if (scriptContext.fieldId == 'custrecord_reconcilecheckoutflow') {
					var reconcile = record.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
						fieldId: 'custrecord_reconcilecheckoutflow'
					});
					if (reconcile) {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
							fieldId: 'custrecord_amount3decimaloutflow'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) + parseFloat(amount)).toFixed(3));
					} else {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
							fieldId: 'custrecord_amount3decimaloutflow'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) - parseFloat(amount)).toFixed(3));
					}
				}
				if (scriptContext.fieldId == 'custrecord_reconcilebankinter') {
					var reconcile = record.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
						fieldId: 'custrecord_reconcilebankinter'
					});
					if (reconcile) {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
							fieldId: 'custrecord_amount3decimalbankinterest'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) + parseFloat(amount)).toFixed(3));
					} else {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
							fieldId: 'custrecord_amount3decimalbankinterest'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) - parseFloat(amount)).toFixed(3));
					}
				}
				if (scriptContext.fieldId == 'custrecord_reconbankcharge') {
					var reconcile = record.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_reconcilebankcharge',
						fieldId: 'custrecord_reconbankcharge'
					});
					if (reconcile) {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankcharge',
							fieldId: 'custrecord_amount3decimalbankcharge'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) + parseFloat(amount)).toFixed(3));
					} else {
						var amount = record.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_reconcilebankcharge',
							fieldId: 'custrecord_amount3decimalbankcharge'
						});
						var total = scriptContext.currentRecord.getValue('custrecord_reconciledthisstatement');
						scriptContext.currentRecord.setValue('custrecord_reconciledthisstatement', (parseFloat(total) - parseFloat(amount)).toFixed(3));
					}
				}
				if (true){//scriptContext.fieldId == 'custrecord_reconcilebankaccount' || scriptContext.fieldId == 'custrecord_bankstatementstartdate' || scriptContext.fieldId == 'custrecord_bankstatementenddate') {
					var account = record.getValue('custrecord_reconcilebankaccount');
					var statementStartDate = record.getValue('custrecord_bankstatementstartdate');
					var statementEndDate = record.getValue('custrecord_bankstatementenddate');
					var statementStartDateT = record.getText('custrecord_bankstatementstartdate');
					var statementEndDateT = record.getText('custrecord_bankstatementenddate');
					log.debug(statementStartDateT, statementEndDateT);
					log.debug(statementStartDate, statementEndDateT);
					if (account) {
						var customrecord_reconcilebankstatementSearchObj = search.create({
							type: "customrecord_reconcilebankstatement",
							filters: [
								["custrecord_reconcilebankaccount", "anyof", account], "AND", ["custrecord_da_bank_stmnt_reconciled", "is", "T"]
							],
							columns: [
								search.createColumn({
									name: "scriptid",
									label: "Script ID"
								}),
								search.createColumn({
									name: "custrecord_reconcilebankaccount",
									label: "Bank Account"
								}),
								search.createColumn({
									name: "custrecord_currencystatement",
									label: "Currency"
								}),
								search.createColumn({
									name: "custrecord_bankstatementstartdate",
									label: "Bank Statement Start Date"
								}),
								search.createColumn({
									name: "custrecord_bankstatementenddate",
									sort: search.Sort.DESC,
									label: "Bank Statement End Date"
								}),
								search.createColumn({
									name: "custrecord_endingstatementbalance",
									label: "Ending Statement Balance"
								}),
								search.createColumn({
									name: "custrecord_reconciledthisstatement",
									label: "reconciled amount"
								}),
								search.createColumn({
									name: "custrecord_lastreconciledbalanceopening",
									label: "Last Reconciled Balance (Opening Balance)"
								})
							]
						});
						var searchResultCount = customrecord_reconcilebankstatementSearchObj.runPaged().count;
						log.debug("customrecord_reconcilebankstatementSearchObj result count", searchResultCount);
						if (searchResultCount > 0) {
							customrecord_reconcilebankstatementSearchObj.run().each(function(result) {
								record.setValue('custrecord_lastreconciledbalanceopening', result.getValue('custrecord_reconciledthisstatement'));
								//return true;
							});
						} else {
							record.setValue('custrecord_lastreconciledbalanceopening', 0);
						}
					}
					if (account && statementStartDate && statementEndDate) {
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
						});
						for (var i = numLines - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								line: i,
								ignoreRecalc: true
							});
						}
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
						});
						for (var i = numLines - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								line: i,
								ignoreRecalc: true
							});
						}
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'recmachcustrecord_custrecord_reconcilebankinter'
						});
						for (var i = numLines - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
								line: i,
								ignoreRecalc: true
							});
						}
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'recmachcustrecord_reconcilebankcharge'
						});
						for (var i = numLines - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_reconcilebankcharge',
								line: i,
								ignoreRecalc: true
							});
						}
						var transactionSearchObj = search.create({
							type: "transaction",
							filters: [
								["account", "anyof", account],
								"AND",
								["custbody_reconciled", "is", "F"],
								"AND",
								["type", "anyof", "CustRfnd","CustPymt","CustDep", "CashSale", "CashRfnd", "Deposit", "VendPymt", "Check", "Custom" + taxLiablityRecId],
								"AND",
								["trandate", "within", statementStartDateT, statementEndDateT]
							],
							columns: [
								search.createColumn({
									name: "ordertype",
									sort: search.Sort.ASC,
									label: "Order Type"
								}),
								search.createColumn({
									name: "mainline",
									label: "*"
								}),
								search.createColumn({
									name: "trandate",
									label: "Date"
								}),
								search.createColumn({
									name: "asofdate",
									label: "As-Of Date"
								}),
								search.createColumn({
									name: "postingperiod",
									label: "Period"
								}),
								search.createColumn({
									name: "taxperiod",
									label: "Tax Period"
								}),
								search.createColumn({
									name: "type",
									label: "Type"
								}),
								search.createColumn({
									name: "tranid",
									label: "Document Number"
								}),
								search.createColumn({
									name: "entity",
									label: "Name"
								}),
								search.createColumn({
									name: "account",
									label: "Account"
								}),
								search.createColumn({
									name: "memo",
									label: "Memo"
								}),
								search.createColumn({
									name: "amount",
									label: "Amount"
								}),
								search.createColumn({
									name: "custbody_dabankstatementamount",
									label: "Total"
								}),
								search.createColumn({
									name: "recordtype",
									label: "Record Type"
								})
							]
						});
						transactionSearchObj.filters.push(search.createFilter({
							"name": "amount",
							"operator": "greaterthan",
							"values": "0.00"
						}));
						var searchResultCount = transactionSearchObj.runPaged().count;
						log.debug("transactionSearchObj result count", searchResultCount);
						transactionSearchObj.run().each(function(result) {
							var documentNo = result.id;
							log.debug(documentNo);
							record.selectNewLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
							var entity = result.getValue('entity');
							if (entity) {
								record.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
									fieldId: 'custrecord__payeeinflow',
									value: entity
								});
							}
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord_da__inflow_tran_record_type',
								value: result.getValue('recordtype')
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord__documentnumberoutflow',
								value: documentNo,
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
							return true;
						});
						transactionSearchObj.filters.pop({
							"name": "amount"
						});
						transactionSearchObj.filters.push(search.createFilter({
							"name": "amount",
							"operator": "lessthan",
							"values": "0.00"
						}));
						var searchResultCount = transactionSearchObj.runPaged().count;
						log.debug("transactionSearchObj result count", searchResultCount);
						transactionSearchObj.run().each(function(result) {
							var documentNo = result.id;
							log.debug(documentNo);
							record.selectNewLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
							});
							var entity = result.getValue('entity');
							var amount = Number(result.getValue('custbody_dabankstatementamount')).toFixed(3);
							if (entity) {
								record.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
									fieldId: 'custrecord_payeeoutflow',
									value: entity
								});
							}
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								fieldId: 'custrecord_documentnumberoutflow',
								value: documentNo,
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								fieldId: 'custrecord_da_outflow_tran_record_type',
								value: result.getValue('recordtype')
							});
							if (amount > 0) {
								record.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
									fieldId: 'custrecord_amount3decimaloutflow',
									value: -(amount)
								});
							} else {
								record.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
									fieldId: 'custrecord_amount3decimaloutflow',
									value: (amount)
								});
							}
							record.commitLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
							});
							return true;
						});
						//bank Transfer inflow
						var transactionSearchObj = search.create({
							type: "transaction",
							filters: [
								["formulatext: {recordType}", "contains", "customtransaction_dabanktransfer"],
								"AND",
								["custbody_dadestinationaccount", "anyof", account],
								"AND",
								["mainline", "is", "T"],"AND",
								["trandate", "within", statementStartDateT, statementEndDateT]
							],
							columns: [
								search.createColumn({
									name: "custbody_dabankstatementamount",
									label: "Bank Statement Amount"
								}),
								search.createColumn({
									name: "recordtype",
									label: "Record Type"
								}),
								search.createColumn({
									name: "tranid",
									label: "Document Number"
								}),
							]
						});
						var searchResultCount = transactionSearchObj.runPaged().count;
						log.debug("transactionSearchObj result count", searchResultCount);
						transactionSearchObj.run().each(function(result) {
							var documentNo = result.id;
							record.selectNewLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord_da__inflow_tran_record_type',
								value: result.getValue('recordtype')
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord__documentnumberoutflow',
								value: documentNo,
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
							return true;
						});
						//voiding Inflow
						var journalentrySearchObj = search.create({
						   type: "journalentry",
						   filters:
						   [
						      ["type","anyof","Journal"], 
						      "AND", 
						      [["memo","contains","void of check"],"OR",["memo","contains","Void Of Customer"],"OR",["memo","contains","void of bill pay"]], 
						      "AND", 
						      ["account","anyof",account], 
						      "AND", 
						      ["trandate","within", statementStartDateT, statementEndDateT]
						   ],
						   columns:
						   [
						      search.createColumn({name: "internalid", label: "Internal ID"}),
						      search.createColumn({name: "custbody_dabankstatementamount", label: "Bank Statement Amount"}),
						      search.createColumn({name: "recordtype", label: "Record Type"})
						   ]
						});
						var searchResultCount = journalentrySearchObj.runPaged().count;
						log.debug("journalentrySearchObj result count",searchResultCount);
						journalentrySearchObj.run().each(function(result){
						   var documentNo = result.id;
						   var amount = Number(result.getValue('custbody_dabankstatementamount')).toFixed(3);
							record.selectNewLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord_da__inflow_tran_record_type',
								value: result.getValue('recordtype')
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord__documentnumberoutflow',
								value: documentNo,
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
								fieldId: 'custrecord__amount3decimalinflow',
								value: -(amount)
							});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
							});
						    return true;
						});
						//bank Transfer outflow
						var transactionSearchObj = search.create({
							type: "transaction",
							filters: [
								["formulatext: {recordType}", "contains", "customtransaction_dabanktransfer"],
								"AND",
								["custbody_da_bank_account", "anyof", account],
								"AND",
								["mainline", "is", "T"],"AND",
								["trandate", "within", statementStartDateT, statementEndDateT]
							],
							columns: [
								search.createColumn({
									name: "custbody_dabankstatementamount",
									label: "Bank Statement Amount"
								}),
								search.createColumn({
									name: "recordtype",
									label: "Record Type"
								}),
								search.createColumn({
									name: "tranid",
									label: "Document Number"
								}),
							]
						});
						var searchResultCount = transactionSearchObj.runPaged().count;
						log.debug("transactionSearchObj result count", searchResultCount);
						transactionSearchObj.run().each(function(result) {
							var documentNo = result.id;
							record.selectNewLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
							});
							var amount = Number(result.getValue('custbody_dabankstatementamount')).toFixed(3);
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								fieldId: 'custrecord_documentnumberoutflow',
								value: documentNo,
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								fieldId: 'custrecord_da_outflow_tran_record_type',
								value: result.getValue('recordtype')
							});
							record.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
								fieldId: 'custrecord_amount3decimaloutflow',
								value: -(amount)
							});
							record.commitLine({
								sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
							});
							return true;
						});
						log.debug(mode);
						if (mode != "create") {
							var transactionSearchObj = search.create({
								type: "transaction",
								filters: [
									["type", "anyof", "Custom" + bankChargesRecID, "Custom" + bankInterestRecID],
									"AND", ["custbody_da_bank_account", "anyof", account], "AND",
									["account", "anyof", account],
									"AND",
									["custbody_createdfrombankstatement", "anyof", scriptContext.currentRecord.id],
									"AND",
									["custbody_reconciled", "is", "F"],"AND",
								["trandate", "within", statementStartDateT, statementEndDateT]
								],
								columns: [
									search.createColumn({
										name: "custbody_dabankstatementamount",
										label: "Total 3 Decimal"
									}),
									search.createColumn({
										name: "type",
										label: "Type"
									})
								]
							});
							var searchResultCount = transactionSearchObj.runPaged().count;
							log.debug("transactionSearchObj result count", searchResultCount);
							transactionSearchObj.run().each(function(result) {
								var type = result.getText('type');
								log.debug(type);
								if (type == "Bank Charges") {
									record.selectNewLine({
										sublistId: 'recmachcustrecord_reconcilebankcharge'
									});
									record.setCurrentSublistValue({
										sublistId: 'recmachcustrecord_reconcilebankcharge',
										fieldId: 'custrecord_documentnumberbankchar',
										value: result.id,
										ignoreFieldChange: false,
										forceSyncSourcing: true
									});
									record.setCurrentSublistValue({
										sublistId: 'recmachcustrecord_reconcilebankcharge',
										fieldId: 'custrecord_amount3decimalbankcharge',
										value: -(Number(result.getValue('custbody_dabankstatementamount')).toFixed(3)),
										ignoreFieldChange: false,
										forceSyncSourcing: true
									});
									record.commitLine({
										sublistId: 'recmachcustrecord_reconcilebankcharge'
									});
									log.debug("setting, charge");
								}
								if (type == "Bank Interest Earneds") {
									log.debug("setting, charge");
									record.selectNewLine({
										sublistId: 'recmachcustrecord_custrecord_reconcilebankinter'
									});
									record.setCurrentSublistValue({
										sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
										fieldId: 'custrecord_documentnumberbankinterest',
										value: result.id,
										ignoreFieldChange: false,
										forceSyncSourcing: true
									});
									record.setCurrentSublistValue({
										sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
										fieldId: 'custrecord_amount3decimalbankinterest',
										value: (Number(result.getValue('custbody_dabankstatementamount')).toFixed(3)),
										ignoreFieldChange: false,
										forceSyncSourcing: true
									});
									record.commitLine({
										sublistId: 'recmachcustrecord_custrecord_reconcilebankinter'
									});
								}
								return true;
							});
						}
					} else {
						//alert("please select Acount, Start Date & End Date");
					}
				}
				if (scriptContext.fieldId == 'custrecord_endingstatementbalance') {}
			} catch (ex) {
				log.debug(ex.name, ex.message);
			}
		}
		/**
		 * Function to be executed when field is slaved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord -. Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 *
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {
			try {} catch (ex) {
				log.debug(ex.name, ex.message);
			}
		}
		/**
		 * Function to be executed after sublist is inserted, removed, or edited.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function sublistChanged(scriptContext) {}
		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {
			try {} catch (ex) {
				log.debug(ex.name, ex.message);
			}
		}
		/**
		 * Validation function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @returns {boolean} Return true if field is valid
		 *
		 * @since 2015.2
		 */
		function validateField(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is committed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is inserted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateInsert(scriptContext) {}
		/**
		 * Validation function to be executed when record is deleted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateDelete(scriptContext) {}
		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			try {
				return true;
			} catch (ex) {
				log.debug(ex.name, ex.message);
			}
		}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			//      postSourcing: postSourcing,
			//      sublistChanged: sublistChanged,
			// lineInit: lineInit,
			//      validateField: validateField,
			//      validateLine: validateLine,
			//      validateInsert: validateInsert,
			//      validateDelete: validateDelete,
			saveRecord: saveRecord,
			LinesInterest: LinesInterest,
			LinesBankCharge: LinesBankCharge
		};
	});