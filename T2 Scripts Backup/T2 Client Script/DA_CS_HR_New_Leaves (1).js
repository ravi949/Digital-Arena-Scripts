/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/format', 'N/url', 'N/https'],
	function(search, record, format, url, https) {
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		var mode, subsidiaryExists = false,
			generalSettingsRecId = 1;

		function pageInit(scriptContext) {
			mode = scriptContext.mode;
          
           var url_string = window.location.href;
            console.log(scriptContext.currentRecord);
            var url1 = new URL(url_string);
            //var jobOrderId = url1.searchParams.get("joborderid");
            var startdate = url1.searchParams.get("st");
            var enddate = url1.searchParams.get("ed");
            var empId = url1.searchParams.get("empId");
           var leaveType = url1.searchParams.get("leaveType");
            console.log('startdate' + startdate);
            if (startdate && enddate) {
                console.log("setting");
               scriptContext.currentRecord.setValue('custrecord_da_employee_leave', empId);
               scriptContext.currentRecord.setValue('custrecord_da_leave_setting_record', leaveType);
             scriptContext.currentRecord.setText('custrecord_da_leave_startdate', startdate);
                scriptContext.currentRecord.setText('custrecord_da_leave_enddate', enddate);
               
                scriptContext.currentRecord.setValue('custrecord_da_extra_leave1', true);
              
            }
			var subsidiaryExistsUrl = url.resolveScript({
				scriptId: 'customscript_da_su_subsidiary_checking',
				deploymentId: 'customdeploy_da_su_subsidiary_checking',
				returnExternalUrl: false
			});
			log.debug('subsidiaryExists', subsidiaryExistsUrl);
			var response = https.get({
				url: subsidiaryExistsUrl
			});
			console.log(response);
			console.log(JSON.parse(response.body).subsidairiesExists);
			if (JSON.parse(response.body).subsidairiesExists) {
				subsidiaryExists = true;
				var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_subsidiary');
              console.log(subsidairyId);
				var customrecord_da_general_settingsSearchObj = search.create({
					type: "customrecord_da_general_settings",
					filters: [
						["custrecord_da_settings_subsidiary", "anyof", subsidairyId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_non_working_days",
							label: "Non Working Days (In a Week)"
						})
					]
				});
				var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
				log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
				customrecord_da_general_settingsSearchObj.run().each(function(result) {
					generalSettingsRecId = result.id;
				});
			}
			var employeeType = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_type');
			console.log(employeeType);
			var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_subsidiary');
			if (subsidiaryExists) {
				var customrecord_da_general_settingsSearchObj = search.create({
					type: "customrecord_da_general_settings",
					filters: [
						["custrecord_da_settings_subsidiary", "anyof", subsidairyId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_non_working_days",
							label: "Non Working Days (In a Week)"
						})
					]
				});
				var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
				log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
				customrecord_da_general_settingsSearchObj.run().each(function(result) {
					generalSettingsRecId = result.id;
					scriptContext.currentRecord.setValue('custrecord_da_leave_general_setting_rec', generalSettingsRecId);
				});
			}
			if (mode == 'create' || mode == 'edit') {
				var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_subsidiary');
				var gender = scriptContext.currentRecord.getValue('custrecord_da_leave_employee_gender');
				if (!gender) {
					gender = "@NONE@";
				}
				var religion = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_religion');
				if (!religion) {
					religion = "@NONE@";
				}
				var employeeType = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_type');
				if (!employeeType) {
					employeeType = "@NONE@";
				}
				var martialStatus = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_martial_status');
				if (!martialStatus) {
					martialStatus = "@NONE@";
				}
				console.log(gender);
				console.log(religion);
				console.log(employeeType);
				console.log(martialStatus);
				var customrecord_da_leave_types_settingsSearchObj = search.create({
					type: "customrecord_da_leave_types_settings",
					filters: [
						["custrecord_da_leave_subsidiary", "anyof", subsidiaryId],
						"AND",
						[
							["custrecord_da_leave_apply_to_emp_type", "anyof", employeeType], "OR", ["custrecord_da_leave_apply_to_emp_type", "anyof", "@NONE@"]
						],
						"AND",
						[
							["custrecord_da_leave_gender", "anyof", gender], "OR", ["custrecord_da_leave_gender", "anyof", "@NONE@"]
						],
						"AND",
						[
							["custrecord_da_leave_religion", "anyof", religion], "OR", ["custrecord_da_leave_religion", "anyof", "@NONE@"]
						],
						"AND",
						[
							["custrecord_da_setup_leave_martial_status", "anyof", martialStatus], "OR", ["custrecord_da_setup_leave_martial_status", "anyof", "@NONE@"]
						]
					],
					columns: [
						search.createColumn({
							name: "name",
							sort: search.Sort.ASC,
							label: "Name"
						})
					]
				});
				var field = scriptContext.currentRecord.getField({
					fieldId: 'custpage_leave_type'
				});
				field.removeSelectOption({
					value: null,
				});
				field.insertSelectOption({
					value: '',
					text: ''
				});
				var searchResultCount = customrecord_da_leave_types_settingsSearchObj.runPaged().count;
				log.debug("customrecord_da_leave_types_settingsSearchObj result count", searchResultCount);
				customrecord_da_leave_types_settingsSearchObj.run().each(function(result) {
					field.insertSelectOption({
						value: result.id,
						text: result.getValue('name')
					});
					return true;
				});
			}
			if (mode == 'edit') {
				var leaveSettingId = scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record');
				scriptContext.currentRecord.setValue('custpage_leave_type', leaveSettingId);
			}
		}
		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {
			try {
				if (scriptContext.fieldId == 'custrecord_da_leave_emp_martial_status') {
					var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_subsidiary');
					var gender = scriptContext.currentRecord.getValue('custrecord_da_leave_employee_gender');
					if (!gender) {
						gender = "@NONE@";
					}
					var religion = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_religion');
					if (!religion) {
						religion = "@NONE@";
					}
					var employeeType = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_type');
					if (!employeeType) {
						employeeType = "@NONE@";
					}
					var martialStatus = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_martial_status');
					if (!martialStatus) {
						martialStatus = "@NONE@";
					}
					console.log(gender);
					console.log(religion);
					console.log(employeeType);
					console.log(martialStatus);
					var customrecord_da_leave_types_settingsSearchObj = search.create({
						type: "customrecord_da_leave_types_settings",
						filters: [
							["custrecord_da_leave_subsidiary", "anyof", subsidiaryId],
							"AND",
							[
								["custrecord_da_leave_apply_to_emp_type", "anyof", employeeType], "OR", ["custrecord_da_leave_apply_to_emp_type", "anyof", "@NONE@"]
							],
							"AND",
							[
								["custrecord_da_leave_gender", "anyof", gender], "OR", ["custrecord_da_leave_gender", "anyof", "@NONE@"]
							],
							"AND",
							[
								["custrecord_da_leave_religion", "anyof", religion], "OR", ["custrecord_da_leave_religion", "anyof", "@NONE@"]
							],
							"AND",
							[
								["custrecord_da_setup_leave_martial_status", "anyof", martialStatus], "OR", ["custrecord_da_setup_leave_martial_status", "anyof", "@NONE@"]
							]
						],
						columns: [
							search.createColumn({
								name: "name",
								sort: search.Sort.ASC,
								label: "Name"
							})
						]
					});
					var field = scriptContext.currentRecord.getField({
						fieldId: 'custpage_leave_type'
					});
					field.removeSelectOption({
						value: null,
					});
					field.insertSelectOption({
						value: '',
						text: ''
					});
					var searchResultCount = customrecord_da_leave_types_settingsSearchObj.runPaged().count;
					log.debug("customrecord_da_leave_types_settingsSearchObj result count", searchResultCount);
					customrecord_da_leave_types_settingsSearchObj.run().each(function(result) {
						field.insertSelectOption({
							value: result.id,
							text: result.getValue('name')
						});
						return true;
					});
				}
				if (scriptContext.fieldId == 'custrecord_da_emp_leavetype') {
					var leaveType = scriptContext.currentRecord.getValue('custrecord_da_emp_leavetype');
					var employee = scriptContext.currentRecord.getValue('custrecord_da_employee_leave');
					if (leaveType == 2) {
						var customrecord_da_employee_sick_leave_balaSearchObj = search.create({
							type: "customrecord_da_employee_sick_leave_bala",
							filters: [
								["custrecord_da_sick_bal_employee", "anyof", employee]
							],
							columns: [
								search.createColumn({
									name: "scriptid",
									sort: search.Sort.ASC,
									label: "Script ID"
								}),
								search.createColumn({
									name: "custrecord_da_sick_bal_employee",
									label: "Employee"
								}),
								search.createColumn({
									name: "custrecord_da_emp_sick_leave_balance",
									label: "Balance"
								})
							]
						});
						var searchResultCount = customrecord_da_employee_sick_leave_balaSearchObj.runPaged().count;
						log.debug("customrecord_da_employee_sick_leave_balaSearchObj result count", searchResultCount);
						var remainingSickLeaves = 0;
						customrecord_da_employee_sick_leave_balaSearchObj.run().each(function(result) {
							remainingSickLeaves = result.getValue('custrecord_da_emp_sick_leave_balance');
							return true;
						});
						scriptContext.currentRecord.setValue('custrecord_da_sickleave_balance', remainingSickLeaves);
					}
				}
				if (scriptContext.fieldId == 'custpage_leave_type') {
                 
                    scriptContext.currentRecord.setValue('custrecord_da_leave_setting_record', scriptContext.currentRecord.getValue('custpage_leave_type'));
                
					
				}
				if (scriptContext.fieldId == 'custrecord_da_leave_startdate') {
					var oneDay = 24 * 60 * 60 * 1000;
					var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
					var employeeId = scriptContext.currentRecord.getValue('custrecord_da_employee_leave');
					if (startDate) {
						if(true) {
							var leaveType = scriptContext.currentRecord.getValue('custrecord_da_emp_leavetype');
							var leaveSettingsRec = record.load({
								type: 'customrecord_da_leave_types_settings',
								id: scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record')
							});
							var checkEligiblity = leaveSettingsRec.getValue('custrecord_da_leave_eligibility_from');
							if (checkEligiblity) {
								var eligiblityDate;
								if (checkEligiblity == 1) {
									var hiredate = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_hire_date');
									var inMonths = leaveSettingsRec.getValue('custrecord_da_eligible_after');
									if (inMonths > 0) {
										eligiblityDate = new Date(hiredate.setMonth(hiredate.getMonth() + inMonths));
										console.log(eligiblityDate);
									} else {
										eligiblityDate = hiredate;
									}
								}
								if (checkEligiblity == 2) {
									var probationPeriodEndDate = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_prob_end_date');
									var inMonths = leaveSettingsRec.getValue('custrecord_da_eligible_after');
									if (inMonths > 0) {
										eligiblityDate = new Date(probationPeriodEndDate.setMonth(probationPeriodEndDate.getMonth() + inMonths));
										console.log(eligiblityDate);
									} else {
										eligiblityDate = probationPeriodEndDate;
									}
								}
								console.log('eligiblityDate' + eligiblityDate);
								if (startDate >= eligiblityDate) {} else {
									alert('Sorry you are not allowed to apply for this leave Yet.');
									scriptContext.currentRecord.setValue('custrecord_da_leave_startdate', '');
									return false;
								}
							}
							if (leaveType == 1 || leaveType == 3) {
								var leaveEntitlementValue = leaveSettingsRec.getValue('custrecord_da_no_of_days');
								var employeeId = scriptContext.currentRecord.getValue('custrecord_da_employee_leave');
								var leaveBalance = 0;
								var customrecord_emp_leave_balanceSearchObj = search.create({
									type: "customrecord_emp_leave_balance",
									filters: [
										["custrecord_employee_id", "anyof", employeeId]
									],
									columns: [
										search.createColumn({
											name: "custrecord_employee_id",
											label: "Employee"
										}),
										search.createColumn({
											name: "custrecord_emp_leave_balance",
											label: "Leave Balance"
										})
									]
								});
								var searchResultCount = customrecord_emp_leave_balanceSearchObj.runPaged().count;
								log.debug("customrecord_emp_leave_balanceSearchObj result count", searchResultCount);
								customrecord_emp_leave_balanceSearchObj.run().each(function(result) {
									leaveBalance = result.getValue('custrecord_emp_leave_balance');
									return true;
								});
								var selecteddate = scriptContext.currentRecord.getText('custrecord_da_leave_startdate');
								console.log(selecteddate);
								var resstart1 = selecteddate.split("/");
								var resmonth1 = resstart1[1];
								var resday1 = resstart1[0];
								var resyear1 = resstart1[2];
								console.log(resmonth1 + "" + resday1 + "" + resyear1);
								var date_2 = new Date();
								var date_1 = startDate;
								var noOfDays = function(date2, date1) {
									console.log(date2);
									console.log(date1);
									var res = Math.abs(date1 - date2) / 1000;
									var days = Math.floor(res / 86400);
									return days;
								};
								noOfDays = noOfDays(date_2, date_1)
								var daysInMonth = daysInMonthCalc(resmonth1, resyear1);
								console.log(daysInMonth);
								console.log(noOfDays + " " + leaveEntitlementValue + " " + daysInMonth);
								var leaveEntitlementbetweenLeaveStartDateandToday = (((leaveEntitlementValue / 12) / daysInMonth) * noOfDays);
								leaveBalance = parseFloat(leaveBalance) + parseFloat(leaveEntitlementbetweenLeaveStartDateandToday);
								console.log(leaveBalance);
								scriptContext.currentRecord.setValue('custrecord_da_annual_leave_balance', leaveBalance.toFixed(2));
							}
							//one time leave validations
							var oneTimeLeave = leaveSettingsRec.getValue('custrecord_da_leave_setup_one_time');
							console.log(oneTimeLeave);
							if (oneTimeLeave) {
								var eligiblityInYears = leaveSettingsRec.getValue('custrecord_da_leave_eligiblity_to_apply');
								var frequency = leaveSettingsRec.getValue('custrecord_da_frequency_method');
								console.log(frequency);
								if (frequency) {
									if (frequency == 1) {
										var selecteddate = scriptContext.currentRecord.getText('custrecord_da_leave_startdate');
										console.log(selecteddate);
										var resstart1 = selecteddate.split("/");
										var resmonth1 = resstart1[1];
										var resday1 = resstart1[0];
										var resyear1 = resstart1[2];
										console.log("01/01/" + resyear1, "31/12/" + (resyear1 + eligiblityInYears));
										var customrecord_da_employee_leavesSearchObj = search.create({
											type: "customrecord_da_employee_leaves",
											filters: [
												["custrecord_da_employee_leave", "anyof", scriptContext.currentRecord.getValue('custrecord_da_employee_leave')],
												"AND",
												["custrecord_da_leave_setting_record", "anyof", scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record')],
												"AND",
												["custrecord_da_leave_startdate", "within", "01/01/" + resyear1, "31/12/" + (parseFloat(resyear1) + parseFloat(eligiblityInYears))]
											],
											columns: [
												search.createColumn({
													name: "id",
													sort: search.Sort.ASC,
													label: "ID"
												})
											]
										});
										var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
										log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
										if (searchResultCount > 0) {
											alert('Sorry, you already applied for this leave');
											scriptContext.currentRecord.setValue('custrecord_da_leave_startdate', '');
										}
									}
									if (frequency == 2) {
										var leaveStartDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
										var leaveStartDateYear = leaveStartDate.getFullYear();
										var leaveStartDateMonth = leaveStartDate.getMonth();
										var hiredate = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_hire_date');
										var hireDateYear = hiredate.getFullYear();
										var hireDateMonth = hiredate.getMonth();
										var hireaDateDate = hiredate.getDate();
										var actualStartDateYear;
										var actualEndDateYear;
										for (var i = 0; i < 20; i++) {
											var nextYear = parseFloat(hireDateYear) + parseFloat(eligiblityInYears);
											if (hireDateYear <= leaveStartDateYear && leaveStartDateYear <= nextYear) {
												actualStartDateYear = hireDateYear;
												actualEndDateYear = nextYear;
											}
											hireDateYear = nextYear;
										}
										hireDateMonth = parseFloat(hireDateMonth) + parseFloat(1);
										var customrecord_da_employee_leavesSearchObj = search.create({
											type: "customrecord_da_employee_leaves",
											filters: [
												["custrecord_da_employee_leave", "anyof", scriptContext.currentRecord.getValue('custrecord_da_employee_leave')],
												"AND",
												["custrecord_da_leave_setting_record", "anyof", scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record')],
												"AND",
												["custrecord_da_leave_startdate", "within", hireaDateDate + "/" + hireDateMonth + "/" + actualStartDateYear, hireaDateDate + "/" + hireDateMonth + "/" + actualEndDateYear]
											],
											columns: [
												search.createColumn({
													name: "id",
													sort: search.Sort.ASC,
													label: "ID"
												})
											]
										});
										var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
										log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
										if (searchResultCount > 0) {
											alert('Sorry, you cant apply this leave');
											scriptContext.currentRecord.setValue('custrecord_da_leave_startdate', '');
										}
									}
									if (frequency == 3) {
										var customrecord_da_employee_leavesSearchObj = search.create({
											type: "customrecord_da_employee_leaves",
											filters: [
												["custrecord_da_employee_leave", "anyof", scriptContext.currentRecord.getValue('custrecord_da_employee_leave')],
												"AND",
												["custrecord_da_leave_setting_record", "anyof", scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record')],
											],
											columns: [
												search.createColumn({
													name: "id",
													sort: search.Sort.DESC,
													label: "ID"
												}),
												search.createColumn({
													name: "custrecord_da_leave_startdate",
													label: "Start Date"
												})
											]
										});
										var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
										log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
										var leaveApplyDate;
										customrecord_da_employee_leavesSearchObj.run().each(function(result) {
											leaveApplyDate = result.getValue('custrecord_da_leave_startdate');
										});
										if (leaveApplyDate) {
											var resstart1 = leaveApplyDate.split("/");
											var resmonth1 = resstart1[1];
											var resday1 = resstart1[0];
											var resyear1 = resstart1[2];
											console.log(leaveApplyDate, startDate);
											var diffInYears = diff_years(startDate, new Date(resmonth1 + "/" + resday1 + "/" + resyear1));
											console.log(diffInYears);
											if (diffInYears > eligiblityInYears) {
												alert('Sorry, you cant apply leave');
												scriptContext.currentRecord.setValue('custrecord_da_leave_startdate', '');
											}
										}
									}
								}
							}
						}
					}
				}
				if (scriptContext.fieldId == 'custrecord_da_leave_emp_subsidiary') {
					var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_emp_subsidiary');
					if (subsidiaryExists) {
						var customrecord_da_general_settingsSearchObj = search.create({
							type: "customrecord_da_general_settings",
							filters: [
								["custrecord_da_settings_subsidiary", "anyof", subsidairyId]
							],
							columns: [
								search.createColumn({
									name: "custrecord_non_working_days",
									label: "Non Working Days (In a Week)"
								})
							]
						});
						var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
						log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
						customrecord_da_general_settingsSearchObj.run().each(function(result) {
							generalSettingsRecId = result.id;
							scriptContext.currentRecord.setValue('custrecord_da_leave_general_setting_rec', generalSettingsRecId);
						});
					}
				}
				if (scriptContext.fieldId == 'custrecord_da_leave_enddate') {
					var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_enddate');
					var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
                  var employeeId = scriptContext.currentRecord.getValue('custrecord_da_employee_leave');
                  if(endDate){
                    var endDateText = scriptContext.currentRecord.getText('custrecord_da_leave_enddate');
					var startDateText = scriptContext.currentRecord.getText('custrecord_da_leave_startdate');
                    var customrecord_da_employee_leave_datesSearchObj = search.create({
                          type: 'customrecord_da_employee_leaves', 
                        filters: [
                         [[["custrecord_da_leave_startdate","within",startDateText,endDateText],"AND",["custrecord_da_leave_enddate","onorafter",startDateText]],"OR",[["custrecord_da_leave_startdate","onorbefore",endDateText],"AND",["custrecord_da_leave_enddate","within",startDateText,endDateText]]], 
      "AND", 
      ["custrecord_da_employee_leave","anyof",employeeId]
                        ],
                      
                        columns: []
                    });
                    
                    var searchResultCount = customrecord_da_employee_leave_datesSearchObj.runPaged().count;
						log.debug("customrecord_da_employee_leave_datesSearchObj result count", searchResultCount);
                    
                    if (mode == 'edit') {
                      console.log(scriptContext.currentRecord.id);
							var customrecord_da_employee_leave_datesSearchObj = search.create({
                                type: 'customrecord_da_employee_leaves', 
                                filters: [
                                  ["custrecord_da_employee_leave", "anyof", employeeId],'and',["internalid", "noneof", scriptContext.currentRecord.id]
                                  [['custrecord_da_leave_startdate', search.Operator.WITHIN, startDateText,endDateText], 'and',
                                   ['custrecord_da_leave_enddate',search.Operator.ONORAFTER, startDateText]], 'or',
                                    [['custrecord_da_leave_startdate',search.Operator.ONORBEFORE, endDateText], 'and',['custrecord_da_leave_enddate',search.Operator.WITHIN,startDateText,endDateText]]
                                ],
                                columns: []
                            });
						}
                    
                    
						
						var searchResultCount = customrecord_da_employee_leave_datesSearchObj.runPaged().count;
						log.debug("customrecord_da_employee_leave_datesSearchObj result count", searchResultCount);
						if (searchResultCount > 0) {
							alert('Sorry, you already have leave on this date');
							scriptContext.currentRecord.setValue('custrecord_da_leave_enddate', '');
						} else {
                  
                  if(endDate >= startDate){
                    
                  
					var leaveType = scriptContext.currentRecord.getValue('custrecord_da_emp_leavetype');
					var endDay = endDate.getDate();
					var emonth = (endDate.getMonth()) + 1;
					var eYear = endDate.getFullYear();
					var startDay = startDate.getDate();
					var startmonth = (startDate.getMonth()) + 1;
					var startYear = startDate.getFullYear();
					console.log(endDay + "sfd" + emonth + "fdsf" + eYear);
					if (startDate && endDate) {
						var leaveSettingsRec = record.load({
							type: 'customrecord_da_leave_types_settings',
							id: scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record')
						});
						var diffDays = calculateNoOfdays(startDate, endDate);
						console.log(diffDays);
						var removeWeekEnd = leaveSettingsRec.getValue('custrecord_da_remove_weekends');
						var removeHolidays = leaveSettingsRec.getValue('custrecord_da_remove_holidays');
						var removeRestDays = leaveSettingsRec.getValue('custrecord_da_remove_rest_days');
						var generalSettingRec = record.load({
							type: 'customrecord_da_general_settings',
							id: generalSettingsRecId
						});
						var weekEnd = generalSettingRec.getValue('custrecord_da_hr_settings_week_end');
						var restDay = generalSettingRec.getValue('custrecord_da_hr_setting_rest_day');
						var customrecord_da_holiday_datesSearchObj = search.create({
							type: "customrecord_da_holiday_dates",
							filters: [
								["custrecord_holiday_date", "within", startDay + "/" + startmonth + "/" + startYear, endDay + "/" + emonth + "/" + eYear]
							],
							columns: [
								search.createColumn({
									name: "scriptid",
									sort: search.Sort.ASC,
									label: "Script ID"
								}),
								search.createColumn({
									name: "custrecord_holiday_date",
									label: "Date"
								})
							]
						});
						var NoOfholidays = customrecord_da_holiday_datesSearchObj.runPaged().count;
						console.log('NoOfholidays' + NoOfholidays);
						var LeaveDays = 0;
						var LeaveDaysForPayment = 0;
						var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_enddate');
						var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
						var weekEnds = calculateNoOfWeekEnds(startDate, endDate, weekEnd);
						console.log('weekEnds', weekEnds);
						var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_enddate');
						var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
						var restDays = calculateNoOfWeekEnds(startDate, endDate, restDay);
						console.log('restDays', restDays);
						if (removeWeekEnd) {
							LeaveDays = parseFloat(LeaveDays) - parseFloat(weekEnds);
						}
						if (removeRestDays) {
							LeaveDays = parseFloat(LeaveDays) - parseFloat(restDays);
						}
						if (removeHolidays) {
							LeaveDays = parseFloat(LeaveDays) - parseFloat(NoOfholidays);
						}
						LeaveDays = parseFloat(diffDays) + parseFloat(LeaveDays);
						var removeWeekEnd1 = leaveSettingsRec.getValue('custrecord_da_remove_weekends1');
						var removeHolidays1 = leaveSettingsRec.getValue('custrecord_da_remove_holidays1');
						var removeRestDays1 = leaveSettingsRec.getValue('custrecord_da_remove_rest_days1');
						if (removeWeekEnd1) {
							LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(weekEnds);
						}
						if (removeRestDays1) {
							LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(restDays);
						}
						if (removeHolidays1) {
							LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(NoOfholidays);
						}
						LeaveDaysForPayment = parseFloat(diffDays) + parseFloat(LeaveDaysForPayment);
						scriptContext.currentRecord.setValue('custrecord_da_emp_leavedays', LeaveDays);
						scriptContext.currentRecord.setValue('custrecord_da_leave_payment_days', LeaveDaysForPayment);
					}
					var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
					var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_enddate');
					if (startDate && endDate) {
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'recmachcustrecord_da_emp_leave_dates_parent'
						});
						for (var i = numLines - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_da_emp_leave_dates_parent',
								line: i,
								ignoreRecalc: true
							});
						}
						var dates = getDates(new Date(startDate), new Date(endDate));
						dates.forEach(function(date) {
							console.log(date);
							scriptContext.currentRecord.selectNewLine({
								sublistId: 'recmachcustrecord_da_emp_leave_dates_parent'
							});
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_emp_leave_dates_parent',
								fieldId: 'custrecord_da_leave_date',
								value: date
							});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_da_emp_leave_dates_parent'
							});
						});
					
                  }
                }else{
                  alert('sorry, End Date should be greater than start date');
                  scriptContext.currentRecord.setValue('custrecord_da_leave_enddate', '');
                }
                  }
                  }
				}
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}

		function calculateNoOfdays(startDate, endDate) {
			var totalDays = 0;
			for (var i = (startDate); i <= (endDate);) {
				if (true) {
					totalDays++;
				}
				i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
			}
			return totalDays;
		}

		function diff_years(dt2, dt1) {
			var diff = (dt2.getTime() - dt1.getTime()) / 1000;
			diff /= (60 * 60 * 24);
			return (diff / 365.25);
		}

		function daysInMonthCalc(month, year) {
			return new Date(year, month, 0).getDate();
		}

		function getDates(startDate, endDate) {
			var dates = [],
				currentDate = startDate,
				addDays = function(days) {
					var date = new Date(this.valueOf());
					date.setDate(date.getDate() + days);
					return date;
				};
			while (currentDate <= endDate) {
				dates.push(currentDate);
				currentDate = addDays.call(currentDate, 1);
			}
			return dates;
		};

		function calculateNoOfWeekEnds(startDate, endDate, weekEnd) {
			//console.log(startDate);
			//console.log(endDate);
			var totalDays = 0;
			for (var i = (startDate); i <= (endDate);) {
				//console.log(i.getDay());
				if (i.getDay() == (weekEnd - 1)) {
					totalDays++;
				}
				i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
			}
			return totalDays;
		}
		/**
		 * Function to be executed when field is slaved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 *
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {}
		/**
		 * Function to be executed after sublist is inserted, removed, or edited.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function sublistChanged(scriptContext) {}
		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {}
		/**
		 * Validation function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @returns {boolean} Return true if field is valid
		 *
		 * @since 2015.2
		 */
		function validateField(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is committed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {
			try {} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
		/**
		 * Validation function to be executed when sublist line is inserted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateInsert(scriptContext) {}
		/**
		 * Validation function to be executed when record is deleted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateDelete(scriptContext) {}
		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			try {
              var leaveType = scriptContext.currentRecord.getValue('custrecord_da_emp_leavetype');
              if(leaveType == 3){
                var annualLevaeBalance = scriptContext.currentRecord.getValue('custrecord_da_annual_leave_balance');
                var leaveDays =  scriptContext.currentRecord.getValue('custrecord_da_emp_leavedays');
                if(annualLevaeBalance <= 0){
                  alert('Sorry , you cant apply unpaid leave');
                  return false;
                }
              }
              
				var numLines = scriptContext.currentRecord.getLineCount({
					sublistId: 'recmachcustrecord_da_emp_leaves'
				});
				for (var i = numLines - 1; i >= 0; i--) {
					scriptContext.currentRecord.removeLine({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						line: i,
						ignoreRecalc: true
					});
				}
				var leaveSettingsRecId = scriptContext.currentRecord.getValue('custrecord_da_leave_setting_record');
				var leaveSettingsRec = record.load({
					type: 'customrecord_da_leave_types_settings',
					id: leaveSettingsRecId
				});
				var maxNoOfDays = leaveSettingsRec.getValue('custrecord_da_max_days_per_request');
				var LeaveDays = scriptContext.currentRecord.getValue('custrecord_da_emp_leavedays');
				if (LeaveDays > maxNoOfDays) {
					alert('Sorry, you cant apply for more than ' + maxNoOfDays + ' days per request');
					return false;
				}
				var annualLeaveBalance = scriptContext.currentRecord.getValue('custrecord_da_annual_leave_balance');
				if (annualLeaveBalance < LeaveDays) {
					//
					var allowNegative = leaveSettingsRec.getValue('custrecord_da_allow_negative_bal');
					if (allowNegative) {
                      annualLeaveBalance = -(annualLeaveBalance);
						var maxNegativeBalance = leaveSettingsRec.getValue('custrecord_da_max_allowed_negative_bal');
						if (maxNegativeBalance) {
							log.debug('maxNegativeBalance', maxNegativeBalance);
							if (annualLeaveBalance > maxNegativeBalance) {
								alert('Sorry, you cant apply with negative Balance');
								return false;
							}
						}
					} else {
						alert('Sorry, you are not eligible for apply leave with negative leave balance');
						return false;
					}
				}
				//setting monthly lines 
				var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_startdate');
				var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_enddate');
				var actualStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
				var noOfMonths = monthDiff(startDate, endDate);
				log.debug('noOfMonths', noOfMonths);
				var employeeId = scriptContext.currentRecord.getValue('custrecord_da_employee_leave');
				if (noOfMonths == 0) {
					scriptContext.currentRecord.selectNewLine({
						sublistId: 'recmachcustrecord_da_emp_leaves'
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_emp_month_leave',
						value: employeeId
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_month_name',
						value: startDate
					})
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_leave_actual_start_date',
						value: new Date(startDate.getFullYear(), startDate.getMonth(), 1)
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_month_start_date',
						value: startDate
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_month_end_date',
						value: endDate
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_lmonth_leavedays',
						value: scriptContext.currentRecord.getValue('custrecord_da_emp_leavedays')
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_leave_paymentdays',
						value: scriptContext.currentRecord.getValue('custrecord_da_leave_payment_days')
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_emp_leaves',
						fieldId: 'custrecord_da_month_wise_advance_leave',
						value: scriptContext.currentRecord.getValue('custrecord_da_advance_leave')
					});
					scriptContext.currentRecord.commitLine({
						sublistId: 'recmachcustrecord_da_emp_leaves'
					});
				} else {
					var startDateOfLeave;
					var endDateOfLeave;
					for (var i = 0; i < (noOfMonths + 1); i++) {
						log.debug('i', i);
						if (i == 0) {
							log.debug('st');
							startDateOfLeave = startDate;
						}
						if (i == (noOfMonths)) {
							log.debug('1');
							endDateOfLeave = endDate;
						} else {
							log.debug('else');
							endDateOfLeave = new Date(startDateOfLeave.getFullYear(), startDateOfLeave.getMonth() + 1, 0);
						}
						log.debug('endDateOfLeave', endDateOfLeave);
						scriptContext.currentRecord.selectNewLine({
							sublistId: 'recmachcustrecord_da_emp_leaves'
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_emp_month_leave',
							value: employeeId
						});
						if (scriptContext.currentRecord.getValue('custrecord_da_advance_leave') == true) {
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_emp_leaves',
								fieldId: 'custrecord_da_leave_actual_start_date',
								value: new Date((scriptContext.currentRecord.getValue('custrecord_da_leave_startdate')).getFullYear(), (scriptContext.currentRecord.getValue('custrecord_da_leave_startdate')).getMonth(), 1)
							});
						} else {
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_emp_leaves',
								fieldId: 'custrecord_da_leave_actual_start_date',
								value: new Date(startDateOfLeave.getFullYear(), startDateOfLeave.getMonth(), 1)
							});
						}
						if (i == 0) {
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_emp_leaves',
								fieldId: 'custrecord_da_month_name',
								value: startDateOfLeave
							});
						} else {
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_emp_leaves',
								fieldId: 'custrecord_da_month_name',
								value: new Date(startDateOfLeave.getFullYear(), startDateOfLeave.getMonth(), 1)
							});
						}
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_month_start_date',
							value: startDateOfLeave
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_month_end_date',
							value: endDateOfLeave
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_lmonth_leavedays',
							value: 0
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_month_wise_advance_leave',
							value: scriptContext.currentRecord.getValue('custrecord_da_advance_leave')
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_emp_leaves',
							fieldId: 'custrecord_da_leave_paymentdays',
							value: 0
						});
						scriptContext.currentRecord.commitLine({
							sublistId: 'recmachcustrecord_da_emp_leaves'
						});
						log.debug('endDateOfLeave', endDateOfLeave);
						startDateOfLeave.setDate(endDateOfLeave.getDate() + 1);
					}
				}
				return true;
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}

		function monthDiff(d1, d2) {
			var months;
			months = (d2.getFullYear() - d1.getFullYear()) * 12;
			months -= d1.getMonth();
			months += d2.getMonth();
			return months <= 0 ? 0 : months;
		}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			//    postSourcing: postSourcing,
			//      sublistChanged: sublistChanged,
			//      lineInit: lineInit,
			//      validateField: validateField,
			//validateLine: validateLine,
			//      validateInsert: validateInsert,
			//      validateDelete: validateDelete,
			saveRecord: saveRecord
		};
	});