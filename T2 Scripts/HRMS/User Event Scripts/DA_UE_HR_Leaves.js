    /**
     * @NApiVersion 2.x
     * @NScriptType UserEventScript
     * @NModuleScope TargetAccount
     */
    define(['N/runtime', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/format'],
      function(runtime, record, search, serverWidget, format) {
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
            if (scriptContext.type == 'create' || scriptContext.type == 'edit') {
              var field2 = scriptContext.form.addField({
                id: 'custpage_leave_type',
                type: serverWidget.FieldType.SELECT,
                label: 'Leave Type'
              });
            //  field2.isMandatory = true;
              scriptContext.form.insertField({
                field: field2,
                nextfield: "custrecord_da_advance_leave"
              });
            }
            scriptContext.form.clientScriptModulePath = './DA_CS_Leave_Calculation.js';
            var approval_status = scriptContext.newRecord.getValue('custrecord_da_leave_approvalstatus');
            var startDate = scriptContext.newRecord.getValue('custrecord_da_leave_enddate');
            log.debug('startDate',startDate);
            startDate.setDate(startDate.getDate() + 1);
            log.debug('startDate',startDate);
            var parsedStartDate = format.parse({
                    value: new Date(startDate),
                    type: format.Type.DATE
                });
                var formattedStartDate = format.format({
                    value: parsedStartDate,
                    type: format.Type.DATE
                });
                log.debug('formattedStartDate',formattedStartDate);
					//log.debug('date', new Date(startDate));
					var tomorrow = new Date(startDate)
					tomorrow.setDate(tomorrow.getMonth() + 1);
					//log.debug('date', tomorrow);
					var endDate = scriptContext.newRecord.getValue('custrecord_da_leave_duty_res_date');
            log.debug('endDate',endDate);
            endDate.setDate(endDate.getDate() - 1);
            log.debug('endDate',endDate);
            var parsedEndDate = format.parse({
                    value: new Date(endDate),
                    type: format.Type.DATE
                });
                var formattedEndDate = format.format({
                    value: parsedEndDate,
                    type: format.Type.DATE
                });
                log.debug('formattedEndDate',formattedEndDate);
            if (approval_status == 25 && scriptContext.type == "view") {
						var empId = scriptContext.newRecord.getValue('custrecord_da_employee_leave');
						var currentRecId = scriptContext.newRecord.id;
              var leaveType = scriptContext.newRecord.getValue('custrecord_da_leave_setting_record');
						var s = search.create({
							type: "customrecordtype",
							filters: [
								["scriptid", "is", "customrecord_da_employee_leaves"]
							],
							columns: ["name", "scriptid"]
						}).run().getRange(0, 1);
						var recordId = s[0].id;
						log.debug('recordId', recordId);
						var empLeaves = scriptContext.form.addButton({
							id: 'custpage_create_leave',
							label: 'Approve and Create New Leave',
							functionName: 'createNewLeave("' + formattedStartDate + '","' + formattedEndDate + '","' + recordId + '","' + empId + '","' + currentRecId + '","' + leaveType + '")'
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
            
            var subsidairyId = scriptContext.newRecord.getValue('custrecord_da_leave_emp_subsidiary');
					if (true) {
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
							var generalSettingsRecId = result.id;
							scriptContext.newRecord.setValue('custrecord_da_leave_general_setting_rec', generalSettingsRecId);
						});
					}
            var leaveCategory = scriptContext.newRecord.getValue('custrecord_da_emp_leavetype')
            if (leaveCategory == 2 && scriptContext.type == 'create') {
              var settingsRec = record.load({
                type: 'customrecord_da_leave_types_settings',
                id: scriptContext.newRecord.getValue('custrecord_da_leave_setting_record')
              });
              var availSickLeaves = settingsRec.getValue('custrecord_da_no_of_days');
              var sickLeaveBalance = scriptContext.newRecord.getValue('custrecord_da_sickleave_balance');
              if (availSickLeaves == sickLeaveBalance) {
                scriptContext.newRecord.setValue('custrecord_da_sickleave_period', true);
              }
              var empID = scriptContext.newRecord.getValue('custrecord_da_employee_leave');
              var customrecord_da_leavesSearchObj = search.create({
                type: "customrecord_da_employee_leaves",
                filters: [
                  ["custrecord_da_sickleave_period", "is", "T"],
                  "AND",
                  ["custrecord_da_employee_leave", "anyof", empID]
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
                  type: 'customrecord_da_employee_leaves',
                  id: result.id,
                  values: {
                    'custrecord_da_sickleave_period': false
                  }
                });
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
        function afterSubmit(scriptContext) {
          try {
            var startDate = scriptContext.newRecord.getValue('custrecord_da_leave_startdate');
            var endDate = scriptContext.newRecord.getValue('custrecord_da_leave_enddate');
            var noOfMonths = monthDiff(startDate, endDate);
            log.debug('noOfMonths', noOfMonths);
            var employeeId = scriptContext.newRecord.getValue('custrecord_da_employee_leave');
            var leavesRec = record.load({
              type: 'customrecord_da_employee_leaves',
              id: scriptContext.newRecord.id
            });
            var generalSettingRec = record.load({
                type: 'customrecord_da_general_settings',
                id: scriptContext.newRecord.getValue('custrecord_da_leave_general_setting_rec')
              });
            
            var workingDaysPermonth = generalSettingRec.getValue('custrecord_da_setting_working_days');
          
            var lineCount = leavesRec.getLineCount({
              sublistId: 'recmachcustrecord_da_emp_leaves'
            });
            if(lineCount > 1){
              for (var i = 0; i < lineCount; i++) {
              var startDateOfLeave = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i
              });
              var endDateOfLeave = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i
              });
              var endDay = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i,
              }).getDate();
              var emonth = (leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i,
              }).getMonth()) + 1;
              var eYear = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i,
              }).getFullYear();
              var startDay = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i,
              }).getDate();
              var startmonth = (leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i
              }).getMonth()) + 1;
              var startYear = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i
              }).getFullYear();
              var leaveSettingsRec = record.load({
                type: 'customrecord_da_leave_types_settings',
                id: scriptContext.newRecord.getValue('custrecord_da_leave_setting_record')
              });
              var diffDays = calculateNoOfdays(startDateOfLeave, endDateOfLeave);
                diffDays = diffDays.toFixed(0);
             log.debug('sfdsfsd',diffDays);
              var removeWeekEnd = leaveSettingsRec.getValue('custrecord_da_remove_weekends');
              var removeHolidays = leaveSettingsRec.getValue('custrecord_da_remove_holidays');
              var removeRestDays = leaveSettingsRec.getValue('custrecord_da_remove_rest_days');
              
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
              var LeaveDays = 0;
              var LeaveDaysForPayment = 0;
              var endDate = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i
              });
              var startDate = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i
              });
              var weekEnds = calculateNoOfWeekEnds(startDate, endDate, weekEnd);
              log.debug('weekEnds', weekEnds);
              var endDate = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_end_date',
                line: i
              });
              var startDate = leavesRec.getSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_month_start_date',
                line: i
              });;
              log.debug('restDay', restDay + "startDate" + startDate + "endDate" + endDate);
              var restDays = calculateNoOfWeekEnds(startDate, endDate, restDay);
              if (removeWeekEnd) {
                LeaveDays = parseFloat(LeaveDays) - parseFloat(weekEnds);
              }
              if (removeRestDays) {
                LeaveDays = parseFloat(LeaveDays) - parseFloat(restDays);
              }
              log.debug('restDays', restDays);
              if (removeHolidays) {
                LeaveDays = parseFloat(LeaveDays) - parseFloat(NoOfholidays);
              }
              LeaveDays = parseFloat(diffDays) + parseFloat(LeaveDays);
              var removeWeekEnd1 = leaveSettingsRec.getValue('custrecord_da_remove_weekends1');
              var removeHolidays1 = leaveSettingsRec.getValue('custrecord_da_remove_holidays1');
              var removeRestDays1 = leaveSettingsRec.getValue('custrecord_da_remove_rest_days1');
              log.debug('LeaveDaysForPayment', LeaveDaysForPayment);
              if (removeWeekEnd1) {
                log.debug('weekEnds', weekEnds);
                LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(weekEnds);
                log.debug('LeaveDaysForPayment', LeaveDaysForPayment);
              }
              if (removeRestDays1) {
                LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(restDays);
                log.debug('LeaveDaysForPayment', LeaveDaysForPayment);
              }
              if (removeHolidays1) {
                log.debug('LeaveDaysForPayment', LeaveDaysForPayment);
                LeaveDaysForPayment = parseFloat(LeaveDaysForPayment) - parseFloat(NoOfholidays);
              }
              LeaveDaysForPayment = parseFloat(diffDays) + parseFloat(LeaveDaysForPayment);
              leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_lmonth_leavedays',
                line: i,
                value: LeaveDays
              });
              leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_leave_paymentdays',
                line: i,
                value: LeaveDaysForPayment
              });
              log.debug('startDate', startDate);
              if (isFirstDay(leavesRec.getSublistValue({
                  sublistId: 'recmachcustrecord_da_emp_leaves',
                  fieldId: 'custrecord_da_month_start_date',
                  line: i
                })) && isLastDay(leavesRec.getSublistValue({
                  sublistId: 'recmachcustrecord_da_emp_leaves',
                  fieldId: 'custrecord_da_month_end_date',
                  line: i
                }))) {
                leavesRec.setSublistValue({
                  sublistId: 'recmachcustrecord_da_emp_leaves',
                  fieldId: 'custrecord_da_fullmonth',
                  line: i,
                  value: true
                });
                 leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_lmonth_leavedays',
                line: i,
                value: workingDaysPermonth
              });
                 leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_leave_paymentdays',
                line: i,
                value: workingDaysPermonth
              });
              }
                
               /* if(isLastDay(leavesRec.getSublistValue({
                  sublistId: 'recmachcustrecord_da_emp_leaves',
                  fieldId: 'custrecord_da_month_end_date',
                  line: i
                }))){
                   leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_lmonth_leavedays',
                line: i,
                value: LeaveDays -1
              });
                   leavesRec.setSublistValue({
                sublistId: 'recmachcustrecord_da_emp_leaves',
                fieldId: 'custrecord_da_leave_paymentdays',
                line: i,
                value: LeaveDays -1
              });
                }*/
              log.debug('endDateOfLeave', endDateOfLeave);
            }
            leavesRec.save();
            }
            
          } catch (ex) {
            log.error(ex.name, ex.message);
          }
        }

        function isFirstDay(dt) {
          var firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1);
          if (firstDay.getDate() == dt.getDate()) {
            return true;
          } else {
            return false;
          }
        }

        function isLastDay(dt) {
          var test = new Date(dt.getTime()),
            month = test.getMonth();
          test.setDate(test.getDate() + 1);
          return test.getMonth() !== month;
        }

        function calculateNoOfdays(date1, date2) {
          var Difference_In_Time = date2.getTime() - date1.getTime();
            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            return Difference_In_Days + 1;
        }

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

        function monthDiff(d1, d2) {
          var months;
          months = (d2.getFullYear() - d1.getFullYear()) * 12;
          months -= d1.getMonth();
          months += d2.getMonth();
          return months <= 0 ? 0 : months;
        }
        return {
          beforeLoad: beforeLoad,
          beforeSubmit: beforeSubmit,
          afterSubmit: afterSubmit
        };
      });