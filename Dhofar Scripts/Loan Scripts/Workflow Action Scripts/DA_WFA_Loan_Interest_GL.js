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
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_loan_interest_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);
									var lender = scriptContext.newRecord.getValue('custrecord_da_bak_loan_lender');
				log.debug('subsidiaryId', subsidiaryId);
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_loan_settings",
					filters: [
						["custrecord_da_loan_setting_subsidiary", "anyof", subsidiaryId],"AND",["custrecord_da_lender_loan","anyof", lender]
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
				var cashAccount ;
				customrecord_da_loan_settingsSearchObj.run().each(function(result) {
					loanExpenseAccount = result.getValue('custrecord_da_loan_interest_expense');
					log.debug('loanExpenseAccount', loanExpenseAccount);
					loanPayableAccount = result.getValue('custrecord_da_loan_interest_payable_acc');
					log.debug('loanPayableAccount', loanPayableAccount);
					cashAccount = result.getValue('custrecord_da_bank_cash_account');
				});
				var debitRunning = 0;
				var accuredAmount = Number(scriptContext.newRecord.getValue('custrecord_da_prior_periods_accrued_loan'));
				var additionalAmount = Number(scriptContext.newRecord.getValue('custrecord_da_add_accrued_amount'));
				var origAmount = Number(scriptContext.newRecord.getValue('custrecord_da_loan_interest_loan_amt'));
				var origAddAmount = Number(scriptContext.newRecord.getValue('custrecord_da_additionaal_int_amount'));
				var accuredAmount2d = Number(accuredAmount).toFixed(2);
				var origAmount2d = Number(origAmount).toFixed(2);
				var additionalAmount2d = Number(additionalAmount).toFixed(2);
				var origAddAmount2d = Number(origAddAmount).toFixed(2);
				var accuredAmount3d = Number(accuredAmount).toFixed(3);
				var origAmount3d = Number(origAmount).toFixed(3);
				var additionalAmount3d = Number(additionalAmount).toFixed(3);
				var origAddAmount3d = Number(origAddAmount).toFixed(3);
				origAddAmount2d = (origAddAmount2d) ? origAddAmount2d: 0;
				origAddAmount3d = (origAddAmount3d) ? origAddAmount3d: 0;
				var creditAmount2d = (parseFloat(origAmount2d) + parseFloat( origAddAmount2d));
				var creditAmount3d = (parseFloat(origAmount3d) + parseFloat( origAddAmount3d));
				if (accuredAmount) {
					var loanPaymentRec = record.create({
						type: "customtransaction_da_loan_interest_payme",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custbody_da_created_from_bank_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan'));
                  loanPaymentRec.setValue('custbody_da_created_from_bank_loan_', scriptContext.newRecord.id);
					//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_loan_agree_interest_date');
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
						value: loanPayableAccount
					});
					log.debug('accuredAmount2d debit', accuredAmount2d);
                    debitRunning = parseFloat(debitRunning) + parseFloat(accuredAmount2d);
                    log.debug('debitRunning',debitRunning);
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
					
					if (additionalAmount) {
						
						loanPaymentRec.selectNewLine({
							sublistId: 'line'
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: loanPayableAccount
						});
						log.debug('additionalAmount2d debit', additionalAmount2d);
                    debitRunning = parseFloat(debitRunning) + parseFloat(additionalAmount2d);
                    log.debug('debitRunning',debitRunning);
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
					}

					var adjustingAmount2d = parseFloat(origAmount) - parseFloat(accuredAmount);
                    adjustingAmount2d = adjustingAmount2d.toFixed(2);
					var adjustingAmount3d = parseFloat(origAmount) - parseFloat(accuredAmount);
                    adjustingAmount3d = adjustingAmount3d.toFixed(3);

					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanExpenseAccount
					});
					log.debug('adjustingAmount2d debit', adjustingAmount2d);
                    debitRunning = parseFloat(debitRunning) + parseFloat(adjustingAmount2d);
                    log.debug('debitRunning',debitRunning);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: adjustingAmount2d 
					});
					try{
						loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: adjustingAmount3d
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}		
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					if(additionalAmount){
						var addAdjustAmount2d = parseFloat(origAddAmount) - parseFloat(additionalAmount);
                        addAdjustAmount2d = addAdjustAmount2d.toFixed(2);
                        var addAdjustAmount3d = parseFloat(origAddAmount) - parseFloat(additionalAmount);
						loanPaymentRec.selectNewLine({
							sublistId: 'line'
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: loanExpenseAccount
						});
						log.debug('addAdjustAmount2d debit', addAdjustAmount2d);
                    debitRunning = parseFloat(debitRunning) + parseFloat(addAdjustAmount2d);
                    log.debug('debitRunning',debitRunning);
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: addAdjustAmount2d
						});
						try{
							loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_da_dr_3_decimal',
							value: Number(addAdjustAmount3d).toFixed(3)
						});
						}
						catch (ex) {
				log.error(ex.name, ex.message);
			}		
						loanPaymentRec.commitLine({
							sublistId: 'line'
						});
					}
					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: cashAccount
					});
					log.debug('creditAmount2d credit', creditAmount2d);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: Number(debitRunning).toFixed(2)
					});
					try{
						loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value: Number(creditAmount3d)
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}		
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					/*loanPaymentRec.setCurrentSublistValue({
						sublistId :'line',
						fieldId:'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_bank_loan_lender')
					})*/
					var accuralJournalId = loanPaymentRec.save();

					log.debug('accuralJournalId', accuralJournalId);
					record.submitFields({
						type: 'customrecord_da_loan_interest_payment_sc',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_loan_interest_trans_no': accuralJournalId
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