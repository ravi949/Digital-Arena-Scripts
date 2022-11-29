	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope SameAccount
	 */
	define(['N/ui/serverWidget', 'N/search', 'N/record','N/runtime'],
		function(ui, search, record, runtime) {
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {string} scriptContext.type - Trigger type
			 * @param {Form} scriptContext.form - Current form
			 * @Since 2015.2
			 */
			function beforeLoad(scriptContext) {
				try {
					var approval_status = scriptContext.newRecord.getValue('custrecord_da_leave_aproval_status');
					scriptContext.form.clientScriptModulePath = './DA_CS_Leave_Calculation.js';
                  //log.debug('form');
					var form = scriptContext.form;
					var approval_status = scriptContext.newRecord.getValue('custrecord_da_leave_aproval_status');
					var leaveType = scriptContext.newRecord.getValue('custrecord_da_leave_type');
					if (approval_status == 2 && leaveType == 1 && scriptContext.type == "view") {
						var empLeaves = form.addButton({
							id: 'custpage_create_leave',
							label: 'Duty Resumption Print',
							functionName: 'dutyResumption("' + scriptContext.newRecord.id + '")'
						});
					}
                   //log.debug('form1');
					var startDate = scriptContext.newRecord.getText('custrecord_da_leave_end_date');
					//log.debug('date', new Date(startDate));
					var tomorrow = new Date(startDate)
					tomorrow.setDate(tomorrow.getMonth() + 1);
					//log.debug('date', tomorrow);
					var endDate = scriptContext.newRecord.getText('custrecord_da_duty_resumption_date');
					if (approval_status == 6 && scriptContext.type == "view") {
						var empId = scriptContext.newRecord.getValue('custrecord_da_leave_employee');
						var currentRecId = scriptContext.newRecord.id;
                      var leaveType = scriptContext.newRecord.getValue('custrecord_da_leave_setting_record');
						var s = search.create({
							type: "customrecordtype",
							filters: [
								["scriptid", "is", "customrecord_da_leaves"]
							],
							columns: ["name", "scriptid"]
						}).run().getRange(0, 1);
						var recordId = s[0].id;
						log.debug('recordId', recordId);
						var empLeaves = form.addButton({
							id: 'custpage_create_leave',
							label: 'Approve and Create New Leave',
							functionName: 'createNewLeave("' + startDate + '","' + endDate + '","' + recordId + '","' + empId + '","' + currentRecId + '","' + leaveType + '")'
						});
					}
					if (scriptContext.type == "create" || scriptContext.type == "edit") {
						var sublist = scriptContext.form.getSublist({
							id: 'recmachcustrecord_da_leave_record'
						});
						//sublist.displayType = ui.SublistDisplayType.HIDDEN;
					}
					if (approval_status == 1 && scriptContext.type == "view") {
						var form = scriptContext.form;
						var empLeaves = form.addTab({
							id: 'custpage_empleaves',
							label: 'Employee Leaves'
						});
						var subList = form.addSublist({
							id: 'custpage_sub1',
							type: ui.SublistType.INLINEEDITOR,
							label: 'Related Employee Leaves',
							tab: 'custpage_empleaves'
						});
						var leaveId = subList.addField({
							id: 'custpage_leaveid',
							type: ui.FieldType.SELECT,
							label: 'Leave Id',
							source: 'customrecord_da_leaves'
						});
						var employeename = subList.addField({
							id: 'custpage_employeename',
							type: ui.FieldType.SELECT,
							label: 'Employee',
							source: 'employee'
						});
						var leavetype = subList.addField({
							id: 'custpage_leavetype',
							type: ui.FieldType.TEXT,
							label: 'Leave Type',
						});
						var startdate = subList.addField({
							id: 'custpage_leavestartdate',
							type: ui.FieldType.TEXT,
							label: 'Start Date',
						});
						var enddate = subList.addField({
							id: 'custpage_leaveenddate',
							type: ui.FieldType.TEXT,
							label: 'End Date',
						});
						/*var emergency = subList.addField({
							id: 'custpage_leaveisemergency',
							type: ui.FieldType.CHECKBOX,
							label: 'Emergency',		
						});*/
						var apprstatus = subList.addField({
							id: 'custpage_leaveappr_status',
							type: ui.FieldType.TEXT,
							label: 'Approval Status',
						});
						var employeeId = scriptContext.newRecord.getValue('custrecord_da_leave_employee');
						var employeeRec = record.load({
							type: 'employee',
							id: employeeId
						});
						//var subsidiary = employeeRec.getValue('subsidiary') ;
						var department = employeeRec.getValue('department');
						//var crew = employeeRec.getValue('custentity_da_emp_asphalt_crew');
						var leaveStartDate = scriptContext.newRecord.getText('custrecord_da_leave_start_date');
						var leaveEnddate = scriptContext.newRecord.getText('custrecord_da_leave_end_date');
						log.debug('leaveStartDate', leaveStartDate + ',' + leaveStartDate.split('/')[0]);
						var sd = leaveStartDate.split('/')[0],
							sm = leaveStartDate.split('/')[1],
							sy = leaveStartDate.split('/')[2];
						var ed = leaveEnddate.split('/')[0],
							em = leaveEnddate.split('/')[1],
							ey = leaveEnddate.split('/')[2];
						var i = 0;
						var customrecord_da_leavesSearchObj = search.create({
							type: "customrecord_da_leaves",
							filters: [
								// ["custrecord_da_leave_employee.subsidiary","anyof",subsidiary],
								// "AND", 
								["internalid", "noneof", scriptContext.newRecord.id],
								"AND",
								[
									["custrecord_da_leave_start_date", "within", sd + "/" + sm + "/" + sy, ed + "/" + em + "/" + ey], "OR", ["custrecord_da_leave_end_date", "within", sd + "/" + sm + "/" + sy, ed + "/" + em + "/" + ey]
								]
							],
							columns: [
								search.createColumn({
									name: "internalid",
									label: "Employee"
								}),
								search.createColumn({
									name: "custrecord_da_leave_employee",
									label: "Employee"
								}),
								search.createColumn({
									name: "custrecord_da_leave_type",
									label: "Leave Type"
								}),
								search.createColumn({
									name: "custrecord_da_leave_emergency",
									label: "Emergency Leave?"
								}),
								search.createColumn({
									name: "custrecord_da_leave_start_date",
									label: "Start Date"
								}),
								search.createColumn({
									name: "custrecord_da_leave_end_date",
									label: "End Date"
								}),
								search.createColumn({
									name: "custrecord_da_leave_aproval_status",
									label: "Approval Status"
								})
							]
						});
						var searchResultCount = customrecord_da_leavesSearchObj.runPaged().count;
						log.debug("customrecord_da_leavesSearchObj result count", searchResultCount);
						customrecord_da_leavesSearchObj.run().each(function(e) {
							subList.setSublistValue({
								id: 'custpage_leaveid',
								line: i,
								value: e.getValue('internalid')
							});
							subList.setSublistValue({
								id: 'custpage_employeename',
								line: i,
								value: e.getValue('custrecord_da_leave_employee')
							});
							subList.setSublistValue({
								id: 'custpage_leavestartdate',
								line: i,
								value: e.getValue('custrecord_da_leave_start_date')
							});
							//    				subList.setSublistValue({					
							//    					id: 'custpage_leaveisemergency',
							//    					line : i,
							//    					value :(e.getValue('custrecord_da_leave_emergency'))?(e.getValue('custrecord_da_leave_emergency')):''
							//    				});
							subList.setSublistValue({
								id: 'custpage_leaveenddate',
								line: i,
								value: e.getValue('custrecord_da_leave_end_date')
							});
							log.debug('appro', e.getText('custrecord_da_leave_aproval_status'));
							subList.setSublistValue({
								id: 'custpage_leaveappr_status',
								line: i,
								value: (e.getText('custrecord_da_leave_aproval_status')) ? (e.getText('custrecord_da_leave_aproval_status')) : ' '
							});
							subList.setSublistValue({
								id: 'custpage_leavetype',
								line: i,
								value: e.getText('custrecord_da_leave_type')
							});
							i++;
							return true;
						});
					}
				} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {Record} scriptContext.oldRecord - Old record
			 * @param {string} scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function beforeSubmit(scriptContext) {
				try {
                  var leaveType = scriptContext.newRecord.getValue('custrecord_da_leave_type');
                  if(leaveType == 8){
					if (scriptContext.type == 'create') {
						var featureEnabled = runtime.isFeatureInEffect({
							feature: 'SUBSIDIARIES'
						});
						log.debug(featureEnabled);
						var generalSettingRecID = 0;
						if (featureEnabled) {
							var employeeSubsidairy = scriptContext.newRecord.getValue('custrecord_da_leave_empsubsidiary');
							var customrecord_da_general_settingsSearchObj = search.create({
								type: "customrecord_da_general_settings",
								filters: [
									["custrecord_da_settings_subsidiary", "anyof", employeeSubsidairy]
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
								generalSettingRecID = c[0].id;
							}
						} else {
							generalSettingRecID = 1;
						}
						var settingsRec = record.load({
							type: 'customrecord_da_general_settings',
							id: generalSettingRecID
						});
						var availSickLeaves = settingsRec.getValue('custrecord_sick_leaves_per_year');
						var sickLeaveBalance = scriptContext.newRecord.getValue('custrecord_da_sick_leave_balance');
						if (availSickLeaves == sickLeaveBalance) {
							scriptContext.newRecord.setValue('custrecord_da_first_sick_leave', true);
						}
                      var empID = scriptContext.newRecord.getValue('custrecord_da_leave_employee');
						var customrecord_da_leavesSearchObj = search.create({
							type: "customrecord_da_leaves",
							filters: [
								["custrecord_da_first_sick_leave", "is", "T"],
								"AND",
								["custrecord_da_leave_employee", "anyof", empID]
							],
							columns: [
								search.createColumn({
									name: "id",
									sort: search.Sort.ASC,
									label: "ID"
								})
							]
						});
						var searchResultCount = customrecord_da_leavesSearchObj.runPaged().count;
						log.debug("customrecord_da_leavesSearchObj result count", searchResultCount);
						customrecord_da_leavesSearchObj.run().each(function(result) {
							record.submitFields({
								type: 'customrecord_da_leaves',
								id: result.id,
								values: {
									'custrecord_da_first_sick_leave': false
								}
							});
							return true;
						});
					}
                  }
				} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}
			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} scriptContext
			 * @param {Record} scriptContext.newRecord - New record
			 * @param {Record} scriptContext.oldRecord - Old record
			 * @param {string} scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function afterSubmit(scriptContext) {}
			return {
				beforeLoad: beforeLoad,
				beforeSubmit: beforeSubmit,
				afterSubmit: afterSubmit
			};
		});