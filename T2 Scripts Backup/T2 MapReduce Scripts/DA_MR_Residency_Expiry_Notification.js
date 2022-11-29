/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/email'],
	function(search, record, runtime, email) {
		/**
		 * Marks the beginning of the Map/Reduce process and generates input data.
		 *
		 * @typedef {Object} ObjectRef
		 * @property {number} id - Internal ID of the record instance
		 * @property {string} type - Record type id
		 *
		 * @return {Array|Object|Search|RecordRef} inputSummary
		 * @since 2015.1
		 */
		function getInputData() {
			try {
				var featureEnabled = runtime.isFeatureInEffect({
					feature: 'SUBSIDIARIES'
				});
				log.debug(featureEnabled);
				if (featureEnabled) {
					var subsidiarySearchObj = search.create({
						type: "subsidiary",
						columns: [
							search.createColumn({
								name: "name",
								sort: search.Sort.ASC,
								label: "Name"
							}),
							search.createColumn({
								name: "city",
								label: "City"
							}),
							search.createColumn({
								name: "state",
								label: "State/Province"
							}),
							search.createColumn({
								name: "country",
								label: "Country"
							}),
							search.createColumn({
								name: "currency",
								label: "Currency"
							})
						]
					});
					var searchResultCount = subsidiarySearchObj.runPaged().count;
					log.debug("subsidiarySearchObj result count", searchResultCount);
					subsidiarySearchObj.run().each(function(result) {
						var employeeSearchObj = search.create({
							type: "employee",
							filters: [
								["custentity_da_emp_residency_co", "anyof", result.id], "and",
								["custentity_da_emp_residency_expiry_date", "onorbefore", "monthafternexttodate"], 'and',
								["isinactive", "is", "false"]
							],
							columns: [
								search.createColumn({
									name: "entityid",
									sort: search.Sort.ASC,
									label: "ID"
								}),
								search.createColumn({
									name: "altname",
									label: "Name"
								}),
								search.createColumn({
									name: "custentity_da_emp_residency_co",
									label: "Residency Subsidiary"
								}),
								search.createColumn({
									name: "email",
									label: "Email"
								}),
								search.createColumn({
									name: "phone",
									label: "Phone"
								}),
								search.createColumn({
									name: "custentity_emirates_id_num",
									label: "CivilID"
								}),
								search.createColumn({
									name: "custentity_da_emp_residency_expiry_date",
									label: "residency expiration date"
								})
							]
						});
						var searchResultCount = employeeSearchObj.runPaged().count;
						log.debug("employeeSearchObj result count", searchResultCount);
						var empList = [];
						employeeSearchObj.run().each(function(result) {
							// .run().each has a limit of 4,000 results
							//var residencySubsidiary = result.getValue('custentity_da_emp_residency_co');
							var employee = result.getValue('altname');
							var email = result.getValue('email');
							var civilID = result.getValue('custentity_emirates_id_num');
							var resExpDate = result.getValue('custentity_da_emp_residency_expiry_date');
							var emailObj = {
								'empname': employee,
								'residencyexpdate': resExpDate,
								'email': email,
								'civilid': civilID
							};
							empList.push(emailObj);
							return true;
						});
						var customrecord_da_general_settingsSearchObj = search.create({
							type: "customrecord_da_general_settings",
							filters: [
								["custrecord_da_settings_subsidiary", "anyof", result.id]
							],
							columns: [
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
						var c = customrecord_da_general_settingsSearchObj.run().getRange(0, 1);
						if (c.length > 0) {
							log.debug('c', c[0].id);
							var emails = record.load({
								type: 'customrecord_da_general_settings',
								id: c[0].id
							}).getValue('custrecord_res_exp_not_emails');
							var recipientEmails = emails.split(',');
							log.debug('empList', empList);
							if (empList.length > 0) {
								var htmlBody = '';
								for (i in empList) {
									htmlBody += '<tr><td>' + empList[i].empname + '</td><td>' + empList[i].email + '</td><td>' + empList[i].residencyexpdate + '</td><td>' + empList[i].civilid + '</td></tr>';
								}
								htmlBody = '<b>The following employee(s) residency expiration date is less than 2 months , please find the details below.</b><table border = "4"><tr><th>Employee</th><th>Emaild</th><th>Residency Expiration Date</th><th>Civil Id</th></tr>' + htmlBody + '</table>';
								log.debug('s', htmlBody);
								email.sendBulk({
									author: -5,
									recipients: recipientEmails,
									subject: 'Residency Expiration Date Notification',
									body: htmlBody
								});
							}
						}
						return true;
					});
				} else {
					var employeeSearchObj = search.create({
						type: "employee",
						filters: [
							["custentity_da_emp_residency_expiry_date", "onorbefore", "monthafternexttodate"], 'and',
							["isinactive", "is", "false"]
						],
						columns: [
							search.createColumn({
								name: "entityid",
								sort: search.Sort.ASC,
								label: "ID"
							}),
							search.createColumn({
								name: "altname",
								label: "Name"
							}),
							search.createColumn({
								name: "email",
								label: "Email"
							}),
							search.createColumn({
								name: "phone",
								label: "Phone"
							}),
							search.createColumn({
								name: "custentity_emirates_id_num",
								label: "CivilID"
							}),
							search.createColumn({
								name: "custentity_da_emp_residency_expiry_date",
								label: "residency expiration date"
							})
						]
					});
					var searchResultCount = employeeSearchObj.runPaged().count;
					log.debug("employeeSearchObj result count", searchResultCount);
					var empList = [];
					employeeSearchObj.run().each(function(result) {
						// .run().each has a limit of 4,000 results
						//var residencySubsidiary = result.getValue('custentity_da_emp_residency_co');
						var employee = result.getValue('altname');
						var email = result.getValue('email');
						var civilID = result.getValue('custentity_emirates_id_num');
						var resExpDate = result.getValue('custentity_da_emp_residency_expiry_date');
						var emailObj = {
							'empname': employee,
							'residencyexpdate': resExpDate,
							'email': email,
							'civilid': civilID
						};
						empList.push(emailObj);
						return true;
					});
					var emails = record.load({
						type: 'customrecord_da_general_settings',
						id: 1
					}).getValue('custrecord_res_exp_not_emails');
					var recipientEmails = emails.split(',');
					log.debug('empList', empList);
					if (empList.length > 0) {
						var htmlBody = '';
						for (i in empList) {
							htmlBody += '<tr><td>' + empList[i].empname + '</td><td>' + empList[i].email + '</td><td>' + empList[i].residencyexpdate + '</td><td>' + empList[i].civilid + '</td></tr>';
						}
						htmlBody = '<b>The following employee(s) residency expiration date is less than 2 months , please find the details below.</b><table border = "4"><tr><th>Employee</th><th>Emaild</th><th>Residency Expiration Date</th><th>Civil Id</th></tr>' + htmlBody + '</table>';
						log.debug('s', htmlBody);
						email.sendBulk({
							author: -5,
							recipients: recipientEmails,
							subject: 'Residency Expiration Date Notification',
							body: htmlBody
						});
					}
				}
			} catch (ex) {
				log.error(ex.name, 'getInputData state, message = ' + ex.message);
			}
		}
		/**
		 * Executes when the map entry point is triggered and applies to each key/value pair.
		 *
		 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
		 * @since 2015.1
		 */
		function map(context) {
			try {} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Executes when the reduce entry point is triggered and applies to each group.
		 *
		 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
		 * @since 2015.1
		 */
		function reduce(context) {
			try {} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 *
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(summary) {
			try {} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			getInputData: getInputData,
			map: map,
			//reduce: reduce,
			//summarize: summarize
		};
	});