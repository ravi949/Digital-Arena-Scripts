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
				var loanDate = scriptContext.newRecord.getValue('custrecord_da_loan_date');
				log.debug('subsidiaryId', loanDate.getDate());
				log.debug('subsidiaryId', new Date(loanDate).getDate());
				var customrecord_da_loan_interest_payment_scSearchObj = search.create({
					type: "customrecord_da_loan_interest_payment_sc",
					filters: [
						["custrecord_da_created_from_loan", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						})
					]
				});
				var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
				log.debug("customrecord_da_loan_interest_payment_scSearchObj result count", searchResultCount);
				customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result) {
					/*record.delete({
						type: 'customrecord_da_loan_interest_payment_sc',
						id: result.id
					})*/
					return true;
				});
				var customrecord_da_bank_loan_agreementSearchObj = search.create({
					type: "customrecord_da_bank_loan_agreement",
					filters: [
						["custrecord_da_created_from_loan_agree", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "id",
							label: "ID"
						}),
						search.createColumn({
							name: "scriptid",
							label: "Script ID"
						}),
						search.createColumn({
							name: "custrecord_da_loan_payment_date",
							sort: search.Sort.DESC,
							label: "Payment Date"
						}),
						search.createColumn({
							name: "custrecord_da_loan_payment",
							label: "Loan Payment"
						}),
						search.createColumn({
							name: "custrecord_da_loan_pay_tran_no",
							label: "Transaction#"
						})
					]
				});
				var searchResultCount = customrecord_da_bank_loan_agreementSearchObj.runPaged().count;
				log.debug("customrecord_da_bank_loan_agreementSearchObj result count", searchResultCount);
				var loanLastPaymentDate;
				customrecord_da_bank_loan_agreementSearchObj.run().each(function(result) {
					loanLastPaymentDate = (result.getValue('custrecord_da_loan_payment_date'));
					//return true;
				});
				loanLastPaymentDate = format.parse({
					value: loanLastPaymentDate,
					type: format.Type.DATE
				});
				log.debug('loanLastPaymentDate 1', new Date(loanLastPaymentDate).getDate());
				log.debug('loanLastPaymentDate', new Date(loanLastPaymentDate).getDate());
				var noOfQuarters = noOfquarters(loanDate, loanLastPaymentDate);
				log.debug('noOfQuarters', noOfQuarters);
				var interestRate = scriptContext.newRecord.getValue('custrecord_da_loan_interest_rate');
				var outStandingLoanAmount = scriptContext.newRecord.getValue('custrecord_da_outstanding_bl_amount');
				for (var i = 0; i < noOfQuarters.length; i++) {
					if (noOfQuarters.length > 1) {
						if (i == 0 || i == (noOfQuarters.length - 1)) {
							if (i == 0) {
								log.debug('noOfQuarters', noOfQuarters[i]);
								var year = noOfQuarters[i].split(" ")[0];
								var month = noOfQuarters[i].split(" ")[1];
								month = month * 3;
								log.debug('month', month);
								log.debug('year', year);
								var tomorrow = new Date(loanDate)
								tomorrow.setDate(tomorrow.getDate() + 1);
								var interestDate = lastDateOfTheMonth(month, year);
								var yesterday = new Date(interestDate)
							    yesterday.setDate(yesterday.getDate() - 1);
								var noOfdays = calculateNoOfDays(interestDate, tomorrow);
								var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
								var loanInteSchRec = record.create({
									type: 'customrecord_da_loan_interest_payment_sc'
								});
								loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.id);
								loanInteSchRec.setValue('custrecord_da_loan_interest_from', tomorrow);
								loanInteSchRec.setValue('custrecord_loan_agree_interest_date', interestDate);
								loanInteSchRec.setValue('custrecord_da_loan_interest_to', yesterday);
								loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
								loanInteSchRec.save();
							}
							if (i == (noOfQuarters.length - 1)) {
								log.debug('noOfQuarters', noOfQuarters[i]);
								var year = noOfQuarters[i].split(" ")[0];
								var quarter = noOfQuarters[i].split(" ")[1];
								var month;
								if (quarter == 1) {
									month = 1;
								}
								if (quarter == 2) {
									month = 4;
								}
								if (quarter == 3) {
									month = 7;
								}
								if (quarter == 4) {
									month = 10;
								}
								log.debug('month', month);
								log.debug('year', year);
								var fromDate = new Date(month + "/01/" + year);
								var toDate = new Date(loanLastPaymentDate);
								toDate.setDate(toDate.getDate() - 1);
								var noOfdays = calculateNoOfDays(loanLastPaymentDate, fromDate);
								var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
								var loanInteSchRec = record.create({
									type: 'customrecord_da_loan_interest_payment_sc'
								});
								loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.id);
								loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
								loanInteSchRec.setValue('custrecord_loan_agree_interest_date', loanLastPaymentDate);
								loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
								loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
								loanInteSchRec.save();
							}
						} else {
							var year = noOfQuarters[i].split(" ")[0];
							var quarter = noOfQuarters[i].split(" ")[1];
							var month;
							if (quarter == 1) {
								month = 1;
							}
							if (quarter == 2) {
								month = 4;
							}
							if (quarter == 3) {
								month = 7;
							}
							if (quarter == 4) {
								month = 10;
							}
							log.debug('month', month);
							log.debug('year', year);
							var fromDate = new Date(month + "/01/" + year);
							var interestDate = lastDateOfTheMonth(quarter * 3, year);
							var toDate = new Date(interestDate);
							toDate.setDate(toDate.getDate() - 1);
							var noOfdays = calculateNoOfDays(interestDate, fromDate);
							var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
							var loanInteSchRec = record.create({
								type: 'customrecord_da_loan_interest_payment_sc'
							});
							loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.id);
							loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
							loanInteSchRec.setValue('custrecord_loan_agree_interest_date', interestDate);
							loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
							loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
							loanInteSchRec.save();
						}
					} else {
						var tomorrow = new Date(loanDate);
						tomorrow.setDate(tomorrow.getDate() + 1);
						var yesterday = new Date(loanLastPaymentDate);
						yesterday.setDate(yesterday.getDate() - 1);
						var noOfdays = calculateNoOfDays(loanLastPaymentDate, tomorrow);
						var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
						var loanInteSchRec = record.create({
							type: 'customrecord_da_loan_interest_payment_sc'
						});
						loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.id);
						loanInteSchRec.setValue('custrecord_da_loan_interest_from', tomorrow);
						loanInteSchRec.setValue('custrecord_loan_agree_interest_date', loanLastPaymentDate);
						loanInteSchRec.setValue('custrecord_da_loan_interest_to', yesterday);
						loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
						loanInteSchRec.save();
					}
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function calculateNoOfDays(date2, date1) {
			var res = Math.abs(date1 - date2) / 1000;
			var days = Math.floor(res / 86400);
			return days + 1;
		}

		function lastDateOfTheMonth(month, year) {
			log.debug(month, year);
			return new Date(year, month, 0);
		}

		function getQuarter(date) {
			return date.getFullYear() + ' ' + Math.ceil((date.getMonth() + 1) / 3);
		}

		function noOfquarters(sDate, eDate) {
			log.debug('sDate', sDate);
			log.debug('eDate', eDate);
			// Ensure start is the earlier date;
			if (sDate > eDate) {
				var t = eDate;
				eDate = sDate;
				sDate = t;
			}
			// Copy input start date do don't affect original
			sDate = new Date(sDate);
			log.debug('1sDate', sDate);
			log.debug('1eDate', eDate);
			// Set to 2nd of month so adding months doesn't roll over
			// and not affected by daylight saving
			sDate.setDate(2);
			log.debug('2sDate', sDate);
			log.debug('2eDate', eDate);
			// Initialise result array with start quarter
			var startQ = getQuarter(sDate);
			log.debug();
			var endQ = getQuarter(eDate);
			var result = [startQ];
			// List quarters from start to end
			while (startQ != endQ) {
				sDate.setMonth(sDate.getMonth() + 3);
				startQ = getQuarter(sDate);
				result.push(startQ);
			}
			return result;
		}
		return {
			onAction: onAction
		};
	});