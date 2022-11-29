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
                var recId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sch_pay_run_recid"
                });
                //log.debug('recId',recId);
                //Deleting old records which are child records of payrun
                var customrecord_da_pay_run_itemsSearchObj = search.create({
                    type: "customrecord_da_pay_run_items",
                    filters: [
                        ["custrecord_da_pay_run_scheduling", "anyof", recId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
                });
                customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                    //log.debug('id',result.id);
                    record.delete({
                        type: "customrecord_da_pay_run_items",
                        id: result.id
                    });
                    return true;
                });
                //Getting payrun scheduling record with filter processing checkbox is true
                return search.create({
                    type: "customrecord_da_pay_run_scheduling",
                    filters: [
                        ["custrecord_da_sch_payrun_processing", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({
                            name: "custrecord_da_sch_pay_run_account",
                            label: "Account"
                        }),
                        search.createColumn({
                            name: "custrecord_da_sch_pay_run_period",
                            label: "Posting Period"
                        }),
                        search.createColumn({
                            name: "custrecord_da_sch_pay_run_quick_pay",
                            label: "Quick Pay?"
                        }),
                        search.createColumn({
                            name: "custrecord_da_sch_createdby",
                            label: "Created By"
                        })
                    ]
                });
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
            try {
                var recId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sch_pay_run_recid"
                });
                log.debug('recId', recId);
                var payrunSchRecord = record.load({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: recId,
                    isDynamic: true
                });
                var isEmployeegroupExists = payrunSchRecord.getValue('custrecord_sel_employee_group');
                var searchResult = JSON.parse(context.value);
                var payrunSchedulingRecValues = searchResult.values;
               log.debug('payrunSchedulingRecValues', payrunSchedulingRecValues);
                var employeesExists = payrunSchRecord.getValue('custrecord_da_payroll_employees').length > 0;
                log.debug('employeesExists',employeesExists);
               log.debug('isEmployeegroupExists',isEmployeegroupExists);
                if (employeesExists) {
                    var employees = payrunSchRecord.getValue('custrecord_da_payroll_employees');
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
                if (isEmployeegroupExists) {
                  log.debug('sfsd');
                    var groupReec = record.load({
                        type: 'entitygroup',
                        id: isEmployeegroupExists,
                        isDynamic: true
                    });
                    var numLines = groupReec.getLineCount({
                        sublistId: 'groupmembers'
                    });
                    log.debug('d', numLines);
                    var savedSearchID = groupReec.getValue('savedsearch');
                   log.debug(savedSearchID);
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
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);
                if (featureEnabled) {
                    var payrunSubsidiary = payrunSchRecord.getValue("custrecord_da_payroll_subsidiary");
                }
                if (!isEmployeegroupExists && !employeesExists) {
                    //search on employee to get the include in payroll is true
                    var employeeSearchObj = search.create({
                        type: "employee",
                        filters: [
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
                    if (featureEnabled) {
                        employeeSearchObj.filters.push(search.createFilter({
                            "name": "subsidiary",
                            "operator": "anyof",
                            "values": payrunSubsidiary
                        }));
                    }
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
                var postingPeriod = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_posting_period"
                });
                var postingperiodMonth = postingPeriod.trim();
                var userId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_userid"
                });
                var recId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sch_pay_run_recid"
                });
                var employeeRec = JSON.parse(context.key);
                var payrunSchRecord = record.load({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: recId,
                    isDynamic: true
                });
              
               var finalSettlementPayroll = payrunSchRecord.getValue('custrecord_da_finalsettlement_payroll');
                var postingPeriodId = payrunSchRecord.getValue('custrecord_da_sch_pay_run_period');
                var payroll_date_end = payrunSchRecord.getText('custrecord_da_sch_pay_run_date');
                var parentPayrollDate = payrunSchRecord.getText('custrecord_da_sch_pay_run_date').split("/")[0];
                var parentPayrollMonth = payrunSchRecord.getText('custrecord_da_sch_pay_run_date').split("/")[1];
                var parentPayrollYear = payrunSchRecord.getText('custrecord_da_sch_pay_run_date').split("/")[2];
                var payroll_Start_Date = payrunSchRecord.getText('custrecord_da_payrun_sch_start_date');
                var parentPayrollDate1 = payrunSchRecord.getText('custrecord_da_payrun_sch_start_date').split("/")[0];
                var parentPayrollMonth1 = payrunSchRecord.getText('custrecord_da_payrun_sch_start_date').split("/")[1];
                var parentPayrollYear1 = payrunSchRecord.getText('custrecord_da_payrun_sch_start_date').split("/")[2];

                var generalSettingRecID = payrunSchRecord.getValue('custrecord_da_payroll_general_setting_id');
                var genralSettingRec = record.load({
                    type: 'customrecord_da_general_settings',
                    id: generalSettingRecID
                });
                var workingDaysPerMonthFromSettings = genralSettingRec.getValue('custrecord_da_setting_working_days');

                var monthlyDays = workingDaysPerMonthFromSettings;

                var payrunSubsidiary = payrunSchRecord.getValue('custrecord_da_payroll_subsidiary');
                //loading employee record
                var empRecord = record.load({
                    type: 'employee',
                    id: employeeRec.internalid
                });
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                var empSubsidiary = empRecord.getValue("subsidiary");
                log.debug(featureEnabled);
                var subsidiaryMatching = false;

                if (payrunSubsidiary == empSubsidiary) {
                    subsidiaryMatching = true;
                }

                var IsincludedInPayroll = empRecord.getValue("custentity_da_emp_include_in_payroll");

                var alreadyQuickPayed = false;

                var lastPayrollPeriod = empRecord.getValue("custentity_da_last_accountg_period");

                if (lastPayrollPeriod == postingPeriodId) {
                    alreadyQuickPayed = true;
                }

                var payrollSubsidairy = payrunSchRecord.getValue('custrecord_da_payroll_subsidiary');

                var hiredate = empRecord.getText("hiredate");
                var hireDateYear = hiredate.split("/")[2];
                var hiredateMonth = hiredate.split("/")[1];
                var hiredateDate = hiredate.split("/")[0];

                var extraDays = 0;

                var diffDays = dateDifference(new Date(hiredateMonth + "/" + hiredateDate + "/" + hireDateYear), new Date(parentPayrollMonth1 + "/" + parentPayrollDate1 + "/" + parentPayrollYear1));

                log.debug('mmm', diffDays);
              var previousMonthIncluded = true;

                if (diffDays > 0) {

                    if (diffDays < 28) {

                        var customrecord_da_pay_run_itemsSearchObj = search.create({
                            type: "customrecord_da_pay_run_items",
                            filters: [
                                ["custrecord_da_pay_run_employee", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "noneof", postingPeriodId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
                        if (searchResultCount == 0) {
                            previousMonthIncluded = false;
                            extraDays = parseFloat(diffDays) - parseFloat(1);
                        }
                    }
                }


                var paymentList = payrunSchRecord.getValue('custrecord_da_payment_list');
                log.debug('paymentList', paymentList);

                var hiredate = empRecord.getValue("hiredate");
                var payrollEndDate = payrunSchRecord.getValue('custrecord_da_sch_pay_run_date');

                if (subsidiaryMatching && IsincludedInPayroll && generalSettingRecID > 0 && (hiredate <= payrollEndDate)) {

                    var terminationDate = empRecord.getText('releasedate');
                    var isTerminating = false;
                    if (terminationDate) {
                        var terminationDateYear = terminationDate.split("/")[2];
                        var terminationdateMonth = terminationDate.split("/")[1];
                        if ((terminationDateYear == postingPeriodYear) && (Number(terminationdateMonth) == Number(postingPeriodMonth))) {
                            isTerminating = true;
                        }
                    }

                    var postingPeriodYear = postingPeriod.split(" ")[1];
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
                    var payrollType = 0;
                    var payrollTypeDays = 0;
                    var currentPayrollDaysinMonth = daysInMonth(postingPeriodMonth, postingPeriodYear);
                    var fullmonth = true;
                    if (parentPayrollDate != currentPayrollDaysinMonth) {

                        monthlyDays = dateDifference(new Date(parentPayrollMonth1 + "/" + parentPayrollDate1 + "/" + parentPayrollYear1), new Date(parentPayrollMonth + "/" + parentPayrollDate + "/" + parentPayrollYear));
log.debug('monthlyDays', monthlyDays);
                        if (monthlyDays > workingDaysPerMonthFromSettings) {
                            monthlyDays = workingDaysPerMonthFromSettings;
                        }
                        fullmonth = false;
                        var noOfDaysForCalculation = parentPayrollDate;
                    }
                    log.debug('details', hireDateYear + "  " + hiredateMonth + "  " + postingPeriodMonth + "  " + postingPeriodYear);
                    if (hireDateYear < postingPeriodYear) {
                        payrollType = 1;
                    } else if ((hireDateYear == postingPeriodYear) && (Number(hiredateMonth) < Number(postingPeriodMonth))) {
                        payrollType = 1;
                    } else if ((hireDateYear == postingPeriodYear) && (Number(hiredateMonth) == Number(postingPeriodMonth))) {
                        if (Number(hiredateDate) == 1) {
                            payrollType = 1;
                        } else {
                            payrollType = 2;
                            payrollTypeDays = dateDifference(new Date(hiredateMonth + "/" + hiredateDate + "/" + hireDateYear), new Date(parentPayrollMonth + "/" + parentPayrollDate + "/" + parentPayrollYear));
                        
                            var days = parseFloat(hiredateDate) + parseFloat(payrollTypeDays) - parseFloat(1);
                            if (days < workingDaysPerMonthFromSettings) {
                                var extraDays = parseFloat(workingDaysPerMonthFromSettings) - parseFloat(days);
                                //payrollTypeDays = parseFloat(payrollTypeDays) + parseFloat(extraDays);
                            }
                        }
                    }
                  
                    log.debug('payrollTypeDaysesr1', payrollTypeDays);
                    var payrollEndDate = new Date(parentPayrollMonth + "/" + parentPayrollDate + "/" + parentPayrollYear);
                    //termination Date
                    if (terminationDate) {
                        var terminationDateDate = terminationDate.split("/")[0];
                        var terminationDateYear = terminationDate.split("/")[2];
                        var terminationdateMonth = terminationDate.split("/")[1];

                        if ((Number(parentPayrollDate) == Number(terminationDateDate)) && (Number(terminationdateMonth) == Number(postingPeriodMonth))) {

                        } else {
                            if ((terminationDateYear == postingPeriodYear) && (Number(terminationdateMonth) == Number(postingPeriodMonth))) {
                                payrollEndDate = new Date(terminationdateMonth + "/" + terminationDateDate + "/" + terminationDateYear);
                                if (payrollType == 2) {
                                    payrollTypeDays = dateDifference(new Date(hiredateMonth + "/" + hiredateDate + "/" + hireDateYear), new Date(terminationdateMonth + "/" + terminationDateDate + "/" + terminationDateYear));
                                } else {
                                    payrollType = 2;
                                    payrollTypeDays = terminationDate.split("/")[0];
                                }
                            }
                        }

                    }

                    if (payrollType == 1 || payrollType == 0) {
                        var payrollStartDate = payrunSchRecord.getValue('custrecord_da_payrun_sch_start_date');
                    } else {
                        var payrollStartDate = new Date(hiredateMonth + "/" + hiredateDate + "/" + hireDateYear);
                    }




                    if (generalSettingRecID > 0) {
                        var fullMonthChecked = genralSettingRec.getValue('custrecord_da_full_month_working_days');
                        if (!fullMonthChecked) {
                            var excludeFridays = genralSettingRec.getValue('custrecord_da_exclude_fridays_in_working');
                            var excludeSaturdays = genralSettingRec.getValue('custrecord_exclude_saturdays_in_working');
                            var noOfSaturdays = 0,
                                noOfFridays = 0;
                            if (excludeSaturdays) {
                                noOfSaturdays = calculateNoOfSaturdays(payrollStartDate, payrollEndDate);
                            }
                            if (excludeFridays) {
                                noOfFridays = calculateNoOfFridays(payrollStartDate, payrollEndDate);
                            }
                            payrollTypeDays = parseFloat(payrollTypeDays) - parseFloat(noOfFridays) - parseFloat(noOfSaturdays);
                            noOfDaysForCalculation = parseFloat(noOfDaysForCalculation) - parseFloat(noOfFridays) - parseFloat(noOfSaturdays);
                        }
                    }
                  
                    log.debug('payrollTypeDaysesr2', payrollTypeDays);
                    //calculation stars now
                    var leaveamount = 0;
                    var projectresource = empRecord.getValue("isjobresource");
                    log.debug('projectresource', projectresource);

                    var workingDaysPerMonth = genralSettingRec.getValue('custrecord_da_setting_working_days');
                    log.debug('workingdayspermonth', workingDaysPerMonth);

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
                    if (featureEnabled) {
                        customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                            "name": "custrecord_da_payroll_item_subsidiary",
                            "operator": "anyof",
                            "values": payrunSubsidiary
                        }));
                    }
                    if (paymentList.length == 0) {
                        //basic Salary
                        var basic_salary = empRecord.getValue('custentity_da_emp_basic_salary');
                        var customrecord_da_monthly_payroll_daysSearchObj = search.create({
                            type: "customrecord_da_monthly_payroll_days",
                            filters: [
                                ["custrecord_da_month_payroll_employee", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_month_payroll_period", "anyof", postingPeriodId],
                                "AND",
                                ["custrecord_da_monthly_payroll_type", "anyof", "1"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_month_payroll_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_month_payroll_period",
                                    label: "Period"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_month_payrol_days",
                                    sort: search.Sort.ASC,
                                    label: "Days"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_monthly_payroll_type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_emp_worked_days",
                                    label: "Worked Days"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_monthly_payroll_daysSearchObj.runPaged().count;
                        log.debug("customrecord_da_monthly_payroll_daysSearchObj result count", searchResultCount);

                        var paidDaysThroughLeave = 0;
                        customrecord_da_monthly_payroll_daysSearchObj.run().each(function(result) {
                            var days = result.getValue('custrecord_da_month_payrol_days');
                            paidDaysThroughLeave = parseFloat(paidDaysThroughLeave) + parseFloat(days);
                        });

                        log.debug('paidDaysThroughLeave', paidDaysThroughLeave);


                        var holidaysToAdd = 0;
                      
                        log.debug('payrollTypeDaysesr3', payrollTypeDays);
                      log.debug('payrollTypeDaysesr3', payrollTypeDays);

                        if (payrollType == 2) {
                            var basicSalaryDays = parseFloat(payrollTypeDays) + parseFloat(holidaysToAdd) - parseFloat(paidDaysThroughLeave) + parseFloat(extraDays);
                        } else {
                            var basicSalaryDays = parseFloat(monthlyDays) + parseFloat(holidaysToAdd) - parseFloat(paidDaysThroughLeave) + parseFloat(extraDays);
                        }
                      log.debug('basicSalaryDays', basicSalaryDays);
                      if(basicSalaryDays > 0){
                      
  log.debug('empid',  employeeRec.internalid);
                        var basic_salary = empRecord.getValue('custentity_da_emp_basic_salary');
                        basic_salary = (basic_salary / workingDaysPerMonthFromSettings) * basicSalaryDays;

                        customrecord_da_payroll_itemsSearchObj.filters.pop({
                            "name": "custrecord_da_payrol_item_category"
                        });
                        payrunSchRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                        });
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_pay_run_employee',
                            value: employeeRec.internalid
                        });
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_payroll_start_date',
                            value: payrollStartDate
                        });
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_payroll_item_type',
                            value: 1
                        });
                        if (featureEnabled) {
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payroll_item_subsidiary",
                                "operator": "anyof",
                                "values": payrunSubsidiary
                            }));
                        }
                        if (projectresource == false || projectresource == null) {
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payrol_item_category",
                                "operator": "anyof",
                                "values": "1" //Basic Salary 
                            }));
                        } else {
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payrol_item_category",
                                "operator": "anyof",
                                "values": "6" //Project Basic Salary
                            }));
                        }
                        var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                        if (searchObj.length > 0) {
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: searchObj[0].id
                            });
                        }
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_pay_run_item_hours',
                            value: 0
                        });
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_pay_run_item_amount',
                            value: Number(basic_salary).toFixed(2)
                        });
                        payrunSchRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                            fieldId: 'custrecord_da_pay_run_ded_amount',
                            value: Number(basic_salary).toFixed(2)
                        });
                        payrunSchRecord.commitLine({
                            sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                        });

                        //Earnings
                        for (var j = 0; j < empRecord.getLineCount('recmachcustrecord_da_earnings_employee'); j++) {
                            var payrollitem = empRecord.getSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_payroll_item', j);
                            log.audit('payrollitem', payrollitem);
                            var type = empRecord.getSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_type', j);
                            var payrollhours = empRecord.getSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_hours', j);
                            var hold = empRecord.getSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_hold_earning', j);
                            if (hold == false) {

                                if (payrollhours == "" || payrollhours == null || payrollhours == 0 || payrollhours == "0") {
                                    payrollhours = 0;
                                }
                                if (payrollType != 0) {
                                    var payrollamount = empRecord.getSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_amount', j);
                                    if (payrollType == 2) {
                                        var salary_partial_earning = (parseFloat(payrollamount) / workingDaysPerMonth) * basicSalaryDays;
                                        payrollamount = salary_partial_earning;
                                    } else {
                                        payrollamount = (parseFloat(payrollamount) / workingDaysPerMonthFromSettings) * basicSalaryDays;
                                    }
                                    payrunSchRecord.selectNewLine({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_payroll_start_date',
                                        value: payrollStartDate
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_pay_run_employee',
                                        value: employeeRec.internalid
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_payroll_item_type',
                                        value: 1
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_pay_run_paroll_items',
                                        value: payrollitem
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_pay_run_item_hours',
                                        value: payrollhours
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_pay_run_item_amount',
                                        value: Number(payrollamount).toFixed(2)
                                    });
                                    payrunSchRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                        fieldId: 'custrecord_da_pay_run_ded_amount',
                                        value: Number(payrollamount).toFixed(2)
                                    });
                                    payrunSchRecord.commitLine({
                                        sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                    });
                                }
                            }
                        }
                      }

                        //Deductions
                        for (var k = 0; k < empRecord.getLineCount('recmachcustrecord_deduction_employee'); k++) {
                            var deductionpayrollitem = empRecord.getSublistValue('recmachcustrecord_deduction_employee', 'custrecord_deduction_payroll_item', k);
                          var itemCategory =record.load({type :'customrecord_da_payroll_items', id : deductionpayrollitem}).getValue('custrecord_da_payrol_item_category');
                           log.audit('itemCategoryitemCategory',itemCategory);
                            var deductionpayrollamount = empRecord.getSublistValue('recmachcustrecord_deduction_employee', 'custrecord_deduction_payroll_amount', k);
                            //log.audit('7','creating');
                            //log.audit('amount',deductionpayrollamount);
                            //log.audit('pri',deductionpayrollitem);
                          //  if (payrollType == 1) {
                          if(previousMonthIncluded == false && itemCategory == 39){
                            deductionpayrollamount = deductionpayrollamount * 2;
                          }
                                payrunSchRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_payroll_start_date',
                                    value: payrollStartDate
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_employee',
                                    value: employeeRec.internalid
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_payroll_item_type',
                                    value: 2
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_paroll_items',
                                    value: deductionpayrollitem
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_item_hours',
                                    value: 0
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_item_amount',
                                    value: Number(deductionpayrollamount).toFixed(3)
                                });
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_ded_amount',
                                    value: -(Number(deductionpayrollamount).toFixed(3))
                                });
                                payrunSchRecord.commitLine({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                });
                          //  }
                        }
                        //Leave Adjustment Amount
                        var customrecord_da_leave_adjustmentsSearchObj = search.create({
                            type: "customrecord_da_leave_adjustments",
                            filters: [
                                ["custrecord_da_leave_adj_employee", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_include_adjustment_in_payr", "is", "T"],
                                "AND",
                                ["custrecord_da_adjust_period", "anyof", postingPeriodId],
                                //"AND",
                                //["custrecord_da_leave_adjustment_amount", "greaterthan", "0"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_leave_adjustment_amount",
                                    label: "Leave Adjustment Amount"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_leave_adjustmentsSearchObj.runPaged().count;
                        log.debug("customrecord_da_leave_adjustmentsSearchObj result count", searchResultCount);
                        customrecord_da_leave_adjustmentsSearchObj.run().each(function(result) {
                            var amount = result.getValue('custrecord_da_leave_adjustment_amount');
                            amount = -(amount);
                            customrecord_da_payroll_itemsSearchObj.filters.pop({
                                "name": "custrecord_da_payrol_item_category"
                            });
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 1
                            });
                            if (featureEnabled) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payroll_item_subsidiary",
                                    "operator": "anyof",
                                    "values": payrunSubsidiary
                                }));
                            }
                            if (projectresource == null || projectresource == false) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "2" //Leave Payment
                                }));
                            } else {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payrol_item_category",
                                    "operator": "anyof",
                                    "values": "7" //Project Leave Payment
                                }));
                            }
                            var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                            if (searchObj.length > 0) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_paroll_items',
                                    value: searchObj[0].id
                                });
                            }
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(amount).toFixed(2)
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: Number(amount).toFixed(2)
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });
                      
                      if(finalSettlementPayroll == false){
                        
                      
                        for (var k1 = 0; k1 < empRecord.getLineCount('recmachcustrecord_da_sp_term_employee'); k1++) {
                            var sppayrollitem = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_terms_payroll_item', k1);
                            //  log.error('sppayrollitem',sppayrollitem);
                            var itemtype = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_term_type', k1);
                            var sptId = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'id', k1);
                            //log.audit('sptId',sptId);
                            var frequency = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_term_frequency', k1);
                            var totalamount = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_term_total_amount', k1);
                            var paidamount = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_paid_amount', k1);
                            var installmentamount = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_term_instalment_amount', k1);
                            var lastinstallmentpaiddate = empRecord.getSublistText('recmachcustrecord_da_sp_term_employee', 'custrecord_da_last_installment_paid_date', k1);
                            var lastinstallmentStartDate = empRecord.getSublistText('recmachcustrecord_da_sp_term_employee', 'custrecord_da_sp_term_start_date', k1);
                            var hold = empRecord.getSublistValue('recmachcustrecord_da_sp_term_employee', 'custrecord_da_spe_term_hold', k1);

                            if (hold === false) {

                                lastinstallmentStartDate = lastinstallmentStartDate.split('/');
                                var lsdd = lastinstallmentStartDate[0];
                                var lsmm = lastinstallmentStartDate[1]; //January is 0!
                                var lsyyyy = lastinstallmentStartDate[2];
                                lastinstallmentStartDate = new Date(lsmm + "/" + lsdd + "/" + lsyyyy);
                                lastinstallmentpaiddate = lmm + '/' + ldd + '/' + lyyyy;
                                if (lastinstallmentpaiddate != null || lastinstallmentpaiddate != " ") {
                                    lastinstallmentpaiddate = lastinstallmentpaiddate.split('/');
                                    var ldd = lastinstallmentpaiddate[0];
                                    var lmm = lastinstallmentpaiddate[1]; //January is 0!
                                    var lyyyy = lastinstallmentpaiddate[2];
                                    lastinstallmentpaiddate = lmm + '/' + ldd + '/' + lyyyy;
                                }
                                var payrollDate = new Date(parentPayrollMonth + "/" + parentPayrollDate + "/" + parentPayrollYear);
                                //log.debug('ls & payroll', payrollDate + " " + lastinstallmentStartDate);
                                if (lastinstallmentStartDate <= payrollDate) {
                                    log.error('special term');
                                    var today = new Date();
                                    var dd = today.getDate();
                                    var mm = today.getMonth() + 1; //January is 0!
                                    var yyyy = today.getFullYear();
                                    if (dd < 10) {
                                        dd = '0' + dd
                                    }
                                    if (mm < 10) {
                                        mm = '0' + mm
                                    }
                                    today = mm + '/' + dd + '/' + yyyy;
                                    if (paidamount == null || paidamount == "null") {
                                        paidamount = 0;
                                    }
                                    if (totalamount == null || totalamount == "null") {
                                        paidamount = 0;
                                    }
                                    if (paidamount != totalamount) {
                                        log.audit('8', 'creating');
                                        log.audit('amount', installmentamount);
                                        log.audit('pri', sppayrollitem);
                                      
                                      var remainingPaidAmount = parseFloat(totalamount) - parseFloat(paidamount);
                                      if(remainingPaidAmount < installmentamount){
                                        installmentamount = remainingPaidAmount;
                                      }
                                        payrunSchRecord.selectNewLine({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_payroll_start_date',
                                            value: payrollStartDate
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_pay_run_employee',
                                            value: employeeRec.internalid
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_payroll_item_type',
                                            value: (itemtype) ? itemtype : ""
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_pay_run_paroll_items',
                                            value: (sppayrollitem) ? sppayrollitem : ""
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_pay_run_item_hours',
                                            value: 0
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_pay_run_item_amount',
                                            value: (installmentamount) ? Number(installmentamount).toFixed(3) : "0.00"
                                        });
                                        if (itemtype == 1) {
                                            payrunSchRecord.setCurrentSublistValue({
                                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                                value: (installmentamount) ? Number(installmentamount).toFixed(3) : "0.00"
                                            });
                                        }
                                        if (itemtype == 2) {
                                            payrunSchRecord.setCurrentSublistValue({
                                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                                value: (installmentamount) ? -(Number(installmentamount).toFixed(3)) : "0.00"
                                            });
                                        }
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_frequencynew',
                                            value: frequency
                                        });
                                        payrunSchRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                            fieldId: 'custrecord_da_payrun_spt_id',
                                            value: sptId
                                        });
                                        payrunSchRecord.commitLine({
                                            sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                                        });
                                    }
                                }
                              }
                           }
                        }
                        //Attendance and overtime system
                        //overtime
                        var customrecord_payroll_process_detailsSearchObj = search.create({
                            type: "customrecord_payroll_process_details",
                            filters: [
                                ["custrecord_payroll_process_parent.custrecord_da_payroll_pro_period", "anyof", postingPeriodId],
                                "AND",
                                ["custrecord_payroll_process_parent.custrecord_da_payroll_proces_type", "anyof", "1"],
                                "AND",
                                ["custrecord_da_payroll_pro_employee", "anyof", employeeRec.internalid]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_payroll_pro_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_pp_working_hours",
                                    label: "Working Hours"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_pp_hours_diff",
                                    label: "Hours Difference"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_pp_total_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_payroll_process_detailsSearchObj.runPaged().count;
                        //log.debug("customrecord_payroll_process_detailsSearchObj result count",searchResultCount);
                        customrecord_payroll_process_detailsSearchObj.run().each(function(result) {
                            customrecord_da_payroll_itemsSearchObj.filters.pop({
                                "name": "custrecord_da_payrol_item_category"
                            });
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 1
                            });
                            if (featureEnabled) {
                                customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_payroll_item_subsidiary",
                                    "operator": "anyof",
                                    "values": payrunSubsidiary
                                }));
                            }
                            //log.debug("customrecord_da_payroll_itemsSearchObj",customrecord_da_payroll_itemsSearchObj);
                            customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_payrol_item_category",
                                "operator": "anyof",
                                "values": "13" //Overtime
                            }));
                            var searchObj = customrecord_da_payroll_itemsSearchObj.run().getRange(0, 1);
                            //log.debug("searchObj",searchObj);
                            if (searchObj.length > 0) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_paroll_items',
                                    value: searchObj[0].id
                                });
                            }
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_pp_total_amount'))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: Number(result.getValue('custrecord_da_pp_total_amount'))
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });
                        //Attendance Deduction
                        var customrecord_payroll_process_detailsSearchObj = search.create({
                            type: "customrecord_da_attendance_deduction",
                            filters: [
                                ["custrecord_da_att_ded_parent.custrecord_da_payroll_pro_period", "anyof", postingPeriodId],
                                "AND",
                                ["custrecord_da_att_ded_parent.custrecord_da_payroll_proces_type", "anyof", "2"],
                                "AND",
                                ["custrecord_da_attn_ded_employee", "anyof", employeeRec.internalid]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_attn_ded_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_attn_payroll_item",
                                    label: "Hours Difference"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_attn_ded_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_payroll_process_detailsSearchObj.runPaged().count;
                        //log.debug("customrecord_payroll_process_detailsSearchObj result count",searchResultCount);
                        customrecord_payroll_process_detailsSearchObj.run().each(function(result) {
                            customrecord_da_payroll_itemsSearchObj.filters.pop({
                                "name": "custrecord_da_payrol_item_category"
                            });
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 2
                            });

                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: result.getValue('custrecord_da_attn_payroll_item')
                            });

                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_attn_ded_amount'))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: -(Number(result.getValue('custrecord_da_attn_ded_amount')))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payrun_comments',
                                value: "Attendance Deduction"
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });
                        //Extra Additions And Deductions
                        var customrecord_monthly_add_and_deductionsSearchObj = search.create({
                            type: "customrecord_monthly_add_and_deductions",
                            filters: [
                               // ["custrecord_da_addition_posting_period.internalidnumber", "lessthanorequalto", postingPeriodId],
                               ["custrecord_da_addition_posting_period", "anyof", postingPeriodId],
                                "AND",
                                ["custrecord_da_already_included_in_payrol", "is", "F"],
                                "AND",
                                ["custrecord_da_addition_employee", "anyof", employeeRec.internalid]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_addition_posting_period",
                                    label: "Period"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_add_or_ded_type",
                                    label: "Addition | Deduction"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_addition_type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_additional_amount",
                                    label: "Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_project_name_add_ded",
                                    label: "project "
                                }),
                            ]
                        });
                        var searchResultCount = customrecord_monthly_add_and_deductionsSearchObj.runPaged().count;
                        //log.debug("customrecord_monthly_add_and_deductionsSearchObj result count",searchResultCount);
                        customrecord_monthly_add_and_deductionsSearchObj.run().each(function(result) {
                            var itemtype = result.getValue('custrecord_da_add_or_ded_type');
                            customrecord_da_payroll_itemsSearchObj.filters.pop({
                                "name": "custrecord_da_payrol_item_category"
                            });
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: itemtype
                            });
                            var payrollItem = result.getValue('custrecord_da_addition_type');
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: payrollItem
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_additional_amount')).toFixed(2)
                            });
                            if (itemtype == 1) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_ded_amount',
                                    value: (Number(result.getValue('custrecord_da_additional_amount'))).toFixed(2)
                                });
                            } else {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_ded_amount',
                                    value: -(Number(result.getValue('custrecord_da_additional_amount'))).toFixed(2)
                                });
                            }
                            var project = result.getValue('custrecord_da_project_name_add_ded');
                            if (project) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_payroll_project',
                                    value: project
                                });
                            }
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_ref_id',
                                value: result.id
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });
                        //pending Claims
                        var customrecord_da_payroll_itemsSearchObj = search.create({
                            type: "customrecord_da_payroll_items",
                            filters: [
                                ["custrecord_da_payroll_item_subsidiary", "anyof", payrunSubsidiary],
                                "AND",
                                ["name", "contains", "previous month"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    label: "Internal ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_itemsSearchObj result count", searchResultCount);
                        var payrollItemId;
                        customrecord_da_payroll_itemsSearchObj.run().each(function(result) {
                            payrollItemId = result.id;
                            return true;
                        });
                        var customrecord_da_pending_claims_for_emplySearchObj = search.create({
                            type: "customrecord_da_pending_claims_for_emply",
                            filters: [
                                ["custrecord_da_pending_claim_employee", "anyof", employeeRec.internalid]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_pending_claim_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_pending_claim_amount",
                                    label: "Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_pending_claim_month",
                                    label: "For Month"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_pending_claims_for_emplySearchObj.runPaged().count;
                        log.debug("customrecord_da_pending_claims_for_emplySearchObj result count", searchResultCount);
                        customrecord_da_pending_claims_for_emplySearchObj.run().each(function(result) {
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_sub_line',
                                value: payrunSubsidiary
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 2
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: payrollItemId
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: -(Number(result.getValue('custrecord_da_pending_claim_amount')))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: (Number(result.getValue('custrecord_da_pending_claim_amount')))
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });

                        var customrecord_da_hr_loan_installmentSearchObj = search.create({
                            type: "customrecord_da_hr_loan_installment",
                            filters: [
                                ["custrecord_da_hr_loan_id.custrecord_da_employee_loan", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_installment_date", "on", "01/" + parentPayrollMonth + "/" + parentPayrollYear],
                                "AND",
                                ["custrecord_da_hr_hold_loan", "is", "F"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                }),
                                search.createColumn({
                                    name: "scriptid",
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_loan_sequence",
                                    label: "Sequence"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_installment_date",
                                    label: "Installment Date "
                                }),
                                search.createColumn({
                                    name: "custrecord_da_installment_amount_hr",
                                    label: "Installment Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_hr_hold_loan",
                                    label: "Hold Loan"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_hr_loan_paid",
                                    label: "Paid"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_payroll_item_loan",
                                    join: "CUSTRECORD_DA_HR_LOAN_ID",
                                    label: "Payroll Item"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_loan_installmentSearchObj result count", searchResultCount);
                        customrecord_da_hr_loan_installmentSearchObj.run().each(function(result) {
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 2
                            });
                            var payrollItem = result.getValue({
                                name: 'custrecord_da_payroll_item_loan',
                                join: 'CUSTRECORD_DA_HR_LOAN_ID'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: payrollItem
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_loan_id',
                                value: result.id
                            });

                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_installment_amount_hr'))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: -(Number(result.getValue('custrecord_da_installment_amount_hr')))
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });
                    } else {

                        var customrecord_da_hr_loan_installmentSearchObj = search.create({
                            type: "customrecord_da_hr_loan_installment",
                            filters: [
                                ["custrecord_da_hr_loan_id.custrecord_da_employee_loan", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_installment_date", "on", "01/" + parentPayrollMonth + "/" + parentPayrollYear],
                                "AND",
                                ["custrecord_da_hr_hold_loan", "is", "F"], "AND",
                                ["custrecord_da_hr_loan_id.custrecord_da_payroll_item_loan", "anyof", paymentList]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                }),
                                search.createColumn({
                                    name: "scriptid",
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_loan_sequence",
                                    label: "Sequence"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_installment_date",
                                    label: "Installment Date "
                                }),
                                search.createColumn({
                                    name: "custrecord_da_installment_amount_hr",
                                    label: "Installment Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_hr_hold_loan",
                                    label: "Hold Loan"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_hr_loan_paid",
                                    label: "Paid"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_payroll_item_loan",
                                    join: "CUSTRECORD_DA_HR_LOAN_ID",
                                    label: "Payroll Item"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_loan_installmentSearchObj result count", searchResultCount);
                        customrecord_da_hr_loan_installmentSearchObj.run().each(function(result) {
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 2
                            });
                            var payrollItem = result.getValue({
                                name: 'custrecord_da_payroll_item_loan',
                                join: 'CUSTRECORD_DA_HR_LOAN_ID'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: payrollItem
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_loan_id',
                                value: result.id
                            });

                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_installment_amount_hr'))
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: -(Number(result.getValue('custrecord_da_installment_amount_hr')))
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });

                        var customrecord_da_emp_earningsSearchObj = search.create({
                            type: "customrecord_da_emp_earnings",
                            filters: [
                                ["custrecord_da_earnings_employee", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_earnings_payroll_item", "anyof", paymentList]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    sort: search.Sort.ASC,
                                    label: "Script ID"
                                }),
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
                                    name: "custrecord_da_allowance_type",
                                    label: "Fixed/Variable"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                        log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                        customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: 1
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: result.getValue('custrecord_da_earnings_payroll_item')
                            });

                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_earnings_amount')).toFixed(3)
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_ded_amount',
                                value: Number(result.getValue('custrecord_da_earnings_amount')).toFixed(3)
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });



                        var customrecord_monthly_add_and_deductionsSearchObj = search.create({
                            type: "customrecord_monthly_add_and_deductions",
                            filters: [
                                ["custrecord_da_addition_posting_period", "anyof", postingPeriodId],
                                "AND",
                                ["custrecord_da_addition_employee", "anyof", employeeRec.internalid],
                                "AND",
                                ["custrecord_da_addition_type", "anyof", paymentList]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                }),
                                search.createColumn({
                                    name: "scriptid",
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_add_or_ded_type",
                                    label: "Addition | Deduction"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_addition_type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_addition_employee",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_addition_posting_period",
                                    label: "Month"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_additional_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_monthly_add_and_deductionsSearchObj.runPaged().count;
                        log.debug("customrecord_monthly_add_and_deductionsSearchObj result count", searchResultCount);
                        customrecord_monthly_add_and_deductionsSearchObj.run().each(function(result) {
                            var itemtype = result.getValue('custrecord_da_add_or_ded_type');
                            customrecord_da_payroll_itemsSearchObj.filters.pop({
                                "name": "custrecord_da_payrol_item_category"
                            });
                            payrunSchRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_start_date',
                                value: payrollStartDate
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_employee',
                                value: employeeRec.internalid
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_item_type',
                                value: itemtype
                            });
                            var payrollItem = result.getValue('custrecord_da_addition_type');
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_paroll_items',
                                value: payrollItem
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_hours',
                                value: 0
                            });
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_pay_run_item_amount',
                                value: Number(result.getValue('custrecord_da_additional_amount'))
                            });
                            if (itemtype == 1) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_ded_amount',
                                    value: (Number(result.getValue('custrecord_da_additional_amount')))
                                });
                            } else {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_pay_run_ded_amount',
                                    value: -(Number(result.getValue('custrecord_da_additional_amount')))
                                });
                            }
                            var project = result.getValue('custrecord_da_project_name_add_ded');
                            if (project) {
                                payrunSchRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                    fieldId: 'custrecord_da_payroll_project',
                                    value: project
                                });
                            }
                            payrunSchRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling',
                                fieldId: 'custrecord_da_payroll_ref_id',
                                value: result.id
                            });
                            payrunSchRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_pay_run_scheduling'
                            });
                            return true;
                        });

                    }
                }
                payrunSchRecord.save();

                var customrecord_da_pay_run_itemsSearchObj = search.create({
                    type: "customrecord_da_pay_run_items",
                    filters: [
                        ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", postingPeriodId],
                        "AND",
                        ["custrecord_da_pay_run_scheduling.custrecord_da_sch_approval_status", "anyof", "3"],
                        "AND",
                        ["custrecord_da_pay_run_employee", "anyof", employeeRec.internalid]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_pay_run_paroll_items",
                            summary: "GROUP",
                            label: "Payroll Item"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);

                var payrollItemsArr = [];
                customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                    var id = result.getValue({
                        name: 'custrecord_da_pay_run_paroll_items',
                        summary: search.Summary.GROUP
                    });
                    payrollItemsArr.push(id);
                    return true;
                });

                if (payrollItemsArr.length > 0) {
                    var customrecord_da_pay_run_itemsSearchObj = search.create({
                        type: "customrecord_da_pay_run_items",
                        filters: [
                            ["custrecord_da_pay_run_employee", "anyof", employeeRec.internalid],
                            "AND",
                            ["custrecord_da_pay_run_scheduling", "anyof", recId],
                            "AND",
                            ["custrecord_da_pay_run_paroll_items", "anyof", payrollItemsArr]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                    log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
                    customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                        record.delete({
                            type: 'customrecord_da_pay_run_items',
                            id: result.id
                        });
                        return true;
                    });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function diff_months(dt2, dt1) {
            var diff = (dt2.getTime() - dt1.getTime()) / 1000;
            diff /= (60 * 60 * 24 * 7 * 4);
            return Math.abs(Math.round(diff));
        }

        function calculateNoOfFridays(startDate, endDate) {
            //var startDate = new Date("11/01/2019");
            //var endDate = new Date("11/22/2019");
            var totalFridays = 0;
            log.debug(startDate, endDate);
            for (var i = (startDate); i <= (endDate);) {
                if (i.getDay() == 5) {
                    totalFridays++;
                }
                i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
            }
            return totalFridays;
        }

        function calculateNoOfSaturdays(startDate, endDate) {
            //var startDate = new Date("11/01/2019");
            //var endDate = new Date("11/22/2019");
            var totalSaturdays = 0;
            log.debug(startDate, endDate);
            for (var i = (startDate); i <= (endDate);) {
                if (i.getDay() == 6) {
                    totalSaturdays++;
                }
                i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
            }
            return totalSaturdays;
        }

        function timeConvert(n) {
            var num = n;
            var hours = (num / 60);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
            return rhours + "." + rminutes;
        }

        function daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        }

        function convertminutes(hours, minutes) {
            return Number((hours * 60)) + Number(minutes);
        }

        function dateDifference(date1, date2) {
            var Difference_In_Time = date2.getTime() - date1.getTime();
            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          //log.debug('Difference_In_Days', Difference_In_Days);
         Difference_In_Days = Difference_In_Days.toFixed(0);
         // log.debug('Difference_In_Days', Difference_In_Days);
            return parseFloat(Difference_In_Days) + parseFloat(1);
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                var recId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sch_pay_run_recid"
                });
                log.debug('summarize', summarize);
                var userId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_userid"
                });
                //log.debug('userId',userId);
                var postingPeriod = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_posting_period"
                });
                //setting employees list
                var customrecord_da_pay_run_itemsSearchObj = search.create({
                    type: "customrecord_da_pay_run_items",
                    filters: [
                        ["custrecord_da_pay_run_scheduling", "anyof", recId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({
                            name: 'custrecord_da_pay_run_employee'
                        }),
                        search.createColumn({
                            name: "custrecord_da_pay_run_ded_amount",
                            label: "Deducted Amount"
                        }),
                        search.createColumn({
                            name: "custrecord_da_pay_run_item_hours",
                            label: "hours"
                        })
                    ]
                });
                var arr = [];
                var total = 0;
                customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                    //log.debug('id',result.getValue('custrecord_da_pay_run_employee'));
                    arr.push(result.getValue('custrecord_da_pay_run_employee'));

                    var hours = result.getValue({
                        name: 'custrecord_da_pay_run_item_hours'
                    });
                    if (hours > 0) {
                        var amount = result.getValue({
                            name: 'custrecord_da_pay_run_ded_amount'
                        });
                        total = parseFloat(total) + parseFloat(amount * hours);
                    } else {
                        var amount = result.getValue({
                            name: 'custrecord_da_pay_run_ded_amount'
                        });
                        total = parseFloat(total) + parseFloat(amount);
                    }
                    return true;
                });
                //log.debug('arr',arr);
                var empArr = removeDuplicateUsingFilter(arr);

                //loading payrun schedule record
                var payrunSchRecord = record.load({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: recId,
                    isDynamic: true
                });
                payrunSchRecord.setValue('custrecord_da_sch_payrun_processing', false);
                payrunSchRecord.setValue('custrecord_payrun_total_amount', total);
                payrunSchRecord.setValue('custrecord_da_sch_pay_run_processed', true);
                payrunSchRecord.setValue('custrecord_da_sch_pay_run_emplist', JSON.stringify(empArr));
                payrunSchRecord.save();
                //sending email
                email.send({
                    author: userId,
                    recipients: userId,
                    subject: 'Payrun record process update',
                    body: 'Hi, <br> Your payrun Scheduling process for the posting period :<b>' + postingPeriod + '</b> is completed. Please go and check the record'
                });
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function removeDuplicateUsingFilter(arr) {
            var unique_array = arr.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            return unique_array;
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });