/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],
    function(record, search, runtime, format) {
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
                var leavesRec = scriptContext.newRecord;
                var leaveType = leavesRec.getValue('custrecord_da_emp_leavetype');
                var subsidiary = leavesRec.getValue('custrecord_da_leave_emp_subsidiary');
                var empId = leavesRec.getValue('custrecord_da_employee_leave');
                var empRecord = record.load({
                    type: 'employee',
                    id: empId
                });
                var projectresource = empRecord.getValue('isjobresource');
                var generalSettingRec = record.load({
                    type: 'customrecord_da_general_settings',
                    id: leavesRec.getValue('custrecord_da_leave_general_setting_rec')
                });
                var workingDaysPerMonth = generalSettingRec.getValue('custrecord_da_setting_working_days');
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);

                var totalLeaveDays = scriptContext.newRecord.getValue('custrecord_da_annual_leave_balance');
                var customrecord_da_payroll_itemsSearchObj = search.create({
                    type: "customrecord_da_payroll_items",
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_standarad_payroll_item_id",
                            label: "Standarad payroll Item ID"
                        })
                    ]
                });
              
               

                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_da_emp_leaves'
                });
                if (leaveType == 1) {
 customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "2" //Leave Payment
                                }));
 var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                var leavePaymentPayrollItemId = searchObj[0].id;
                    var employeeLastSettlementDate = empRecord.getValue('custentity_da_last_settlement_date');
                    var employeeLastSettlementDateText = empRecord.getText('custentity_da_last_settlement_date');

                    var lastSettlementDate = empRecord.getValue('hiredate');
                    var lastSettlementDateText = empRecord.getText('hiredate');

                    var lastLeaveDate, lastLeaveDateText;

                    var customrecord_da_employee_leavesSearchObj = search.create({
                        type: "customrecord_da_employee_leaves",
                        filters: [
                            ["custrecord_da_employee_leave", "anyof", empId],
                            "AND",
                            ["custrecord_da_emp_leavetype", "anyof", "1","3"], "AND", ["internalid", "noneof", scriptContext.newRecord.id]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_leave_enddate",
                                sort: search.Sort.ASC,
                                label: "End Date"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                    log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                    customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                        lastLeaveDateText = result.getValue('custrecord_da_leave_enddate');
                        lastLeaveDate = result.getValue('custrecord_da_leave_enddate');
                        lastLeaveDate = format.parse({
                            value: lastLeaveDate,
                            type: format.Type.DATE
                        });
                    });
                    log.debug('employeeLastSettlementDate', employeeLastSettlementDate);
                    log.debug('lastLeaveDate', lastLeaveDate);
                    log.debug('check', employeeLastSettlementDate < lastLeaveDate);
                    if (employeeLastSettlementDate && lastLeaveDate) {
                        if (employeeLastSettlementDate < lastLeaveDate) {
                            lastSettlementDate = lastLeaveDate;
                            lastSettlementDateText = lastLeaveDateText;
                        } else {
                            lastSettlementDate = employeeLastSettlementDate;
                            lastSettlementDateText = employeeLastSettlementDateText;
                        }
                    }

                    if (!employeeLastSettlementDate && lastLeaveDate) {
                        lastSettlementDate = lastLeaveDate;
                        lastSettlementDateText = lastLeaveDateText;
                    }

                    if (employeeLastSettlementDate && !lastLeaveDate) {
                        lastSettlementDate = employeeLastSettlementDate;
                        lastSettlementDateText = employeeLastSettlementDateText;
                    }

                    log.debug('lastSettlementDate', lastSettlementDate);
                    log.debug('lastSettlementDateText', lastSettlementDateText);
                    var startDateText = leavesRec.getText('custrecord_da_leave_startdate');
                    var startDate = leavesRec.getValue('custrecord_da_leave_startdate');
                    log.debug('lastSettlementDateText', lastSettlementDateText);
                    log.debug('startDateText', startDateText);
                    var customrecord_da_employee_leavesSearchObj = search.create({
                        type: "customrecord_da_employee_leaves",
                        filters: [
                            ["custrecord_da_employee_leave", "anyof", empId],
                            "AND",
                            ["custrecord_da_emp_leavetype", "anyof", "3", "12"],
                            "AND",
                            ["custrecord_da_leave_startdate", "within", lastSettlementDateText, startDateText]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_emp_leavedays",
                                sort: search.Sort.ASC,
                                label: "End Date"
                            }),
                            search.createColumn({
                                name: "custrecord_da_emp_leavetype",
                                label: "Leave Type"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                    log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                    var totalPaidDays = 0;
                    var unpaidDays = 0;
                    var totalDeductedDays = 0;
                    customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                        var days = result.getValue('custrecord_da_emp_leavedays');
                        var leaveType = result.getValue('custrecord_da_emp_leavetype');
                        totalDeductedDays = parseFloat(totalDeductedDays) + parseFloat(days);
                        if (leaveType == 3) {
                            unpaidDays = parseFloat(unpaidDays) + parseFloat(days);
                        }
                        if (leaveType == 12) {
                            totalPaidDays = parseFloat(totalPaidDays) + parseFloat(days);
                        }
                        return true;
                    });
                    log.debug('startDate', startDate);
                    log.debug('lastSettlementDate', lastSettlementDate);
                    scriptContext.newRecord.setValue('custrecord_da_last_settlement_date', lastSettlementDate);
                    var workingDays = calculateNoOfdays(lastSettlementDate, startDate);
                    log.debug('lastSettlementDate', lastSettlementDate);
                    log.debug('workingDays', workingDays);
                    workingDays = parseFloat(workingDays) - parseFloat(totalDeductedDays);
                    scriptContext.newRecord.setValue('custrecord_da_wprked_days', workingDays);
                    scriptContext.newRecord.setValue('custrecord_da_annual_paid_days', totalPaidDays);
                    scriptContext.newRecord.setValue('custrecord_da_unpaid_days', unpaidDays);

                    var actualBasicSalary = empRecord.getValue('custentity_da_emp_basic_salary');


                    var holidaysCount = scriptContext.newRecord.getValue('custrecord_da_no_of_holidays');
                    if (holidaysCount > 0) {
                        var month = scriptContext.newRecord.getValue('custrecord_da_leave_startdate');
                        log.debug('month', month);
                        month = format.parse({
                            value: month,
                            type: format.Type.DATE
                        });
                        var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                        record.create({
                            type: 'customrecord_da_monthly_payroll_days'
                        }).setValue('custrecord_da_month_payroll_employee', empId).setValue('custrecord_da_month_payroll_period', postingPeriodId).setValue('custrecord_da_monthly_payroll_type', 2).setValue('custrecord_da_month_payrol_days', holidaysCount).save();
                    }

                    var advanceLeave = scriptContext.newRecord.getValue('custrecord_da_advance_leave');

                    if (advanceLeave) {



                        for (var i = 0; i < lineCount; i++) {

                            var month = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_leave_actual_start_date', i);
                            var days = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_lmonth_leavedays', i);
                            log.debug('month', month);
                            month = format.parse({
                                value: month,
                                type: format.Type.DATE
                            });
                            var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());

                            var month1 = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_month_name', i);

                            month1 = format.parse({
                                value: month1,
                                type: format.Type.DATE
                            });

                            var pp1 = getPostingPeriodId(month1.getMonth() + 1, month1.getFullYear());
                            record.create({
                                type: 'customrecord_da_monthly_payroll_days'
                            }).setValue('custrecord_da_month_payroll_employee', empId).setValue('custrecord_da_monthly_payroll_type', 1).setValue('custrecord_da_month_payroll_period', pp1).setValue('custrecord_da_month_payrol_days', days).save();
                            

                            if (projectresource == null || projectresource == false) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "1" //Basic Salary
                                }));
                            } else {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "6" //Basic salalry
                                }));
                            }
                            var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                            //  log.debug('searchObj',searchObj);
                           // if (searchObj.length > 0) {
                                var amount = (actualBasicSalary / workingDaysPerMonth) * days;
                               // var payrollItemId = searchObj[0].id;
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 1);
                                rec.setValue('custrecord_da_addition_type', leavePaymentPayrollItemId);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', 'Basic Salary');
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();
                           // }

                            //earnings deductions
                            var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empId],"AND", ["custrecord_da_earnings_amount","greaterthan", 0]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_earnings_subsidiary",
                                        label: "Subsidiary"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_employee",
                                        label: "Employee"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_payroll_item",
                                        label: "Payroll Item"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_amount",
                                        label: "Amount"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_allowance_incl_in_gross",
                                        label: "Include in Gross?"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earining_start_date",
                                        label: "Start Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_eearning_end_date",
                                        label: "End Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_type",
                                        label: "Type"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_payroll_item_type_f_or_v",
                                        join: "CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM",
                                        label: "Fixed/Variable"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                            customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                                var payrollitem = result.getValue('custrecord_da_earnings_payroll_item');
                                var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                                var type = result.getValue({
                                    name: 'custrecord_da_payroll_item_type_f_or_v',
                                    join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                                });
                                log.debug('type', type + "payrollitem" + payrollitem);
                                var payrollamount = result.getValue('custrecord_da_earnings_amount');
                              
                              if(payrollamount > 0){
                                payrollamount = (payrollamount / workingDaysPerMonth) * days;
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 1);
                                rec.setValue('custrecord_da_addition_type', leavePaymentPayrollItemId);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', payrollitemText);
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();
                              }

                                

                                return true;
                            });

                        }
                    } else {
                      log.debug('else');
                       for (var i = 0; i < lineCount; i++) {
                         var month = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_leave_actual_start_date', i);
                          var days = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_lmonth_leavedays', i);
                            log.debug('month', month);
                        month = format.parse({
                            value: month,
                            type: format.Type.DATE
                        });
                        var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                        record.create({
                            type: 'customrecord_da_monthly_payroll_days'
                        }).setValue('custrecord_da_month_payroll_employee', empId).setValue('custrecord_da_monthly_payroll_type', 1).setValue('custrecord_da_month_payroll_period', postingPeriodId).setValue('custrecord_da_month_payrol_days', days).save();


                           if (projectresource == null || projectresource == false) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "1" //Basic Salary
                                }));
                            } else {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "6" //Basic salalry
                                }));
                            }
                            var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                            //  log.debug('searchObj',searchObj);
                           // if (amount > 0) {
                                var amount = (actualBasicSalary / workingDaysPerMonth) * days;
                               // var payrollItemId = searchObj[0].id;
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 1);
                                rec.setValue('custrecord_da_addition_type', leavePaymentPayrollItemId);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', 'Leaves');
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();
                            //}

                            //earnings deductions
                            var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empId]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_earnings_subsidiary",
                                        label: "Subsidiary"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_employee",
                                        label: "Employee"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_payroll_item",
                                        label: "Payroll Item"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_amount",
                                        label: "Amount"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_allowance_incl_in_gross",
                                        label: "Include in Gross?"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earining_start_date",
                                        label: "Start Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_eearning_end_date",
                                        label: "End Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_type",
                                        label: "Type"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_payroll_item_type_f_or_v",
                                        join: "CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM",
                                        label: "Fixed/Variable"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                            customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                                var payrollitem = result.getValue('custrecord_da_earnings_payroll_item');
                                var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                                var type = result.getValue({
                                    name: 'custrecord_da_payroll_item_type_f_or_v',
                                    join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                                });
                                log.debug('type', type + "payrollitem" + payrollitem);
                                var payrollamount = result.getValue('custrecord_da_earnings_amount');

                                payrollamount = (payrollamount / workingDaysPerMonth) * days;
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 1);
                                rec.setValue('custrecord_da_addition_type', leavePaymentPayrollItemId);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', payrollitemText);
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();

                                return true;
                            });

                    }
                    }
                }
                var actualBasicSalary = empRecord.getValue('custentity_da_total_basic_salalry');
                if (leaveType == 3) {
                   for (var i = 0; i < lineCount; i++) {

                            var month = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_month_name', i);
                            var days = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_lmonth_leavedays', i);
                            log.debug('month', month);
                            month = format.parse({
                                value: month,
                                type: format.Type.DATE
                            });
                            var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                     
                     var customrecord_da_unpaid_monthly_daysSearchObj = search.create({
                       type: "customrecord_da_unpaid_monthly_days",
                       filters:
                       [
                          ["custrecord_da_unpaid_month_employee","anyof",empId],"AND",["custrecord_da_monthly_posting_period","anyof", postingPeriodId]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "custrecord_da_unpaid_month_days",
                             summary: "SUM",
                             label: "Days"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_unpaid_monthly_daysSearchObj.runPaged().count;
                    log.debug("customrecord_da_unpaid_monthly_daysSearchObj result count",searchResultCount);
                     var previouslyAppliedDays = 0;
                    customrecord_da_unpaid_monthly_daysSearchObj.run().each(function(result){
                       previouslyAppliedDays = result.getValue({
                         name :'custrecord_da_unpaid_month_days',
                         summary : search.Summary.SUM
                       })
                       return true;
                    });
previouslyAppliedDays = (previouslyAppliedDays)? previouslyAppliedDays: 0;
                     
                     if((parseFloat(days) + parseFloat(previouslyAppliedDays)) >= 30){
                       days = parseFloat(30) - parseFloat(previouslyAppliedDays);
                     }
                            record.create({
                            type: 'customrecord_da_unpaid_monthly_days'
                          }).setValue('custrecord_da_unpaid_month_employee', empId).setValue('custrecord_da_monthly_posting_period', postingPeriodId).setValue('custrecord_da_unpaid_month_days', days).save();
                            

                            if (projectresource == null || projectresource == false) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "1" //Basic Salary
                                }));
                            } else {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "6" //Basic salalry
                                }));
                            }
                            var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                            //  log.debug('searchObj',searchObj);
                            if (searchObj.length > 0) {
                                var amount = (actualBasicSalary / workingDaysPerMonth) * days;
                                var payrollItemId = searchObj[0].id;
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 2);
                                rec.setValue('custrecord_da_addition_type', payrollItemId);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', 'Unpaid Leave Deduction');
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();
                            }

                            //earnings deductions
                            var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empId],"AND", ["custrecord_da_earnings_amount","greaterthan", 0]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_earnings_subsidiary",
                                        label: "Subsidiary"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_employee",
                                        label: "Employee"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_payroll_item",
                                        label: "Payroll Item"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_amount",
                                        label: "Amount"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_allowance_incl_in_gross",
                                        label: "Include in Gross?"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earining_start_date",
                                        label: "Start Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_eearning_end_date",
                                        label: "End Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_earnings_type",
                                        label: "Type"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_payroll_item_type_f_or_v",
                                        join: "CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM",
                                        label: "Fixed/Variable"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                            customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                                var payrollitem = result.getValue('custrecord_da_earnings_payroll_item');
                              var itemCategory = record.load({
                                type :'customrecord_da_payroll_items',
                                id : payrollitem
                              }).getValue('custrecord_da_payrol_item_category');
                                var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                                var type = result.getValue({
                                    name: 'custrecord_da_payroll_item_type_f_or_v',
                                    join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                                });
                                log.debug('type', type + "payrollitem" + payrollitem);
                                var payrollamount = result.getValue('custrecord_da_earnings_amount');

                                payrollamount = (payrollamount / workingDaysPerMonth) * days;
                              if(itemCategory == 28 && days < 20){
                                payrollamount = 0;
                              }
                                var rec = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec.setValue('custrecord_da_addition_employee', empId);
                                rec.setValue('custrecord_da_add_or_ded_type', 2);
                                rec.setValue('custrecord_da_addition_type', payrollitem);
                                rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                                rec.setValue('custrecord_da_add_ded_comments', payrollitemText);
                                rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec.save();

                                return true;
                            });

                        }
                  /*  var customrecord_da_monthly_leavesSearchObj = search.create({
                        type: "customrecord_da_monthly_leaves",
                        filters: [
                            ["custrecord_da_emp_leaves", "anyof", scriptContext.newRecord.id]
                        ],
                        columns: [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({
                                name: "custrecord_da_month_name",
                                label: "Month"
                            }),
                            search.createColumn({
                                name: "custrecord_da_month_start_date",
                                label: "Start Date"
                            }),
                            search.createColumn({
                                name: "custrecord_da_month_end_date",
                                label: "End Date"
                            }),
                            search.createColumn({
                                name: "custrecord_da_lmonth_leavedays",
                                label: "Leave Days"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leave_paymentdays",
                                label: "Leave Payment Days"
                            }),
                            search.createColumn({
                                name: "custrecord_da_fullmonth",
                                label: "Full Month?"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leavepaid",
                                label: "Leave Paid?"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leave_actual_start_date",
                                label: "Actual Start Date"
                            }),
                            search.createColumn({
                                name: "custrecord_da_month_wise_advance_leave",
                                label: "Advance Leave?"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_monthly_leavesSearchObj.runPaged().count;
                    log.debug("customrecord_da_monthly_leavesSearchObj result count", searchResultCount);
                    customrecord_da_monthly_leavesSearchObj.run().each(function(result) {
                        var isPaid = result.getValue('custrecord_da_leavepaid');
                        var leavePaymentDays = result.getValue('custrecord_da_leave_paymentdays');
                        log.debug('leavePaymentDays', leavePaymentDays);
                        var month = result.getValue('custrecord_da_leave_actual_start_date');
                        log.debug('month', month);
                        month = format.parse({
                            value: month,
                            type: format.Type.DATE
                        });
                        var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                        var amount = (actualBasicSalary / workingDaysPerMonth) * leavePaymentDays;
                        log.debug('amount', amount);
                        customrecord_da_payroll_itemsSearchObj.filters.pop({
                            "name": "custrecord_da_payrol_item_category"
                        });
                        if (projectresource == null || projectresource == false) {
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payrol_item_category",
                                "operator": "anyof",
                                "values": "3" //Unpaid Leave
                            }));
                        } else {
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payrol_item_category",
                                "operator": "anyof",
                                "values": "47" //Project Unpaid Leave
                            }));
                        }
                        var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                        //  log.debug('searchObj',searchObj);
                        if (searchObj.length > 0) {
                            var amount = (actualBasicSalary / workingDaysPerMonth) * leavePaymentDays;
                            var payrollItemId = searchObj[0].id;
                            var rec = record.create({
                                type: 'customrecord_monthly_add_and_deductions'
                            });
                            rec.setValue('custrecord_da_addition_employee', empId);
                            rec.setValue('custrecord_da_add_or_ded_type', 1);
                            rec.setValue('custrecord_da_addition_type', payrollItemId);
                            rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                            rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                            rec.setValue('custrecord_da_add_ded_comments', 'Unpaid Leave Deduction');
                            rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                            rec.save();
                        }
                        //earnings deductions
                        var customrecord_da_emp_earningsSearchObj = search.create({
                            type: "customrecord_da_emp_earnings",
                            filters: [
                                ["custrecord_da_earnings_employee", "anyof", empId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_earnings_subsidiary",
                                    label: "Subsidiary"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_earnings_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_earnings_payroll_item",
                                    label: "Payroll Item"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_earnings_amount",
                                    label: "Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_allowance_incl_in_gross",
                                    label: "Include in Gross?"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_earining_start_date",
                                    label: "Start Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_eearning_end_date",
                                    label: "End Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_earnings_type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_payroll_item_type_f_or_v",
                                    join: "CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM",
                                    label: "Fixed/Variable"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                        log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                        customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                            var payrollitem = result.getValue('custrecord_da_earnings_payroll_item');
                            var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                            var type = result.getValue({
                                name: 'custrecord_da_payroll_item_type_f_or_v',
                                join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                            });
                            log.debug('type', type + "payrollitem" + payrollitem);
                            var payrollamount = result.getValue('custrecord_da_earnings_amount');

                            payrollamount = (payrollamount / workingDaysPerMonth) * leavePaymentDays;
                            var rec = record.create({
                                type: 'customrecord_monthly_add_and_deductions'
                            });
                            rec.setValue('custrecord_da_addition_employee', empId);
                            rec.setValue('custrecord_da_add_or_ded_type', 2);
                            rec.setValue('custrecord_da_addition_type', payrollitem);
                            rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                            rec.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                            rec.setValue('custrecord_da_add_ded_comments', payrollitemText);
                            rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                            rec.save();

                            return true;
                        });
                        return true;
                    });

                    for (var i = 0; i < lineCount; i++) {

                        var month = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_month_name', i);
                        var days = scriptContext.newRecord.getSublistValue('recmachcustrecord_da_emp_leaves', 'custrecord_da_lmonth_leavedays', i);
                        log.debug('month', month);
                        month = format.parse({
                            value: month,
                            type: format.Type.DATE
                        });
                        var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                        record.create({
                            type: 'customrecord_da_monthly_payroll_days'
                        }).setValue('custrecord_da_month_payroll_employee', empId).setValue('custrecord_da_monthly_payroll_type', 1).setValue('custrecord_da_month_payroll_period', postingPeriodId).setValue('custrecord_da_month_payrol_days', days).save();
                    }*/

                }
                if (leaveType == 2) {
                    var leaveStartDate = scriptContext.newRecord.getValue('custrecord_da_leave_startdate');
                    var stMonth = leaveStartDate.getMonth() + 1;
                    var stYear = leaveStartDate.getFullYear();
                    var leaveEndDate = scriptContext.newRecord.getValue('custrecord_da_leave_startdate');
                    var edMonth = leaveEndDate.getMonth() + 1;
                    var edYear = leaveEndDate.getFullYear();
                    var postingPeriodId = getPostingPeriodId(edMonth, edYear);
                    //Sick Leave Code
                    var customrecord_da_leave_types_settingsSearchObj = search.create({
                        type: "customrecord_da_leave_types_settings",
                        filters: [
                            ["custrecord_da_leave_categories", "anyof", "2"], //sick leave
                            "AND",
                            ["custrecord_da_leave_subsidiary", "anyof", subsidiary]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_no_of_days",
                                label: "No Of Days"
                            }),
                            search.createColumn({
                                name: "custrecord_da_frequency_method",
                                label: "Frequency Method"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leave_eligiblity_to_apply",
                                label: "ELIGIBILITY TO APPLY FOR LEAVE (IN YEARS)"
                            }),
                            search.createColumn({
                                name: "custrecord_da_sick_leave_cal_b_or_g",
                                label: "Sick Leave"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_leave_types_settingsSearchObj.runPaged().count;
                    log.debug("customrecord_da_leave_types_settingsSearchObj result count", searchResultCount);
                    customrecord_da_leave_types_settingsSearchObj.run().each(function(result) {
                        var frequencyMethod = result.getValue('custrecord_da_frequency_method');
                        var noOfDaysPerYear = result.getValue('custrecord_da_no_of_days');
                        var eligiblityInYears = result.getValue('custrecord_da_leave_eligiblity_to_apply');
                        var sickLeaveCalcType = result.getValue('custrecord_da_sick_leave_cal_b_or_g');
                        if (sickLeaveCalcType == 2) {
                            actualBasicSalary = empRecord.getValue('custentity_total_salary');
                        }
                        var deductedDaysAlready = 0;
                        var appliedLeaveDays = 0;
                        if (frequencyMethod == 1) {
                            var customrecord_da_employee_leavesSearchObj = search.create({
                                type: "customrecord_da_monthly_leaves",
                                filters: [
                                    ["custrecord_da_emp_leaves.custrecord_da_emp_leavetype", "anyof", "2"],
                                    "AND",
                                    ["custrecord_da_emp_month_leave", "anyof", empId],
                                    "AND",
                                    ["custrecord_da_leave_actual_start_date", "within", "01/01/" + stMonth, "31/12/" + stYear]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_leave_paymentdays",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                            log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                appliedLeaveDays = parseFloat(days) + parseFloat(appliedLeaveDays);
                                return true;
                            });
                            customrecord_da_employee_leavesSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_is_deducted_leave",
                                "operator": "is",
                                "values": true
                            }));
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                deductedDaysAlready = parseFloat(days) + parseFloat(deductedDaysAlready);
                                return true;
                            });
                        }
                        if (frequencyMethod == 2) {
                            var hiredate = empRecord.getValue('hiredate');
                            var hireDateYear = hiredate.getFullYear();
                            var hireDateMonth = hiredate.getMonth();
                            var hireaDateDate = hiredate.getDate();
                            var actualStartDateYear;
                            var actualEndDateYear;
                            var leaveStartDateYear = stYear;
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
                                type: "customrecord_da_monthly_leaves",
                                filters: [
                                    ["custrecord_da_emp_leaves.custrecord_da_emp_leavetype", "anyof", "2"],
                                    "AND",
                                    ["custrecord_da_emp_month_leave", "anyof", empId],
                                    "AND",
                                    ["custrecord_da_leave_actual_start_date", "within", hireaDateDate + "/" + hireDateMonth + "/" + actualStartDateYear, hireaDateDate + "/" + hireDateMonth + "/" + actualEndDateYear]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_leave_paymentdays",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                            log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                appliedLeaveDays = parseFloat(days) + parseFloat(appliedLeaveDays);
                                return true;
                            });
                            customrecord_da_employee_leavesSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_is_deducted_leave",
                                "operator": "is",
                                "values": true
                            }));
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                deductedDaysAlready = parseFloat(days) + parseFloat(deductedDaysAlready);
                                return true;
                            });
                        }
                        if (frequencyMethod == 3) {
                            var customrecord_da_leavesSearchObj = search.create({
                                type: "customrecord_da_employee_leaves",
                                filters: [
                                    ["custrecord_da_sickleave_period", "is", "T"],
                                    "AND",
                                    ["custrecord_da_emp_leaves.custrecord_da_emp_leavetype", "anyof", "2"],
                                    "AND",
                                    ["custrecord_da_employee_leave", "anyof", empId]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_leave_startdate",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_leavesSearchObj.runPaged().count;
                            log.debug("customrecord_da_leavesSearchObj result count", searchResultCount);
                            var startDate;
                            customrecord_da_leavesSearchObj.run().each(function(result) {
                                startDate = result.getValue('custrecord_da_leave_startdate');
                                return true;
                            });
                            log.debug('startDate', startDate);
                            var month = startDate.split("/")[1];
                            var date = startDate.split("/")[0];
                            var year = startDate.split("/")[2];
                            var customrecord_da_employee_leavesSearchObj = search.create({
                                type: "customrecord_da_monthly_leaves",
                                filters: [
                                    ["custrecord_da_emp_month_leave", "anyof", empId],
                                    "AND",
                                    ["custrecord_da_leave_actual_start_date", "within", date + "/" + month + "/" + year, date + "/" + month + "/" + (parseFloat(year) + parseFloat(1))]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_leave_paymentdays",
                                        sort: search.Sort.ASC,
                                        label: "ID"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                            log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                appliedLeaveDays = parseFloat(days) + parseFloat(appliedLeaveDays);
                                return true;
                            });
                            customrecord_da_employee_leavesSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_is_deducted_leave",
                                "operator": "is",
                                "values": true
                            }));
                            customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                var days = result.getValue('custrecord_da_leave_paymentdays');
                                deductedDaysAlready = parseFloat(days) + parseFloat(deductedDaysAlready);
                                return true;
                            });
                        }
                        if (appliedLeaveDays > noOfDaysPerYear) {
                            var extraDaysToDeduct = parseFloat(appliedLeaveDays) - parseFloat(deductedDaysAlready);
                            var customrecord_da_leave_calculationSearchObj = search.create({
                                type: "customrecord_da_leave_calculation",
                                filters: [
                                    ["custrecord_da_leave_cal_parent", "anyof", result.id]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_from_days",
                                        label: "From(Days)"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_to_days",
                                        label: "To(Days)"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_deduction",
                                        label: "Deduction %"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_leave_calculationSearchObj.runPaged().count;
                            log.debug("customrecord_da_leave_calculationSearchObj result count", searchResultCount);
                            customrecord_da_leave_calculationSearchObj.run().each(function(result) {
                                var from = result.getValue('custrecord_da_from_days');
                                var to = result.getValue('custrecord_da_to_days');
                                var deductPercent = result.getValue('custrecord_da_deduction');
                                deductPercent = deductPercent.split("%")[0];
                                log.debug('extraDaysToDeduct', extraDaysToDeduct);
                                if (from <= deductedDaysAlready && deductedDaysAlready <= to) {
                                    var days = parseFloat(to) - parseFloat(deductedDaysAlready);
                                    extraDaysToDeduct = parseFloat(extraDaysToDeduct) - parseFloat(days);
                                    customrecord_da_payroll_itemsSearchObj.filters.pop({
                                        "name": "custrecord_da_payrol_item_category"
                                    });
                                    var amount = (deductPercent / 100) * (actualBasicSalary / workingDaysPerMonth) * days;
                                    //adding sick leave deduction
                                    if (featureEnabled) {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payroll_item_subsidiary",
                                            "operator": "anyof",
                                            "values": subsidiary
                                        }));
                                    }
                                    if (projectresource == false || projectresource == null) {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payrol_item_category",
                                            "operator": "anyof",
                                            "values": "12" //Sick Leave Deduction
                                        }));
                                    } else {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payrol_item_category",
                                            "operator": "anyof",
                                            "values": "50" //Project Sick Leave Deduction
                                        }));
                                    }
                                    var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                                    if (searchObj.length > 0 && amount > 0) {
                                        var payrollItemId = searchObj[0].id;
                                        var rec = record.create({
                                            type: 'customrecord_monthly_add_and_deductions'
                                        });
                                        rec.setValue('custrecord_da_addition_employee', empId);
                                        rec.setValue('custrecord_da_add_or_ded_type', 2);
                                        rec.setValue('custrecord_da_addition_type', payrollItemId);
                                        rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                        rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                                        rec.setValue('custrecord_da_add_ded_comments', "Sick Leave Deduction");
                                        rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                        rec.save();
                                    }
                                }
                                log.debug('extraDaysToDeduct', extraDaysToDeduct);
                                log.debug('appliedLeaveDays', appliedLeaveDays + "from" + from + "to" + to);
                                if (from <= appliedLeaveDays && appliedLeaveDays <= to) {
                                    log.debug('inside');
                                    customrecord_da_payroll_itemsSearchObj.filters.pop({
                                        "name": "custrecord_da_payrol_item_category"
                                    });
                                    log.debug('details', deductPercent + "actualBasicSalary" + actualBasicSalary + "extraDaysToDeduct" + extraDaysToDeduct);
                                    var amount = (deductPercent / 100) * (actualBasicSalary / workingDaysPerMonth) * extraDaysToDeduct;
                                    //adding sick leave deduction
                                    if (featureEnabled) {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payroll_item_subsidiary",
                                            "operator": "anyof",
                                            "values": subsidiary
                                        }));
                                    }
                                    if (projectresource == false || projectresource == null) {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payrol_item_category",
                                            "operator": "anyof",
                                            "values": "12" //Sick Leave Deduction
                                        }));
                                    } else {
                                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                            "name": "custrecord_da_payrol_item_category",
                                            "operator": "anyof",
                                            "values": "50" //Project Sick Leave Deduction
                                        }));
                                    }
                                    var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                                    if (searchObj.length > 0 && amount > 0) {
                                        var payrollItemId = searchObj[0].id;
                                        var rec = record.create({
                                            type: 'customrecord_monthly_add_and_deductions'
                                        });
                                        rec.setValue('custrecord_da_addition_employee', empId);
                                        rec.setValue('custrecord_da_add_or_ded_type', 2);
                                        rec.setValue('custrecord_da_addition_type', payrollItemId);
                                        rec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                        rec.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                                        rec.setValue('custrecord_da_add_ded_comments', "Sick Leave Deduction");
                                        rec.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                        rec.save();
                                    }
                                }
                                return true;
                            });
                        }
                    });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
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
            log.debug('totalDays', totalDays);
            return totalDays - 1;
        }

        function getPostingPeriodId(month, year) {
            var monthsobj = {
                '1': 'Jan',
                '2': 'Feb',
                '3': 'Mar',
                '4': 'Apr',
                '5': 'May',
                '6': 'Jun',
                '7': 'Jul',
                '8': 'Aug',
                '9': 'Sep',
                '10': 'Oct',
                '11': 'Nov',
                '12': 'Dec'
            }
            var postingperiodMonth = monthsobj[month];
            if (month == 0 || month == "0") {
                year = year - 1;
                postingperiodMonth = "Dec";
            }
            log.debug('postingperiodMonth', postingperiodMonth + " " + year);
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters: [
                    ["periodname", "startswith", postingperiodMonth + " " + year]
                ],
                columns: [
                    search.createColumn({
                        name: "periodname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            var searchResultCount = accountingperiodSearchObj.runPaged().count;
            //log.debug("accountingperiodSearchObj result count",searchResultCount);
            var postingPeriodId;
            accountingperiodSearchObj.run().each(function(result) {
                postingPeriodId = result.id;
                return true;
            });
            log.debug('postingPeriodId', postingPeriodId);
            return postingPeriodId;
        }
        return {
            onAction: onAction
        };
    });