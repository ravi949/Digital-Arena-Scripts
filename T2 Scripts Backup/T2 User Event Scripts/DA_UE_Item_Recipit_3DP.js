	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope TargetAccount
	 */
	define(['N/runtime', 'N/record', 'N/search'],
		function(runtime, record, search) {
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {string} scriptContext.type - Trigger type
			 * @param {Form} scriptContext.form - Current form
			 * @Since 2015.2
			 */
			function beforeLoad(scriptContext) {
				try {} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {Record} scriptContext.oldRecord - Old record
			 * @param {string} scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function beforeSubmit(scriptContext) {}
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {Record} scriptContext.oldRecord - Old record
			 * @param {string} scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function afterSubmit(scriptContext) {
				try {
					var customrecord_da_gl_data_baseSearchObj = search.create({
						type: "customrecord_da_gl_data_base",
						filters: [
							["custrecord_da_gl_impact_created_from", "anyof", scriptContext.newRecord.id]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							}),
							search.createColumn({
								name: "custrecord_da_gl_credit",
								label: "Credit Amount"
							}),
							search.createColumn({
								name: "custrecord_da_gl_debit",
								label: "Debit Amount"
							})
						]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_gl_data_base',
							id: result.id
						})
						return true;
					});

					var itemReceiptRec = record.load({
						type: 'itemreceipt',
						id: scriptContext.newRecord.id
					});
					var lineCount = itemReceiptRec.getLineCount({
						sublistId: 'item'
					});


					var postingPeriod = itemReceiptRec.getValue('postingperiod');
					var subsidiary = itemReceiptRec.getValue('subsidiary');
					var date = itemReceiptRec.getValue('trandate');
					var rounndingGainLoass = itemReceiptRec.getValue('custbody_da_rounding_gain_loss');
					var tranId = scriptContext.newRecord.id;
					var location = itemReceiptRec.getValue('location');
					var total = itemReceiptRec.getValue('custbody_da_subtotal');

					var createdFromText = itemReceiptRec.getText('createdfrom');
                    createdFromText = createdFromText.toString();
                    log.debug('createdFromText',  createdFromText.split(" "));
					if (createdFromText.split(" ")[0] == "Return") {

						var transactionSearchObj = search.create({
					   type: "transaction",
					   filters:
					   [
					      ["internalid","anyof",scriptContext.newRecord.id]
					   ],
					   columns:
					   [
					      search.createColumn({name: "trandate", label: "Date"}),
					      search.createColumn({name: "type", label: "Type"}),
					      search.createColumn({name: "tranid", label: "Document Number"}),
					      search.createColumn({name: "entity", label: "Name"}),
					      search.createColumn({name: "account", label: "Account"}),
					      search.createColumn({name: "memo", label: "Memo"}),
					      search.createColumn({name: "amount", label: "Amount"}),
					      search.createColumn({name: "creditamount", label: "Amount (Credit)"}),
					      search.createColumn({name: "debitamount", label: "Amount (Debit)"}),
					      search.createColumn({name: "location", label: "Location"})
					   ]
					});
					var searchResultCount = transactionSearchObj.runPaged().count;
					log.debug("transactionSearchObj result count",searchResultCount);
					transactionSearchObj.run().each(function(result){
					   var debitAmount = result.getValue('debitamount');
					   var creditAmount = result.getValue('creditamount');

					   var account = result.getValue('account');
					   var memo = result.getValue('memo');

					   var location = result.getValue('location');

					   if(debitAmount > 0){
					   	  var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', debitAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }

					   if(creditAmount > 0){
					   		var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', creditAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }
					   return true;
					});

					}else{
											
					if (total > 0) {
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', scriptContext.newRecord.getValue('custbody_da_accrued_purchase_account'));
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_credit', total.toFixed(3));
						//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item reciept
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.save();
					}
					//log.debug('createdFromText', createdFromText);
					//log.debug('total amount creating');
					log.debug('lineCount', lineCount);
					for (var i = 0; i < lineCount; i++) {
						var location = itemReceiptRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
						var amount = itemReceiptRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_line_amount_3_decimal',
							line: i
						});
                      var exchangeRate = itemReceiptRec.getValue('exchangerate');
						var invtAssetAccount = itemReceiptRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_asset_account',
							line: i
						});
                      var itemType = itemReceiptRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_type',
								line: i
							});
							if (itemType == 1) {
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_debit', (amount* exchangeRate).toFixed(3));
						//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.save();
                            }else{
                             var cogsAccount = itemReceiptRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_cogs_account',
									line: i
								});
                              
                              var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_debit', (amount* exchangeRate).toFixed(3));
						//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.save();
                            }
					}

					var transactionSearchObj = search.create({
					   type: "transaction",
					   filters:
					   [
					      ["internalid","anyof",scriptContext.newRecord.id], 
					      "AND", 
					      ["name","noneof",scriptContext.newRecord.getValue('entity')],
                         "AND", 
      						["memo","isnotempty",""]
					   ],
					   columns:
					   [
					      search.createColumn({name: "trandate", label: "Date"}),
					      search.createColumn({name: "type", label: "Type"}),
					      search.createColumn({name: "tranid", label: "Document Number"}),
					      search.createColumn({name: "entity", label: "Name"}),
					      search.createColumn({name: "account", label: "Account"}),
					      search.createColumn({name: "memo", label: "Memo"}),
					      search.createColumn({name: "amount", label: "Amount"}),
					      search.createColumn({name: "creditamount", label: "Amount (Credit)"}),
					      search.createColumn({name: "debitamount", label: "Amount (Debit)"}),
					      search.createColumn({name: "location", label: "Location"})
					   ]
					});
					var searchResultCount = transactionSearchObj.runPaged().count;
					log.debug("GL  result count",searchResultCount);
					transactionSearchObj.run().each(function(result){
					   var debitAmount = result.getValue('debitamount');
					   var creditAmount = result.getValue('creditamount');

					   var account = result.getValue('account');
					   var memo = result.getValue('memo');

					   var location = result.getValue('location');

					   if(debitAmount > 0){
					   	  var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', debitAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }

					   if(creditAmount > 0){
					   		var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', creditAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 16); // item receipt
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }
					   return true;
					});

				}

				var credit3DPAmt = 0;
	                        var debit3DPAmt = 0;
	                        customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
	               
	                            var credit3DP = result.getValue('custrecord_da_gl_credit');
	                            log.debug('credit3DP', credit3DP);
	                            var debit3DP = result.getValue('custrecord_da_gl_debit');
	                            log.debug('debit3DP', debit3DP);
	                            credit3DP = (credit3DP) ? credit3DP : 0;
	                            debit3DP = (debit3DP) ? debit3DP : 0;
	                            if(credit3DP > 0){
	                            	credit3DPAmt = parseFloat(credit3DPAmt) + parseFloat(credit3DP);
	                                log.debug('credit3DPAmt', credit3DPAmt);
	                            }
	                            else {
	                            	debit3DPAmt = parseFloat(debit3DPAmt) + parseFloat(debit3DP);
	                                log.debug('debit3DPAmt', debit3DPAmt);
	                            }
	                            
	                            return true;
	                        });
	                        if (Number(credit3DPAmt) != Number(debit3DPAmt)) {
	                            if (credit3DPAmt > debit3DPAmt) {
	                                var debitDiff = parseFloat(credit3DPAmt) - parseFloat(debit3DPAmt);
	                                log.debug('debitDiff', debitDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_debit', Number(debitDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecDebit = trialBalRec.save();
	                                log.debug('trialBalRecDebit', trialBalRecDebit);
	                            } else {
	                                var creditDiff = parseFloat(debit3DPAmt) - parseFloat(credit3DPAmt);
	                                log.debug('creditDiff', creditDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_credit', Number(creditDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecCredit = trialBalRec.save();
	                                log.debug('trialBalRecCredit', trialBalRecCredit);
	                            }
	                        }

				} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}
			return {
				beforeLoad: beforeLoad,
				beforeSubmit: beforeSubmit,
				afterSubmit: afterSubmit
			};
		});