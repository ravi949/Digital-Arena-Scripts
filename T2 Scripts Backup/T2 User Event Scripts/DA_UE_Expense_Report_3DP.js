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
					var expenseReportRec = record.load({
						type: 'expensereport',
						id: scriptContext.newRecord.id
					});
					var accountingApproval = expenseReportRec.getValue('accountingapproval');
					if (accountingApproval) {
						var lineCount = expenseReportRec.getLineCount({
							sublistId: 'expense'
						});
						var postingPeriod = expenseReportRec.getValue('postingperiod');
						var subsidiary = expenseReportRec.getValue('subsidiary');
						var rounndingGainLoass = expenseReportRec.getValue('custbody_da_rounding_gain_loss');
						var date = expenseReportRec.getValue('trandate');
						var tranId = scriptContext.newRecord.id;
						var employeeId = expenseReportRec.getValue('entity');
                        var empDepartment = expenseReportRec.getValue('department');
						var empLocation = expenseReportRec.getValue('location');
						var empRecord = record.load({
							type: 'employee',
							id: employeeId
						})
						
						var totalAmount = expenseReportRec.getValue('custbody_da_total_reimbursable_amt');
						if (totalAmount > 0) {
							log.debug('total amount creating');
							var accntPayableAccount = expenseReportRec.getValue('custbody_da_employee_ap_account');
							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', accntPayableAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', (totalAmount));
							//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
							glDatabaseRec.setValue('custrecord_da_gl_employee', employeeId);
							glDatabaseRec.setValue('custrecord_da_gl_department', empDepartment);
							glDatabaseRec.setValue('custrecord_da_gl_location', empLocation);
							glDatabaseRec.save();
						}
						var advanceToApply = expenseReportRec.getValue('advance');
						if (advanceToApply > 0) {
							log.debug('advance amount creating');
							var advanceApplyAccount = expenseReportRec.getValue('custbody_da_advances_to_apply');
							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', advanceApplyAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', advanceToApply);
							//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
							glDatabaseRec.setValue('custrecord_da_gl_employee', employeeId);
							glDatabaseRec.setValue('custrecord_da_gl_department', empDepartment);
							glDatabaseRec.setValue('custrecord_da_gl_location', empLocation);
							glDatabaseRec.save();
						}
						var vatAmount = expenseReportRec.getValue('custbody_da_vat_on_report');
						if (vatAmount != 0) {
							log.debug('vat amount creating');
							var vatAccount = expenseReportRec.getValue('custbody_da_vat_on_purchase_acc_bill');
							var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', vatAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', -(vatAmount));
							//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('custbody_da_tax_authority_ns'));
							glDatabaseRec.setValue('custrecord_da_gl_department', empDepartment);
							glDatabaseRec.setValue('custrecord_da_gl_location', empLocation);
							glDatabaseRec.save();
						}
						log.debug('lineCount', lineCount);
						for (var i = 0; i < lineCount; i++) {
							var expenseAccount = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'expenseaccount',
								line: i
							});
							var memo = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'category_display',
								line: i
							});
							log.debug('expenseAccount', expenseAccount);
							var isnonreimbursable = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'isnonreimbursable',
								line: i
							});
							var amount3DP = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'custcol_da_amount_3_decimal_expense_r',
								line: i
							});
							var department = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'department',
								line: i
							});
							var lineClass = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'class',
								line: i
							});
							var location = expenseReportRec.getSublistValue({
								sublistId: 'expense',
								fieldId: 'location',
								line: i
							});
							if (isnonreimbursable) {
								log.debug('rem creating');
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', expenseAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', amount3DP);
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
								glDatabaseRec.setValue('custrecord_da_gl_department', department);
								glDatabaseRec.setValue('custrecord_da_gl_class', lineClass);
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', expenseAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_credit', amount3DP);
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
								glDatabaseRec.setValue('custrecord_da_gl_department', department);
								glDatabaseRec.setValue('custrecord_da_gl_class', lineClass);
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
							} else {
								log.debug('non rem creating');
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', expenseAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', amount3DP);
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 28); // expensereport
								glDatabaseRec.setValue('custrecord_da_gl_department', department);
								glDatabaseRec.setValue('custrecord_da_gl_class', lineClass);
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
							}
						}
						//log.debug('sublists', sublists);
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