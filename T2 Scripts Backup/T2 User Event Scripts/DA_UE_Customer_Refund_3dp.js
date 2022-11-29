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
					var scriptObj = runtime.getCurrentScript();
					if (true) {
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
						var custRefundRec = record.load({
							type: 'customerrefund',
							id: scriptContext.newRecord.id,
							isDynamic: true
						});
						var lineCount = custRefundRec.getLineCount({
							sublistId: 'item'
						});
						var unitCost = 0;
						
						var postingPeriod = custRefundRec.getValue('postingperiod');
						var subsidiary = custRefundRec.getValue('subsidiary');
						var createdFrom = custRefundRec.getValue('createdfrom');
						var date = custRefundRec.getValue('trandate');
						var tranId = scriptContext.newRecord.id;
						var location = custRefundRec.getValue('location');
						var department = custRefundRec.getValue('department');
						var headClass = custRefundRec.getValue('class');
						var total = custRefundRec.getValue('custbody_da_total_3_decimal');
						if (total < 0) {
							total = -(total);
						}
						var memo = custRefundRec.getValue('memo');
						var rounndingGainLoass = custRefundRec.getValue('custbody_da_rounding_gain_loss');
						var subTotal = custRefundRec.getValue('custbody_da_subtotal');
						var taxHeaderAmount = custRefundRec.getValue('custbody_da_tax_header_amount_complia');
						var headerDiscount = custRefundRec.getValue('custbody_da_header_discount');
						log.debug('deatils', subTotal + "taxHeaderAmount" + taxHeaderAmount + " headerDiscount" + headerDiscount);
						//total = parseFloat(subTotal) + parseFloat(taxHeaderAmount) + parseFloat(headerDiscount);
						if (total > 0) {
							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', scriptContext.newRecord.getValue('custbody_da_customer_ar_account'));
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', total.toFixed(3));
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 30); // invoice
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
							glDatabaseRec.save();

							var bankAccount = custRefundRec.getValue('account');
							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', bankAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', total.toFixed(3));
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 30); // invoice
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
							glDatabaseRec.save();
						}
						
						custRefundRec.save();
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