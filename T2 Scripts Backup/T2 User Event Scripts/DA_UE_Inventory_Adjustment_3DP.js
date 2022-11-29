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
					var invAdjustmentRec = record.load({
						type: 'inventoryadjustment',
						id: scriptContext.newRecord.id
					});
					var lineCount = invAdjustmentRec.getLineCount({
						sublistId: 'inventory'
					});
					var postingPeriod = invAdjustmentRec.getValue('postingperiod');
					var subsidiary = invAdjustmentRec.getValue('subsidiary');
					var date = invAdjustmentRec.getValue('trandate');
					var rounndingGainLoass = invAdjustmentRec.getValue('custbody_da_rounding_gain_loss');
					var tranId = scriptContext.newRecord.id;
					var totalAmount = invAdjustmentRec.getValue('custbody_da_inventory_adjustment_amt');
					var department = invAdjustmentRec.getValue('department');
					var headerClass = invAdjustmentRec.getValue('class');
					var location = invAdjustmentRec.getValue('adjlocation');
					log.debug('total amount creating');
					var invAdjAccount = invAdjustmentRec.getValue('account');
					var glDatabaseRec = record.create({
						type: 'customrecord_da_gl_data_base'
					});
					glDatabaseRec.setValue('custrecord_da_gl_account', invAdjAccount);
					glDatabaseRec.setValue('custrecord_da_gl_date', date);
					if (totalAmount > 0) {
						glDatabaseRec.setValue('custrecord_da_gl_credit', (totalAmount).toFixed(3));
					} else {
						glDatabaseRec.setValue('custrecord_da_gl_debit', -(totalAmount).toFixed(3));
					}
					//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
					glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
					glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
					glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 11); // invt adjustment
					glDatabaseRec.setValue('custrecord_da_gl_department', department);
					glDatabaseRec.setValue('custrecord_da_gl_class', headerClass);
					glDatabaseRec.setValue('custrecord_da_gl_location', location);
					glDatabaseRec.save();
					log.debug('lineCount', lineCount);
					for (var i = 0; i < lineCount; i++) {
						var invtAssetAccount = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'custcol_da_item_asset_account',
							line: i
						});
						var adjQtyBy = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'adjustqtyby',
							line: i
						});

						var unitCost = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'unitcost',
							line: i
						});

						var lineClass = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'lineClass',
							line: i
						});
						var department = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'department',
							line: i
						});
						var location = invAdjustmentRec.getSublistValue({
							sublistId: 'inventory',
							fieldId: 'location',
							line: i
						});
						var memo = invAdjustmentRec.getSublistValue({
							sublistId: 'expense',
							fieldId: 'memo',
							line: i
						});

						if(adjQtyBy > 0){

							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', Number(adjQtyBy * unitCost).toFixed(3));
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 11); // inv adjustment
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', lineClass);
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();

						}else{

							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', -(Number(adjQtyBy * unitCost).toFixed(3)));
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 11); // inv adjustment
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', lineClass);
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
						}
					}
					//log.debug('sublists', sublists);
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