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
				var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_bond_interest_subsidiary');
				log.debug('subsidiaryId', subsidiaryId);
				var customrecord_da_loan_settingsSearchObj = search.create({
					type: "customrecord_da_bond_accounting_sett",
					filters: [
						["custrecord_da_bond_sett_subsidiary", "anyof", subsidiaryId]
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
							name: "custrecord_da_bond_sett_subsidiary",
							label: "Subsidiary"
						}),							
						search.createColumn({
							name: "custrecord_da_bond_bank_cash_account",
							label: "Bank/Cash Account"
						}),
						search.createColumn({
							name: "custrecord_da_bond_issuance_liab_acc",
							label: "Loan Liability Account"
						}),
						search.createColumn({
							name: "custrecord_da_interest_expense",
							label: "Loan Interest Expense Account"
						}),
						search.createColumn({
							name: "custrecord_da_bond_interest_payable",
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
					loanExpenseAccount = result.getValue('custrecord_da_interest_expense');
					log.debug('loanExpenseAccount', loanExpenseAccount);
					loanPayableAccount = result.getValue('custrecord_da_bond_interest_payable');
					log.debug('loanPayableAccount', loanPayableAccount);
					cashAccount = result.getValue('custrecord_da_bond_bank_cash_account');
				});
				var accuredAmount = scriptContext.newRecord.getValue('custrecord_da_prior_periods_accrued_amt');
				var origAmount = scriptContext.newRecord.getValue('custrecord_da_bond_interest_bond_amt');
				var accuredAmount2d = Number(accuredAmount).toFixed(2);
				var origAmount2d = Number(origAmount).toFixed(2);
				var accuredAmount3d = Number(accuredAmount).toFixed(3);
				var origAmount3d = Number(origAmount).toFixed(3);
				var expenseAmount2d = (parseFloat(origAmount2d) - parseFloat(accuredAmount2d));
				var expenseAmount3d = (parseFloat(origAmount3d) - parseFloat(accuredAmount3d));

				var compoundable = scriptContext.newRecord.getValue('custrecord_da_loan_compoundable_tp');

				var loanPaymentRec = record.create({
						type: "customtransaction_da_bond_interest_payme",
						isDynamic: true
					});
					loanPaymentRec.setValue('subsidiary', subsidiaryId);
					loanPaymentRec.setValue('custbody_da_created_from_bond', scriptContext.newRecord.getValue('custrecord_da_created_from_bond'));
					//loanPaymentRec.setValue('custbody_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
					var date = scriptContext.newRecord.getValue('custrecord_da_bond_interest_to');
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
						value: cashAccount
					});
					//log.debug('creditAmount', creditAmount);
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: origAmount2d
					});
					try{
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_cr_3_decimal',
						value: origAmount3d
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
						value: loanExpenseAccount
					});
					//log.debug('adjustingAmount', adjustingAmount.toFixed(2));
					loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: Number(expenseAmount2d).toFixed(2)
					});
					try{
						loanPaymentRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'custcol_da_dr_3_decimal',
						value: Number(expenseAmount3d).toFixed(3)
					});
					}
					
					catch (ex) {
				log.error(ex.name, ex.message);
			}
					loanPaymentRec.commitLine({
						sublistId: 'line'
					});
					var accuralJournalId = loanPaymentRec.save();
									
									
					log.debug('accuralJournalId', accuralJournalId);
								scriptContext.newRecord.setValue('custrecord_da_accrued_gl_transaction', accuralJournalId);
					record.submitFields({
						type: 'customrecord_da_bind_interest_payment_sc',
						id: scriptContext.newRecord.id,
						values: {
							'custrecord_da_accrued_gl_transaction': accuralJournalId
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