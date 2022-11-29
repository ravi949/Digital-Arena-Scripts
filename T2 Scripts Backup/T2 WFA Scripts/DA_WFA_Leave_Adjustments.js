/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record','N/search','N/format'],
	function(record, search, format) {
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
				var recId = scriptContext.newRecord.id;
				var empId = scriptContext.newRecord.getValue('custrecord_da_leave_adj_employee');
				var empRecord = record.load({
					type: 'employee',
					id: empId
				});
				var empSubsidiary = empRecord.getValue('custentity_da_work_for_subsidiary');
				var grossSalary = empRecord.getValue('custentity_total_salary');
				var adjustmentDays = scriptContext.newRecord.getValue('custrecord_da_leave_adj_days');
				var workingDaysPerMonth = 0;
				var customrecord_da_general_settingsSearchObj = search.create({
					type: "customrecord_da_general_settings",
					filters: [
						["custrecord_da_settings_subsidiary", "anyof", empSubsidiary]
					],
					columns: [
						search.createColumn({
							name: "scriptid",
							sort: search.Sort.ASC,
							label: "Script ID"
						}),
						search.createColumn({
							name: "custrecord_da_settings_subsidiary",
							label: "Subsidiary"
						}),
						search.createColumn({
							name: "custrecord_da_system_start_date",
							label: "System Start Date"
						}),
						search.createColumn({
							name: "custrecord_da_leave_balance_period",
							label: "Leave balance period (Yearly or Monthly)"
						}),
						search.createColumn({
							name: "custrecord_da_setting_working_days",
							label: "Working Days Per Month"
						})
					]
				});
				var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
				log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
				customrecord_da_general_settingsSearchObj.run().each(function(result) {
					workingDaysPerMonth = result.getValue('custrecord_da_setting_working_days');
					return true;
				});
				var customrecord_da_accrualsSearchObj = search.create({
					type: "customrecord_da_accruals",
					filters: [
						["custrecord_da_accruals_subsidiary", "anyof", empSubsidiary],
						"AND",
						["custrecord_da_acc_main_category", "anyof", "41"]
					],
					columns: [
						search.createColumn({
							name: "name",
							sort: search.Sort.ASC,
							label: "ID"
						}),
						search.createColumn({
							name: "custrecord_da_accruals_subsidiary",
							label: "Works For (Subsidiary)"
						}),
						search.createColumn({
							name: "custrecord_da_accruals_item_category",
							label: "Item Category"
						}),
						search.createColumn({
							name: "custrecord_da_accruals_account",
							label: "Expense Account"
						}),
						search.createColumn({
							name: "custrecord_da_income_account",
							label: "Liability Account"
						})
					]
				});
				var searchResultCount = customrecord_da_accrualsSearchObj.runPaged().count;
				log.debug("customrecord_da_accrualsSearchObj result count", searchResultCount);
				var expenseAccount, liablityAccount;
				customrecord_da_accrualsSearchObj.run().each(function(result) {
					// .run().each has a limit of 4,000 results
					expenseAccount = result.getValue('custrecord_da_accruals_account');
					liablityAccount = result.getValue('custrecord_da_income_account');
					return true;
				});
				var department = empRecord.getValue('department');
				var empClass = empRecord.getValue('class');
				var location = empRecord.getValue('location');
				var date = scriptContext.newRecord.getValue('custrecord_da_leave_adjustment_date');
				log.debug('date', date);
				var parsedDateStringAsRawDateObject = format.parse({
					value: date,
					type: format.Type.DATE
				});
				var accuralJournalRec = record.create({
					type: "customtransaction_da_accruals_journal",
					isDynamic: true
				});
				accuralJournalRec.setValue('subsidiary', empSubsidiary);
				accuralJournalRec.setValue('custbody_da_ic_paycheck_employee', empId);
				//accuralJournalRec.setValue('custbody_da_accruals_sheet', payrollItemId);
				accuralJournalRec.setValue('department', department);
				accuralJournalRec.setValue('class', empClass);
              accuralJournalRec.setValue('transtatus', "B");
				accuralJournalRec.setValue('location', location);
				accuralJournalRec.setValue('trandate', parsedDateStringAsRawDateObject);
				var additionalAmount = (grossSalary * adjustmentDays) / workingDaysPerMonth;
				additionalAmount = additionalAmount.toFixed(2);
              scriptContext.newRecord.setValue('custrecord_da_leave_adjustment_amount', -(additionalAmount));
				if (true) {
					accuralJournalRec.selectNewLine({
						sublistId: 'line'
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: expenseAccount
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'debit',
						value: additionalAmount
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'memo',
						value: "Leave adjustment Amount"
					});
					accuralJournalRec.commitLine({
						sublistId: 'line'
					});
					//credit
					accuralJournalRec.selectNewLine({
						sublistId: 'line'
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'account',
						value: liablityAccount
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'credit',
						value: additionalAmount
					});
					accuralJournalRec.setCurrentSublistValue({
						sublistId: 'line',
						fieldId: 'memo',
						value: "Leave Adjustment Amount"
					});
					accuralJournalRec.commitLine({
						sublistId: 'line'
					});
				}
				var accuralJournalId = accuralJournalRec.save();
				log.debug('accuralJournalId', accuralJournalId);
              
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			onAction: onAction
		};
	});