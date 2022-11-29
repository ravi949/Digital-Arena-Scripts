/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],
    function(record, search, runtime, format) {
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
                var payrollProcessId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_payroll_process_id"
                });
                var customrecord_payroll_process_detailsSearchObj = search.create({
                    type: "customrecord_payroll_process_details",
                    filters: [
                        ["custrecord_payroll_process_parent", "anyof", payrollProcessId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_payroll_process_detailsSearchObj.runPaged().count;
                log.debug("customrecord_payroll_process_detailsSearchObj result count", searchResultCount);
                customrecord_payroll_process_detailsSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_payroll_process_details',
                        id: result.id
                    })
                    return true;
                });

                var customrecord_payroll_process_detailsSearchObj = search.create({
                    type: "customrecord_da_attendance_deduction",
                    filters: [
                        ["custrecord_da_att_ded_parent", "anyof", payrollProcessId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_payroll_process_detailsSearchObj.runPaged().count;
                log.debug("customrecord_payroll_process_detailsSearchObj result count", searchResultCount);
                customrecord_payroll_process_detailsSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_attendance_deduction',
                        id: result.id
                    })
                    return true;
                });
                var superVisorId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_supervisor_id"
                });
                var subId = runtime.getCurrentScript().getParameter({
                    name: "custscript_param_subsidairy"
                });
                //log.debug('recId', superVisorId);
                //log.debug('mapreduce script triggered'); 
                if (superVisorId) {
                    return search.create({
                        type: "employee",
                        filters: [
                            ["supervisor", "anyof", superVisorId]
                        ],
                        columns: ['internalid']
                    });
                } else {
                    return search.create({
                        type: "employee",
                        filters: [["subsidiary", "anyof", subId]],
                        columns: ['internalid']
                    });
                }
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
                //log.debug('map context', context.key);
                context.write({
                    key: context.key,
                    value: context.key
                });
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
                var empRecId = JSON.parse(context.key);
              
                //Genral Settings
                  /*  var featureEnabled = runtime.isFeatureInEffect({
                        feature: 'SUBSIDIARIES'
                    });
                    log.debug(featureEnabled);*/
                    var generalSettingRecID = 0;
                    var employeeSubsidairy;
                    var empRecord;

                    empRecord = record.load({
                        type: 'employee',
                        id: empRecId
                    });

                    var postingPeriod = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_pp_posting_period"
                });
                //log.debug('postingPeriod', postingPeriod);
                var postingperiodMonth = postingPeriod.trim();
                //log.debug('postingperiodMonth', postingperiodMonth);
                var ppMonth = postingPeriod.split(" ")[0];
                var monthsobj = {
                    'Jan': '01',
                    'Feb': '02',
                    'Mar': '03',
                    'Apr': '04',
                    'May': '05',
                    'Jun': '06',
                    'Jul': '07',
                    'Aug': '08',
                    'Sep': '09',
                    'Oct': '10',
                    'Nov': '11',
                    'Dec': '12'
                };
                var postingPeriodMonth = monthsobj[ppMonth];
                var postingPeriodYear = postingPeriod.split(" ")[1];
                //log.debug("month & year",postingPeriodMonth +" "+postingPeriodYear);
                var lastDate = daysInMonth(postingPeriodMonth, postingPeriodYear);
                var payrollProcessType = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_payroll_type"
                });
               log.debug('date', (postingPeriodMonth - 1) + "/" + postingPeriodYear+"15/" + postingPeriodMonth + "/" + postingPeriodYear);

                var lateHours = 0;
                var absenceDays = 0;
                if (postingPeriodMonth > 1) { 
                  log.debug('postingPeriodMonth', postingPeriodMonth)
                    if (payrollProcessType == 2) {
                        var customrecord_da_hamat_attendanceSearchObj = search.create({
                               type: "customrecord_da_hamat_attendance",
                               filters:
                               [
                                  ["custrecord_da_employee_att", "anyof", empRecId],                              
                                  "AND", 
                                  ["custrecord_da_att_date","within","16/" + (postingPeriodMonth - 1) + "/" + postingPeriodYear, "15/" + postingPeriodMonth + "/" + postingPeriodYear]
                               ],
                               columns:
                               [
                                  search.createColumn({
                                     name: "custrecord_da_att_value",
                                     summary: "SUM",
                                     label: "Absence Days"
                                  }),
                                  search.createColumn({
                                     name: "custrecord_da_att_hours_points",
                                     summary: "SUM",
                                     label: "Hours(Points)"
                                  })
                               ]
                            });
                            var searchResultCount = customrecord_da_hamat_attendanceSearchObj.runPaged().count;
                            log.debug("customrecord_da_hamat_attendanceSearchObj result count",searchResultCount);
                            customrecord_da_hamat_attendanceSearchObj.run().each(function(result){
                               lateHours = result.getValue({
                                 name :'custrecord_da_att_hours_points',
                                 summary : search.Summary.SUM
                               });
                               absenceDays = result.getValue({
                                 name :'custrecord_da_att_value',
                                 summary : search.Summary.SUM
                               });
                               return true;
                            });
                    }
                } else {                    
                    if (payrollProcessType == 2) {

                        var customrecord_da_hamat_attendanceSearchObj = search.create({
                               type: "customrecord_da_hamat_attendance",
                               filters:
                               [
                                 ["custrecord_da_employee_att", "anyof", empRecId],                              
                                  "AND", 
                                  ["custrecord_da_att_date","within","16/12/"+ (postingPeriodYear - 1), "15/" + postingPeriodMonth + "/" + postingPeriodYear]
                               ],
                               columns:
                               [
                                  search.createColumn({
                                     name: "custrecord_da_att_value",
                                     summary: "SUM",
                                     label: "Absence Days"
                                  }),
                                  search.createColumn({
                                     name: "custrecord_da_att_hours_points",
                                     summary: "SUM",
                                     label: "Hours(Points)"
                                  })
                               ]
                            });
                            var searchResultCount = customrecord_da_hamat_attendanceSearchObj.runPaged().count;
                            log.debug("customrecord_da_hamat_attendanceSearchObj result count",searchResultCount);
                            customrecord_da_hamat_attendanceSearchObj.run().each(function(result){
                               lateHours = result.getValue({
                                 name :'custrecord_da_att_hours_points',
                                 summary : search.Summary.SUM
                               });
                               absenceDays = result.getValue({
                                 name :'custrecord_da_att_value',
                                 summary : search.Summary.SUM
                               });
                               return true;
                            });                      
                    }
                }

                lateHours = (lateHours) ? lateHours :0;
                absenceDays = (absenceDays)? absenceDays : 0;

                log.debug('lateHours', lateHours);
                log.debug('absenceDays', absenceDays);

             


                    if (lateHours > 0 || absenceDays > 0) {


                        employeeSubsidairy = empRecord.getValue('subsidiary');
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
              var workingHrsPerDay = settingsRec.getValue('custrecord_working_hours_per_day');
                //log.debug('recId', empRecId);
                

                 var workingHours = settingsRec.getValue('custrecord_working_hours_per_day');
                  var hoursDifference = parseFloat(absenceDays * workingHours) + parseFloat(lateHours);
                  log.debug('hoursDifference', hoursDifference);
               
                var normalDayWorkingHours = 0;
                var fridayWorkingHours = 0;
                var publicholidayWorkingHours = 0;

                if (hoursDifference != 0) {
                    var payrollProcessId = runtime.getCurrentScript().getParameter({
                        name: "custscript_da_payroll_process_id"
                    });
                    log.debug('payrollProcessType', payrollProcessType);
                    var payrollProcessRec = record.load({
                        type: 'customrecord_da_payroll_process',
                        id: payrollProcessId,
                        isDynamic: true
                    });
                    payrollProcessRec.selectNewLine({
                        sublistId: 'recmachcustrecord_payroll_process_parent'
                    });
                    payrollProcessRec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_payroll_process_parent',
                        fieldId: 'custrecord_da_payroll_pro_employee',
                        value: empRecId
                    });
                    payrollProcessRec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_payroll_process_parent',
                        fieldId: 'custrecord_da_pp_working_hours',
                        value: workingHours
                    });
                    payrollProcessRec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_payroll_process_parent',
                        fieldId: 'custrecord_da_pp_hours_diff',
                        value: hoursDifference
                    });
                    var lookUp = search.lookupFields({
                        type: 'employee',
                        id: empRecId,
                        columns: ['custentity_da_emp_basic_salary', 'custentity_da_attn_ded_value_2']
                    });
                    var empSalary = lookUp.custentity_da_emp_basic_salary;
                  
                    if (empSalary > 0 && generalSettingRecID > 0) {
                       
                        var normalDayOT = settingsRec.getValue('custrecord_normal_working_day_ot');
                        var nonWorkingOt = settingsRec.getValue('custrecord_non_working_day_ot');
                        var phOT = settingsRec.getValue('custrecord_public_holiday_ot');
                        var hourlyRate = lookUp.custentity_da_attn_ded_value;
                        

                        var workingDays = settingsRec.getValue('custrecord_da_setting_working_days');
                       

                        var empBasicSalary = empRecord.getValue('custentity_da_emp_basic_salary');

                        var earningAmount = 0;



                        payrollProcessRec.selectNewLine({
                            sublistId: 'recmachcustrecord_da_att_ded_parent'
                        });
                        payrollProcessRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_att_ded_parent',
                            fieldId: 'custrecord_da_attn_ded_employee',
                            value: empRecId
                        });

                        log.debug('empBasicSalary', empBasicSalary +"workingDays" + workingDays +"workingHours"+ workingHours);

                        var basicValue = ((empBasicSalary / workingDays) / workingHours) * hoursDifference;
                        payrollProcessRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_att_ded_parent',
                            fieldId: 'custrecord_da_attn_ded_amount',
                            value: basicValue.toFixed(2)
                        });

                        var customrecord_da_payroll_itemsSearchObj = search.create({
                           type: "customrecord_da_payroll_items",
                           filters:
                           [
                              ["custrecord_da_payrol_item_category","anyof","1"], 
                              "AND", 
                              ["custrecord_da_payroll_item_subsidiary","anyof",employeeSubsidairy]
                           ],
                           columns:
                           [
                              search.createColumn({name: "internalid", label: "Internal ID"})
                           ]
                        });
                        var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_itemsSearchObj result count",searchResultCount);
                        customrecord_da_payroll_itemsSearchObj.run().each(function(result){
                           payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_att_ded_parent',
                                fieldId: 'custrecord_da_attn_payroll_item',
                                value: result.id
                            });
                           
                        });

                        payrollProcessRec.commitLine({
                            sublistId: 'recmachcustrecord_da_att_ded_parent'
                        });

                          /*  var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empRecId]
                                ],
                                columns: [
                                    
                                    search.createColumn({
                                        name: "custrecord_da_earnings_payroll_item",
                                        label: "Payroll Item"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_amount",
                                        label: "Amount"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                            customrecord_da_emp_earningsSearchObj.run().each(function(result) {

                                var amount = result.getValue('custrecord_da_earnings_amount');

                                earningAmount = parseFloat(earningAmount) + parseFloat(amount);
                                payrollProcessRec.selectNewLine({
                                    sublistId: 'recmachcustrecord_da_att_ded_parent'
                                });
                                payrollProcessRec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_att_ded_parent',
                                    fieldId: 'custrecord_da_attn_ded_employee',
                                    value: empRecId
                                });

                                var value = ((amount / workingDays) / workingHours) * hoursDifference;
                                payrollProcessRec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_att_ded_parent',
                                    fieldId: 'custrecord_da_attn_ded_amount',
                                    value: value.toFixed(2)
                                });

                                payrollProcessRec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_att_ded_parent',
                                    fieldId: 'custrecord_da_attn_payroll_item',
                                    value: result.getValue('custrecord_da_earnings_payroll_item')
                                });

                                payrollProcessRec.commitLine({
                                    sublistId: 'recmachcustrecord_da_att_ded_parent'
                                });
                                return true;
                            });*/

                        //var totalDeduction = parseFloat(empBasicSalary) + parseFloat(earningAmount);

                       // var hourlyRate = ((totalDeduction/workingDays)/workingHours);

                        if (payrollProcessType == 1) {
                            payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_payroll_process_parent',
                                fieldId: 'custrecord_da_pp_normal_day_working_hour',
                                value: normalDayWorkingHours
                            });
                            payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_payroll_process_parent',
                                fieldId: 'custrecord_da_pp_friday_working_hours',
                                value: fridayWorkingHours
                            });
                            payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_payroll_process_parent',
                                fieldId: 'custrecord_da_pp_public_hol_work_hrs',
                                value: publicholidayWorkingHours
                            });
                            payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_payroll_process_parent',
                                fieldId: 'custrecord_da_pp_total_amount',
                                value: Number(parseFloat((normalDayWorkingHours * normalDayOT * hourlyRate)) + parseFloat((fridayWorkingHours * nonWorkingOt * hourlyRate)) + parseFloat((2 * phOT * hourlyRate))).toFixed(3)
                            });
                        }
                        if (payrollProcessType == 2) {
                            payrollProcessRec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_payroll_process_parent',
                                fieldId: 'custrecord_da_pp_total_amount',
                                value: (Number(hourlyRate * hoursDifference)).toFixed(3)
                            });
                        }
                        payrollProcessRec.commitLine({
                            sublistId: 'recmachcustrecord_payroll_process_parent'
                        });
                    }
                    payrollProcessRec.save();
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                var payrollProcessId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_payroll_process_id"
                });
                //log.debug('payrollProcessType', payrollProcessType);
                var payrollProcessRec = record.load({
                    type: 'customrecord_da_payroll_process',
                    id: payrollProcessId,
                    isDynamic: true
                });
                payrollProcessRec.setValue('custrecord_da_payroll_processing', false);
                payrollProcessRec.setValue('custrecord_da_payroll_processed', true);
                payrollProcessRec.save();
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