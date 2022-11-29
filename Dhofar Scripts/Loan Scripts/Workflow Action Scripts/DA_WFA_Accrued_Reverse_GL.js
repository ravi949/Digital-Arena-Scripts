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
								var lendor = scriptContext.newRecord.getValue('custrecord_da_bak_loan_lender');
				log.debug('subsidiaryId', subsidiaryId);
								var gls = [];
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_loan_settings",
					filters: [
						["custrecord_da_loan_setting_subsidiary", "anyof", subsidiaryId],"AND",["custrecord_da_lender_loan", "anyof", lendor]
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
				var accuredAmount = scriptContext.newRecord.getValue('custrecord_da_prior_periods_accrued_loan');
				var additionalAmount = scriptContext.newRecord.getValue('custrecord_da_add_accrued_amount');
				var origAmount = scriptContext.newRecord.getValue('custrecord_da_loan_interest_loan_amt');
				var origAddAmount = scriptContext.newRecord.getValue('custrecord_da_additionaal_int_amount');
				var accuredAmount2d = Number(accuredAmount).toFixed(2);
				var additionalAmount2d = Number(additionalAmount).toFixed(2);
				var origAmount2d = Number(origAmount).toFixed(2);
				var origAddAmount2d = Number(origAddAmount).toFixed(2);
				var accuredAmount3d = Number(accuredAmount).toFixed(3);
				var additionalAmount3d = Number(additionalAmount).toFixed(3);
				var origAmount3d = Number(origAmount).toFixed(3);
				var origAddAmount3d = Number(origAddAmount).toFixed(3);
				origAddAmount2d = (origAddAmount2d) ? origAddAmount2d: 0;
				origAddAmount3d = (origAddAmount3d) ? origAddAmount3d: 0;
				var creditAmount2d = (parseFloat(origAmount2d) + parseFloat( origAddAmount2d));
				var creditAmount3d = (parseFloat(origAmount3d) + parseFloat( origAddAmount3d));

				var accured = scriptContext.newRecord.getValue('custrecord_da_loan_interest_accrue');
				if (accured) {
					var loanPaymentRec = record.create({
						type: "customtransaction_da_loan_interest_payme",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custbody_da_created_from_bank_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan'));
					//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_loan_agree_interest_date');
					log.debug('date', date);
					var parsedDateStringAsRawDateObject = format.parse({
						value: date,
						type: format.Type.DATE
					});
					loanPaymentRec.setValue('trandate', parsedDateStringAsRawDateObject);

					var adjustingAmount2d = parseFloat(origAmount2d) - parseFloat(accuredAmount2d);
					var adjustingAmount3d = parseFloat(origAmount3d) - parseFloat(accuredAmount3d);

					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanExpenseAccount
					});
					log.debug('adjustingAmount2d', Number(adjustingAmount2d).toFixed(2));
					log.debug('adjustingAmount3d', Number(adjustingAmount3d).toFixed(3));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: Number(adjustingAmount2d).toFixed(2)
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: Number(adjustingAmount3d).toFixed(3)
					});
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
					log.debug('adjustingAmount2d', Number(adjustingAmount2d).toFixed(2));
						log.debug('adjustingAmount3d', Number(adjustingAmount3d).toFixed(3));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: Number(adjustingAmount2d).toFixed(2)
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value: Number(adjustingAmount3d).toFixed(3)
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					if(additionalAmount){
						var addAdjustAmount2d = parseFloat(origAddAmount2d) - parseFloat(additionalAmount2d);
						var addAdjustAmount3d = parseFloat(origAddAmount3d) - parseFloat(additionalAmount3d);
						loanPaymentRec.selectNewLine({
							sublistId: 'line'
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: loanExpenseAccount
						});
						log.debug('addAdjustAmount', Number(addAdjustAmount2d).toFixed(2));
						log.debug('addAdjustAmount3d', Number(addAdjustAmount3d).toFixed(3));
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: Number(addAdjustAmount2d).toFixed(2)
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_da_dr_3_decimal',
							value: Number(addAdjustAmount3d).toFixed(3)
						});
						
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
						log.debug('addAdjustAmount2d', Number(addAdjustAmount2d).toFixed(2));
						log.debug('addAdjustAmount3d', Number(addAdjustAmount3d).toFixed(3));
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: Number(addAdjustAmount2d).toFixed(2)
						});
						loanPaymentRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_da_cr_3_decimal',
							value: Number(addAdjustAmount3d).toFixed(3)
						});
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
						type: 'customrecord_da_loan_interest_payment_sc',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_int_sch_reverese_gl': accuralJournalId
						}
					});
				}

				var paymentPeriod = scriptContext.newRecord.getValue('custrecord_da_interest_schedule_period')

				var confirmPreviousPeriods = scriptContext.newRecord.getValue('custrecord_da_paying_previous_periods_cb');
				if(confirmPreviousPeriods){
					var previousPeriods = scriptContext.newRecord.getValue('custrecord_da_accrued_period');
					log.debug('previousPeriods', previousPeriods);

					var customrecord_da_loan_interest_payment_scSearchObj = search.create({
						 type: "customrecord_da_loan_interest_payment_sc",
						 filters:
						 [
								["custrecord_da_created_from_loan","anyof",scriptContext.newRecord.getValue('custrecord_da_created_from_loan')], 
								"AND", 
								["custrecord_da_interest_schedule_period","anyof",previousPeriods],						      
								"AND", 
									[["custrecord_da_loan_interest_accrue","is","T"],"OR",["custrecord_da_paying_previous_periods_cb","is","T"]]
						 ],
						 columns:
						 [
								search.createColumn({
									 name: "id",
									 sort: search.Sort.ASC,
									 label: "ID"
								}),
								search.createColumn({name: "scriptid", label: "Script ID"}),
								search.createColumn({name: "custrecord_da_loan_interest_from", label: "From"}),
								search.createColumn({name: "custrecord_da_loan_interest_to", label: "To"}),
								search.createColumn({name: "custrecord_loan_agree_interest_date", label: "Interest Date"}),
								search.createColumn({name: "custrecord_da_loan_interest_loan_amt", label: "Interest Amount"}),
								search.createColumn({name: "custrecord_da_additionaal_int_amount", label: "Additional Interest Amount"}),
								search.createColumn({name: "custrecord_da_prior_periods_accrued_loan", label: "Prior Periods Accrued Amt"}),
								search.createColumn({name: "custrecord_da_add_accrued_amount", label: "Additional Accrued Amt"}),
								search.createColumn({name: "custrecord_da_loan_interest_trans_no", label: "Transaction#"}),
								search.createColumn({name: "custrecord_da_loan_interest_status", label: "Interest Status"}),
								search.createColumn({name: "custrecord_da_loan_interest_accrue", label: "Accrue?"}),
								search.createColumn({name: "custrecord_da_interest_schedule_period", label: "Payment Period"})
						 ]
					});
					var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
					log.debug("customrecord_da_loan_interest_payment_scSearchObj result count",searchResultCount);
					customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result){
						 var loanPaymentRec = record.create({
							type: "customtransaction_da_loan_interest_payme",
							isDynamic: true
						});
						loanPaymentRec.setValue('subsidiary', subsidiaryId);
						loanPaymentRec.setValue('custbody_da_created_from_bank_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan'));
						//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
						var date = scriptContext.newRecord.getValue('custrecord_loan_agree_interest_date');
						log.debug('date', date);
						var parsedDateStringAsRawDateObject = format.parse({
							value: date,
							type: format.Type.DATE
						});
					loanPaymentRec.setValue('trandate', parsedDateStringAsRawDateObject);

					var accuredAmount = Number(result.getValue('custrecord_da_loan_interest_loan_amt')).toFixed(2);
					var additionalAmount = Number(result.getValue('custrecord_da_additionaal_int_amount')).toFixed(2);
					var priorAccuredAmount = Number(result.getValue('custrecord_da_prior_periods_accrued_loan')).toFixed(2);
					var addIntAmount = Number(result.getValue('custrecord_da_add_accrued_amount')).toFixed(2);
					var total = parseFloat(accuredAmount) + parseFloat(additionalAmount);
												
												log.debug('details', 'accuredAmount'+ accuredAmount +'additionalAmount' + additionalAmount + 'priorAccuredAmount' + priorAccuredAmount +'addIntAmount' + addIntAmount);
											 
												
												var paymentPeriod1 =  result.getValue('custrecord_da_interest_schedule_period');
												
												log.debug('paymentPeriod', paymentPeriod);
												 log.debug('previousPeriods', previousPeriods);
												log.debug('check', arrayContains(previousPeriods, paymentPeriod));

					if(paymentPeriod == paymentPeriod1){
												
												log.debug('if');

						loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanExpenseAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					var debitAmount =  parseFloat(accuredAmount) - parseFloat(priorAccuredAmount);
												log.debug('debitAmount', debitAmount);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: debitAmount.toFixed(2)
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					if(additionalAmount){
						loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanExpenseAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					var adjAmount = parseFloat(additionalAmount) - parseFloat(addIntAmount);
												log.debug('adjAmount', adjAmount);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: adjAmount.toFixed(2)
					});
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
						value: loanPayableAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: priorAccuredAmount
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: cashAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: accuredAmount
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					if(additionalAmount){
												loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanPayableAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: addIntAmount
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
						loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: cashAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: additionalAmount
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					}
				

					}else{

						loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: loanPayableAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: accuredAmount
					});
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
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: additionalAmount
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: cashAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: total.toFixed(2)
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});

					}

					var accuralJournalId = loanPaymentRec.save();
												
					log.debug('accuralJournalId', accuralJournalId);
												gls.push(accuralJournalId);
					

					
						 return true;
					});
										
										record.submitFields({
						type: 'customrecord_da_loan_interest_payment_sc',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_loan_payment_transaction': gls
						}
					});


				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		function arrayContains(arr, searchFor){
			log.debug('searchFor', searchFor);
			log.debug('arr', arr);
	if(typeof arr.includes == 'undefined'){
			var arrLength = arr.length;
			for (var i = 0; i < arrLength; i++) {
					if (arr[i] === searchFor) {
							return true;
					}
			}
			return false;
	}
	return arr.includes(searchFor);
}
		
		function findValueInArray(value,arr){
var result = false;

for(var i=0; i<arr.length; i++){
	var name = arr[i];
	if(name == value){
		result = true;
		break;
	}
}

return result;
}
		return {
			onAction: onAction
		};
	});
