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
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_bank_loan_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);
              var lender = scriptContext.newRecord.getValue('custrecord_da_lender');
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_loan_settings",
					filters: [
						["custrecord_da_loan_setting_subsidiary", "anyof", subsidiaryId],"AND",["custrecord_da_lender_loan", "anyof", lender]
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
					var cashAcc = result.getValue('custrecord_da_bank_cash_account');
					var liablity = result.getValue('custrecord_da_liability_account');
					var amount = scriptContext.newRecord.getValue('custrecord_da_total_amount_of_loan');

					var loanIssuanceRec = record.create({
						type: "customtransaction_da_loan_issuance",
						isDynamic: true
					});
					loanIssuanceRec.setValue('subsidiary', subsidiaryId);
					loanIssuanceRec.setValue('custbody_da_created_from_bank_loan', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_da_loan_date');
					log.debug('date', date);
					var parsedDateStringAsRawDateObject = format.parse({
						value: date,
						type: format.Type.DATE
					});
					loanIssuanceRec.setValue('trandate', parsedDateStringAsRawDateObject);
					//loanIssuanceRec.setValue('postingperiod', pperiod);
					loanIssuanceRec.selectNewLine({
						sublistId: 'line'
					});
					loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: cashAcc
					});
					loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: Number(amount).toFixed(2)
					});
					try{
						loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: Number(amount).toFixed(3)
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}		
					
					loanIssuanceRec.setCurrentSublistValue({
						sublistId :'line',
						fieldId:'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_lender')
					})
					loanIssuanceRec.commitLine({
						sublistId: 'line'
					});
					//credit
					loanIssuanceRec.selectNewLine({
						sublistId: 'line'
					});
					loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: liablity
					});
					loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value:  Number(amount).toFixed(2)
					});
					try{
						loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value:  Number(amount).toFixed(3)
					});
					}
					catch (ex) {
				log.error(ex.name, ex.message);
			}
					
					loanIssuanceRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'entity',
						value: scriptContext.newRecord.getValue('custrecord_da_lender')
					});
					loanIssuanceRec.commitLine({
						sublistId: 'line'
					});
					var accuralJournalId = loanIssuanceRec.save();
					log.debug('accuralJournalId', accuralJournalId);
					//scriptContext.newRecord.setValue('custrecord_da_loan_pay_tran_no', accuralJournalId);
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
