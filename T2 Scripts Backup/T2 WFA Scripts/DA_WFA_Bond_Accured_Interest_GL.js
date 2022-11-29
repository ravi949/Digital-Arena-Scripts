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
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_bond_accrued_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);

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
					log.debug('cashAccount', cashAccount);
				});
				    var accuredAmount = scriptContext.newRecord.getValue('custrecord_da_bond_accrued_bond_amt').toFixed(2);
                var accuredAmount3dp = scriptContext.newRecord.getValue('custrecord_da_bond_accrued_bond_amt').toFixed(3);

              var loanPaymentRec = record.create({
						type: "customtransaction_da_bond_accrued_intere",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custbody_da_created_from_bond', scriptContext.newRecord.getValue('custrecord_da_created_from_bond_accr'));
					//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_da_bond_accrued_release_date');
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
					log.debug('accuredAmount', accuredAmount);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: accuredAmount
					});
              
              try{
                loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value: accuredAmount3dp
					});
              }catch(ex){
                log.error(ex.name,ex.message);
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
						value: loanExpenseAccount
					});
					//log.debug('creditAmount', creditAmount);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: accuredAmount
					});
                 try{
                loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: accuredAmount3dp
					});
              }catch(ex){
                log.error(ex.name,ex.message);
              }

					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					var accuralJournalId = loanPaymentRec.save();

					log.debug('accuralJournalId', accuralJournalId);
					record.submitFields({
						type: 'customrecord_bond_accrued_interest_sched',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_bond_accrued_trans_no': accuralJournalId
						}
					});
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		return {
			onAction: onAction
		};
	});
