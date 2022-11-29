/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record', 'N/format'],

    function(task, search, record, format) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} rec - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var empId = scriptContext.newRecord.getValue('custrecord_da_employee_leave');
                var empRecord = record.load({
                    type: 'employee',
                    id: empId
                });
                var projectresource = empRecord.getValue('isjobresource');
                var rec = record.load({
                    type: 'customrecord_da_employee_leaves',
                    id: scriptContext.newRecord.id,
                    isDynamic: true
                });
                var leaveStartDate = rec.getValue('custrecord_da_leave_startdate');
                var leaveType = rec.getValue('custrecord_da_emp_leavetype');

                var dutyResumptionDate = rec.getValue('custrecord_da_leave_duty_res_date');

                rec.setValue('custrecord_da_emp_leavedays', calculateNoOfdays(leaveStartDate, dutyResumptionDate));
                rec.setValue('custrecord_da_leave_approvalstatus', 24);
                var leaveEndDate = rec.getValue('custrecord_da_leave_enddate');
                var date1, date2;
                //define two date object variables with dates inside it
                date1 = leaveEndDate;
                date2 = dutyResumptionDate;

                //calculate time difference
                var time_difference = date2.getTime() - date1.getTime();

                //calculate days difference by dividing total milliseconds in a day
                var days_difference = time_difference / (1000 * 60 * 60 * 24);

                log.debug('days_difference', days_difference);
                days_difference = parseFloat(days_difference) - parseFloat(1);

                if (days_difference != 0) {

                    if (leaveType == 1) {




                        var leaveAdjRec = record.create({
                            type: 'customrecord_da_leave_adjustments'
                        });
                        leaveAdjRec.setValue('custrecord_da_leave_adj_employee', rec.getValue('custrecord_da_employee_leave'));
                        leaveAdjRec.setValue('custrecord_da_leave_adj_days', -(days_difference));
                        leaveAdjRec.setValue('custrecord_da_leave_adj_description', "Leave Adjustment for Dusty Resumption of leave");
                        leaveAdjRec.setValue('custrecord_da_leave_adjustment_date', new Date());
                        leaveAdjRec.save();
                    }


                    if (leaveType == 3) {

                        var customrecord_da_payroll_itemsSearchObj = search.create({
                            type: "customrecord_da_payroll_items",
                            filters: ["custrecord_da_payrol_item_category", "anyof", "1"],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_standarad_payroll_item_id",
                                    label: "Standarad payroll Item ID"
                                })
                            ]
                        });
                        var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                        var basicSalaryPayrollItemId = searchObj[0].id;
                        var actualBasicSalary = empRecord.getValue('custentity_da_total_basic_salalry');
                        var generalSettingRec = record.load({
                            type: 'customrecord_da_general_settings',
                            id: scriptContext.newRecord.getValue('custrecord_da_leave_general_setting_rec')
                        });
                        var workingDaysPerMonth = generalSettingRec.getValue('custrecord_da_setting_working_days');

                        var customrecord_monthly_add_and_deductionsSearchObj = search.create({
                            type: "customrecord_monthly_add_and_deductions",
                            filters: [
                                ["custrecord_da_cretaed_from_leave", "anyof", scriptContext.newRecord.id]
                            ],
                            columns: [

                                search.createColumn({
                                    name: "custrecord_da_additional_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_monthly_add_and_deductionsSearchObj.runPaged().count;
                        log.debug("customrecord_monthly_add_and_deductionsSearchObj result count", searchResultCount);
                        customrecord_monthly_add_and_deductionsSearchObj.run().each(function(result) {
                            record.delete({
                                type: 'customrecord_monthly_add_and_deductions',
                                id: result.id
                            })
                            return true;
                        });




                        var numLines = rec.getLineCount({
                            sublistId: 'recmachcustrecord_da_emp_leaves'
                        });
                        for (var i = numLines - 1; i >= 0; i--) {
                            rec.removeLine({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                line: i,
                                ignoreRecalc: true
                            });
                        }

                        var LeaveDays = rec.getValue('custrecord_da_emp_leavedays');

                        var annualLeaveBalance = rec.getValue('custrecord_da_annual_leave_balance');

                        //setting monthly lines 
                        var startDate = rec.getValue('custrecord_da_leave_startdate');
                        var endDate = rec.getValue('custrecord_da_leave_duty_res_date');
                        var actualStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                        var noOfMonths = monthDiff(startDate, endDate);
                        log.debug('noOfMonths', noOfMonths);
                        var employeeId = rec.getValue('custrecord_da_employee_leave');
                        if (noOfMonths == 0) {
                            rec.selectNewLine({
                                sublistId: 'recmachcustrecord_da_emp_leaves'
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_emp_month_leave',
                                value: employeeId
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_month_name',
                                value: startDate
                            })
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_leave_actual_start_date',
                                value: new Date(startDate.getFullYear(), startDate.getMonth(), 1)
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_month_start_date',
                                value: startDate
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_month_end_date',
                                value: endDate
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_lmonth_leavedays',
                                value: calculateNoOfdays(startDate, endDate)
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_leave_paymentdays',
                                value: calculateNoOfdays(startDate, endDate)
                            });
                            rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_emp_leaves',
                                fieldId: 'custrecord_da_month_wise_advance_leave',
                                value: rec.getValue('custrecord_da_advance_leave')
                            });
                            rec.commitLine({
                                sublistId: 'recmachcustrecord_da_emp_leaves'
                            });

                            month = format.parse({
                                value: startDate,
                                type: format.Type.DATE
                            });
                            var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                            var amount = (actualBasicSalary / workingDaysPerMonth) * calculateNoOfdays(startDate, endDate);

                            var rec2 = record.create({
                                type: 'customrecord_monthly_add_and_deductions'
                            });
                            rec2.setValue('custrecord_da_addition_employee', empId);
                            rec2.setValue('custrecord_da_add_or_ded_type', 2);
                            rec2.setValue('custrecord_da_addition_type', basicSalaryPayrollItemId);
                            rec2.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                            rec2.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                            rec2.setValue('custrecord_da_add_ded_comments', 'Unpaid Leave Deduction');
                            rec2.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                            rec2.save();

                            //earnings deductions
                            var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empId], "AND", ["custrecord_da_earnings_amount", "greaterthan", 0]
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
                                    type: 'customrecord_da_payroll_items',
                                    id: payrollitem
                                }).getValue('custrecord_da_payrol_item_category');
                                var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                                var type = result.getValue({
                                    name: 'custrecord_da_payroll_item_type_f_or_v',
                                    join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                                });
                                log.debug('type', type + "payrollitem" + payrollitem);
                                var payrollamount = result.getValue('custrecord_da_earnings_amount');

                                payrollamount = (payrollamount / workingDaysPerMonth) * calculateNoOfdays(startDate, endDate);
                                if (itemCategory == 28 && days < 20) {
                                    payrollamount = 0;
                                }
                                var rec1 = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec1.setValue('custrecord_da_addition_employee', empId);
                                rec1.setValue('custrecord_da_add_or_ded_type', 2);
                                rec1.setValue('custrecord_da_addition_type', payrollitem);
                                rec1.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec1.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                                rec1.setValue('custrecord_da_add_ded_comments', payrollitemText);
                                rec1.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec1.save();

                                return true;
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
                                rec.selectNewLine({
                                    sublistId: 'recmachcustrecord_da_emp_leaves'
                                });
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_emp_month_leave',
                                    value: employeeId
                                });
                                if (rec.getValue('custrecord_da_advance_leave') == true) {
                                    rec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_emp_leaves',
                                        fieldId: 'custrecord_da_leave_actual_start_date',
                                        value: new Date((rec.getValue('custrecord_da_leave_startdate')).getFullYear(), (rec.getValue('custrecord_da_leave_startdate')).getMonth(), 1)
                                    });
                                } else {
                                    rec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_emp_leaves',
                                        fieldId: 'custrecord_da_leave_actual_start_date',
                                        value: new Date(startDateOfLeave.getFullYear(), startDateOfLeave.getMonth(), 1)
                                    });
                                }
                                if (i == 0) {
                                    rec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_emp_leaves',
                                        fieldId: 'custrecord_da_month_name',
                                        value: startDateOfLeave
                                    });
                                } else {
                                    rec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_emp_leaves',
                                        fieldId: 'custrecord_da_month_name',
                                        value: new Date(startDateOfLeave.getFullYear(), startDateOfLeave.getMonth(), 1)
                                    });
                                }
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_month_start_date',
                                    value: startDateOfLeave
                                });
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_month_end_date',
                                    value: endDateOfLeave
                                });
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_lmonth_leavedays',
                                    value: 0
                                });
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_month_wise_advance_leave',
                                    value: rec.getValue('custrecord_da_advance_leave')
                                });
                                rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_emp_leaves',
                                    fieldId: 'custrecord_da_leave_paymentdays',
                                    value: 0
                                });
                                rec.commitLine({
                                    sublistId: 'recmachcustrecord_da_emp_leaves'
                                });

                                 month = format.parse({
                                value: startDateOfLeave,
                                type: format.Type.DATE
                            });
                            var postingPeriodId = getPostingPeriodId(month.getMonth() + 1, month.getFullYear());
                            var amount = (actualBasicSalary / workingDaysPerMonth) * calculateNoOfdays(startDateOfLeave, endDateOfLeave);

                            var rec2 = record.create({
                                type: 'customrecord_monthly_add_and_deductions'
                            });
                            rec2.setValue('custrecord_da_addition_employee', empId);
                            rec2.setValue('custrecord_da_add_or_ded_type', 2);
                            rec2.setValue('custrecord_da_addition_type', basicSalaryPayrollItemId);
                            rec2.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                            rec2.setValue('custrecord_da_additional_amount', amount.toFixed(3));
                            rec2.setValue('custrecord_da_add_ded_comments', 'Unpaid Leave Deduction');
                            rec2.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                            rec2.save();

                            //earnings deductions
                            var customrecord_da_emp_earningsSearchObj = search.create({
                                type: "customrecord_da_emp_earnings",
                                filters: [
                                    ["custrecord_da_earnings_employee", "anyof", empId], "AND", ["custrecord_da_earnings_amount", "greaterthan", 0]
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
                                    type: 'customrecord_da_payroll_items',
                                    id: payrollitem
                                }).getValue('custrecord_da_payrol_item_category');
                                var payrollitemText = result.getText('custrecord_da_earnings_payroll_item');
                                var type = result.getValue({
                                    name: 'custrecord_da_payroll_item_type_f_or_v',
                                    join: 'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'
                                });
                                log.debug('type', type + "payrollitem" + payrollitem);
                                var payrollamount = result.getValue('custrecord_da_earnings_amount');

                                payrollamount = (payrollamount / workingDaysPerMonth) * calculateNoOfdays(startDateOfLeave, endDateOfLeave);
                                if (itemCategory == 28 && days < 20) {
                                    payrollamount = 0;
                                }
                                var rec2 = record.create({
                                    type: 'customrecord_monthly_add_and_deductions'
                                });
                                rec2.setValue('custrecord_da_addition_employee', empId);
                                rec2.setValue('custrecord_da_add_or_ded_type', 2);
                                rec2.setValue('custrecord_da_addition_type', payrollitem);
                                rec2.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                                rec2.setValue('custrecord_da_additional_amount', payrollamount.toFixed(3));
                                rec2.setValue('custrecord_da_add_ded_comments', payrollitemText);
                                rec2.setValue('custrecord_da_cretaed_from_leave', scriptContext.newRecord.id);
                                rec2.save();

                                return true;
                            });
                                log.debug('endDateOfLeave', endDateOfLeave);
                                startDateOfLeave.setDate(endDateOfLeave.getDate() + 1);
                            }
                        }
                        rec.save();

                    }
                }


            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        function calculateNoOfdays(date1, date2) {
            var Difference_In_Time = date2.getTime() - date1.getTime();
            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            return Difference_In_Days + 1;
        }

        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
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