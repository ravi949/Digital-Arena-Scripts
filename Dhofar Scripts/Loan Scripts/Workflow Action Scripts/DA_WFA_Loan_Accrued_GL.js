/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record', 'N/format'],
	function(search, record, format) {
		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @Since 2016.1
		 */
		function onAction(scriptContext) {
			try {
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_loan_accrued_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);
								var lender =  scriptContext.newRecord.getValue('custrecord_da_loan_acc_lender');
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_loan_settings",
					filters: [
						["custrecord_da_loan_setting_subsidiary", "anyof", subsidiaryId], "AND", ["custrecord_da_lender_loan", "anyof", lender]
					],
					columns: [
						search.createColumn({
							name: "name",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({
							name: "id",
							label: "ID"
						}),
						search.createColumn({
							name: "scriptid",
							label: "Script ID"
						}),
						search.createColumn({
							name: "custrecord_da_loan_setting_subsidiary",
							label: "Subsidiary"
						}),
						search.createColumn({
							name: "custrecord_da_interest_factor_loan",
							label: "Loan Interest Factor"
						}),
						search.createColumn({
							name: "custrecord_da_bank_cash_account",
							label: "Bank/Cash Account"
						}),
						search.createColumn({
							name: "custrecord_da_liability_account",
							label: "Loan Liability Account"
						}),
						search.createColumn({
							name: "custrecord_da_loan_interest_expense",
							label: "Loan Interest Expense Account"
						}),
						search.createColumn({
							name: "custrecord_da_loan_interest_payable_acc",
							label: "Loan Interest Payable Account"
						})
					]
				});
				var searchResultCount = customrecord_da_loan_settingsSearchObj.runPaged().count;
				log.debug("customrecord_da_loan_settingsSearchObj result count", searchResultCount);
				var loanExpenseAccount;
				var loanPayableAccount;
				customrecord_da_loan_settingsSearchObj.run().each(function(result) {
					loanExpenseAccount = result.getValue('custrecord_da_loan_interest_expense');
					log.debug('loanExpenseAccount', loanExpenseAccount);
					loanPayableAccount = result.getValue('custrecord_da_loan_interest_payable_acc');
					log.debug('loanPayableAccount', loanPayableAccount);
				});
				var accuredAmount = scriptContext.newRecord.getValue('custrecord_da_loan_accrued_loan_amt');
				var additionalAmount = scriptContext.newRecord.getValue('custrecord_da_accured_add_interest');
				var accuredAmount2d = Number(accuredAmount).toFixed(2);
				var additionalAmount2d = Number(additionalAmount).toFixed(2);
				var accuredAmount3d = Number(accuredAmount).toFixed(3);
				var additionalAmount3d = Number(additionalAmount).toFixed(3);
				if (accuredAmount) {
					var loanPaymentRec = record.create({
						type: "customtransaction_da_loan_accrued_intere",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custrecord_da_created_from_loan_accr', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
					//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_da_loan_accrued_release_date');
					log.debug('date', date);
					var parsedDateStringAsRawDateObject = format.parse({
						value: date,
						type: format.Type.DATE
					});
					loanPaymentRec.setValue('trandate', parsedDateStringAsRawDateObject);
					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanExpenseAccount
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: accuredAmount2d
					});
					try{
						loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: accuredAmount3d
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}		
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanPayableAccount
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: accuredAmount2d
					});
					try{
						loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value: accuredAmount3d
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}		
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					if (additionalAmount) {
						loanPaymentRec.selectNewLine({
							sublistId: 'line'
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: loanExpenseAccount
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: additionalAmount2d
						});
						try{
							loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_da_dr_3_decimal',
							value: additionalAmount3d
						});
						}
						catch (ex) {
				log.error(ex.name, ex.message);
			}		
						loanPaymentRec.commitLine({
							sublistId: 'line'
						});
						loanPaymentRec.selectNewLine({
							sublistId: 'line'
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: loanPayableAccount
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: additionalAmount2d
						});
						try{
							loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_da_cr_3_decimal',
							value: additionalAmount3d
						});
						}
						catch (ex) {
				log.error(ex.name, ex.message);
			}		
						loanPaymentRec.commitLine({
							sublistId: 'line'
						});
					}
					/*loanPaymentRec.setCurrentSublistValue({
						sublistId :'line',
						fieldId:'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_bank_loan_lender')
					})*/
					var accuralJournalId = loanPaymentRec.save();
					log.debug('accuralJournalId', accuralJournalId);
										
					record.submitFields({
						type: 'customrecord_da__loan_accrued_interest_s',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_loan_accrued_trans_no': accuralJournalId
						}
					});
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			onAction: onAction
		};
	});