/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime','N/email','N/file'],
	function(record, search, runtime, email, file) {
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
			//Getting payrun scheduling record with filter processing checkbox is true
			try {
				log.debug('mapreduce script triggered');
				return search.create({
					type: "employee",
					filters: [
						["internalid", "anyof", "-5"],
					],
					columns: [
						search.createColumn({
							name: "entityid",
							label: "Name"
						}),
						search.createColumn({
							name: "email",
							label: "Email"
						}),
						search.createColumn({
							name: "custentity_da_emp_include_in_payroll",
							label: "Include in payroll?"
						}),
						search.createColumn({
							name: "internalid",
							sort: search.Sort.ASC,
							label: "Internal ID"
						})
					]
				});
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Executes when the map entry point is triggered and applies to each key/value pair.
		 *
		 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
		 * @since 2015.1
		 */
		function map(context) {
			try {
				var sendPayslipId = runtime.getCurrentScript().getParameter({
					name: 'custscript_da_send_payslip_id'
				});
				log.debug('sendPayslipId', sendPayslipId);
				var sendPayslipRec = record.load({
					type: 'customrecord_da_send_payslips',
					id: sendPayslipId
				});
				var option = sendPayslipRec.getValue('custrecord_da_send_payslips_choose_optio');
				if (option == 1) {
					var subsidiary = sendPayslipRec.getValue('custrecord_da_send_payslips_subsidary');
					var employeeSearchObj = search.create({
						type: "employee",
						filters: [
							["subsidiary", "anyof", payrunSubsidiary], "AND",
							["custentity_da_emp_include_in_payroll", "is", "T"]
						],
						columns: [
							search.createColumn({
								name: "entityid",
								label: "Name"
							}),
							search.createColumn({
								name: "email",
								label: "Email"
							}),
							search.createColumn({
								name: "custentity_da_emp_include_in_payroll",
								label: "Include in payroll?"
							}),
							search.createColumn({
								name: "internalid",
								sort: search.Sort.ASC,
								label: "Internal ID"
							})
						]
					});
					employeeSearchObj.run().each(function(result) {
						context.write({
							key: {
								internalid: result.getValue('internalid')
							},
							value: {
								internalid: result.getValue('internalid')
							}
						});
						return true;
					});
				}
				if (option == 2) {
					var employees = sendPayslipRec.getValue('custrecord_da_send_payslips_employees');
					log.debug('employees', employees);
					for (var i = 0; i < employees.length; i++) {
						log.debug('empiId', employees[i]);
						context.write({
							key: {
								internalid: employees[i]
							},
							value: {
								internalid: employees[i]
							}
						});
					}
				}
				if (option == 3) {
                  var groupId = sendPayslipRec.getValue('custrecord_da_send_paysips_emp_groups');
					var groupReec = record.load({
						type: 'entitygroup',
						id: groupId,
						isDynamic: true
					});
					var numLines = groupReec.getLineCount({
						sublistId: 'groupmembers'
					});
					//log.debug('d', numLines);
					var savedSearchID = groupReec.getValue('savedsearch');
					//log.debug(savedSearchID);
					if (savedSearchID) {
						var savedSearch = search.load({
							id: savedSearchID
						});
						savedSearch.run().each(function(result) {
							context.write({
								key: {
									internalid: result.id
								},
								value: {
									internalid: result.id
								}
							});
							return true;
						});
					} else {
						for (var i = 0; i < numLines; i++) {
							var sublistFieldValue = groupReec.getSublistValue({
								sublistId: 'groupmembers',
								fieldId: 'membername',
								line: i
							});
							//log.debug(sublistFieldValue);
							var employeeSearchObj = search.create({
								type: "employee",
								filters: [
									["entityid", "is", sublistFieldValue]
								],
								columns: []
							});
							employeeSearchObj.run().each(function(result) {
								context.write({
									key: {
										internalid: result.id
									},
									value: {
										internalid: result.id
									}
								});
								return true;
							});
						}
					}
				}
			} catch (ex) {
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
			try {
				var empId = JSON.parse(context.key);
				

				empId = empId.internalid;
				log.debug('empId', empId);

				var sendPayslipId = runtime.getCurrentScript().getParameter({
					name: 'custscript_da_send_payslip_id'
				});
				//log.debug('payrunRecId', payrunRecId);
				var sendPayslipRec = record.load({
					type: 'customrecord_da_send_payslips',
					id: sendPayslipId
				});
				var periodId = sendPayslipRec.getValue('custrecord_da_send_payslips_period');

				var customrecord_emp_request_for_payslipSearchObj = search.create({
				   type: "customrecord_emp_request_for_payslip",
				   filters:
				   [
				      ["custrecord_payslip_employee","anyof",empId], 
				      "AND", 
				      ["custrecord_emp_payslip_select_month","anyof",periodId]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_da_salary_slip_pdf", label: "Salary Slip PDF"}),
				      search.createColumn({name: "custrecord_emp_payslip_select_month", label: "Select Month"}),
				      search.createColumn({
				         name: "altname",
				         join: "CUSTRECORD_PAYSLIP_EMPLOYEE",
				         label: "Name"
				      })
				   ]
				});
				var searchResultCount = customrecord_emp_request_for_payslipSearchObj.runPaged().count;
				log.debug("customrecord_emp_request_for_payslipSearchObj result count",searchResultCount);
				customrecord_emp_request_for_payslipSearchObj.run().each(function(result){
				   var periodName = result.getText('custrecord_emp_payslip_select_month');
				   var empName = result.getValue({name:'altname',join:'CUSTRECORD_PAYSLIP_EMPLOYEE'});
                  var fileObj = file.load({
                    id: result.getValue('custrecord_da_salary_slip_pdf')
                });
				   email.send({
						author: -5,
						recipients: empId,
						subject: 'PaySlip For '+periodName,
						body: 'Hi '+empName +', Please find the payslip PDF for the month :<b>'+periodName+'</b>',
						attachments: [fileObj]
					});
				   return true;
				});


				
			} catch (ex) {
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
			try {

				} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			getInputData: getInputData,
			map: map,
			reduce: reduce,
			summarize: summarize
		};
	});