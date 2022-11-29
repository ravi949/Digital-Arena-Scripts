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
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_bl_agrmnt_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);
				var loanPaymentAmt = scriptContext.newRecord.getValue('custrecord_da_loan_payment');
				var loanPaymentAmt2DP = Number(loanPaymentAmt).toFixed(2);
				var loanPaymentAmt3DP = Number(loanPaymentAmt).toFixed(3);
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_loan_settings",
					filters: [
						["custrecord_da_loan_setting_subsidiary", "anyof", subsidiaryId]
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
				customrecord_da_loan_settingsSearchObj.run().each(function(result) {
					var loanPaymentRec = record.create({
						type: "customtransaction_da_loan_settlement",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custbody_da_created_from_bank_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
					loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_da_loan_payment_date');
					log.debug('date', date);
					var parsedDateStringAsRawDateObject = format.parse({
						value: date,
						type: format.Type.DATE
					});
					loanPaymentRec.setValue('trandate', parsedDateStringAsRawDateObject);
					//loanPaymentRec.setValue('postingperiod', pperiod);
					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: result.getValue('custrecord_da_liability_account')
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: loanPaymentAmt2DP
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: loanPaymentAmt3DP
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId :'line',
						fieldId:'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_bank_loan_lender')
					})					
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					//credit
					loanPaymentRec.selectNewLine({
						sublistId: 'line'
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: result.getValue('custrecord_da_bank_cash_account')
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value:  loanPaymentAmt2DP
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value:  loanPaymentAmt3DP
					});
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_bank_loan_lender')
					});
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					var accuralJournalId = loanPaymentRec.save();
					log.debug('accuralJournalId', accuralJournalId);
                    record.submitFields({
                      type:'customrecord_da_bank_loan_agreement',
                      id: scriptContext.newRecord.id,
                      values:{
                        'custrecord_da_loan_pay_tran_no': accuralJournalId
                      }
                    });
					//scriptContext.newRecord.setValue('custrecord_da_loan_pay_tran_no', accuralJournalId);
                    record.load({
                      type:'customrecord_da_bank_loan',
					  id : scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree')
				    }).save();
                   
					//return true;
				});
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			onAction: onAction
		};
	});