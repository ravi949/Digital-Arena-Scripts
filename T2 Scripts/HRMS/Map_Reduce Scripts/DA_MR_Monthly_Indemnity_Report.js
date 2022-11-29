/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format'],
    function(search, record, runtime, format) {
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
                return search.create({
                    type: "employee",
                    filters: [
                      
                        ["isinactive", "is", "F"],
                        "AND",
                        ["custentity_da_emp_basic_salary", "greaterthan", "0"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custentity_da_emp_basic_salary",
                            label: "Basic Salary"
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
                var searchResult = JSON.parse(context.value);
                var values = searchResult.values;
                //log.debug('values',values);
                var empId = searchResult.values.internalid.value;
                var basicSalary = searchResult.values.custentity_da_emp_basic_salary;
                var unpaidOpeningBalance = searchResult.values.custentity_da_unpaid_leave_open_balance;
                context.write({
                    key: empId,
                    value: {
                        basicSalary: basicSalary,
                        unpaidOpeningBalance: unpaidOpeningBalance
                    }
                })
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
                var data = JSON.parse(context.values[0]);
                var basicsalary = data.basicSalary;
                var unpaidleavesOpeningbalance = data.unpaidOpeningBalance;
                var customrecord_ari_indemnity_calculationSearchObj = search.create({
                    type: "customrecord_ari_indemnity_calculation",
                    filters: [
                        ["custrecord_da_ind_cal_name", "anyof", empId],
                        "AND",
                        ["custrecord_is_indemniity_paid", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "scriptid",
                            sort: search.Sort.ASC,
                            label: "Script ID"
                        }),
                        search.createColumn({
                            name: "custrecord_da_indemnity_type",
                            label: "Termination/Resignation"
                        })
                    ]
                });
                var searchResultCount = customrecord_ari_indemnity_calculationSearchObj.runPaged().count;
                log.debug("customrecord_ari_indemnity_calculationSearchObj result count", searchResultCount);
                if (searchResultCount == 0) {
                    var empRecord = record.load({
                        type: 'employee',
                        id: empId
                    });
                    var hireDate = empRecord.getValue('hiredate');
                    var contractType = empRecord.getValue('custentity_labour_contract_type');
                    var terminationDate = empRecord.getValue('releasedate');
                    var totalSalary = empRecord.getValue('custentity_total_salary');
                    var basicSalary = empRecord.getValue('custentity_da_emp_basic_salary')
                    var subsidiaryCountry = empRecord.getValue('custentity_da_subsidairy_country');

                    var worksForSub = empRecord.getValue('custentity_da_work_for_subsidiary');

                    var empSubsidairy = empRecord.getValue('subsidiary');
                    var customrecord_da_general_settingsSearchObj = search.create({
                       type: "customrecord_da_general_settings",
                       filters:
                       [
                          ["custrecord_da_settings_subsidiary","anyof",empSubsidairy]
                       ],
                       columns:
                       [
                          search.createColumn({name: "custrecord_da_setting_working_days", label: "Working Days Per Month"}),
                          search.createColumn({name: "custrecord_da_working_days_per_year", label: "Working Days Per Year"})
                       ]
                    });
                    var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
                    log.debug("customrecord_da_general_settingsSearchObj result count",searchResultCount);
                    var workingDaysPerYear = 360;
                    customrecord_da_general_settingsSearchObj.run().each(function(result){
                       workingDaysPerYear = result.getValue('custrecord_da_working_days_per_year');
                       return true;
                    });
                    workingDaysPerYear = (workingDaysPerYear) ? workingDaysPerYear: 360;
                    //log.debug("Emp details",empId +" "+ basicsalary+ " "+unpaidOpeningBalance);
                    var earningsAmount = 0,
                        mobileAllowanceAmount = 0,
                        travelallowAmount = 0,
                        leavedays = 0,
                        bonusAmount = 0,
                        ticketsAmount = 0;

                    //unpaid leaves calculation
                    var customrecord_da_leaverecordSearchObj = search.create({
                        type: "customrecord_da_employee_leaves",
                        filters: [
                            ["custrecord_da_employee_leave", "anyof", empId],
                            "AND",
                            ["custrecord_da_emp_leavetype", "anyof", "3"],
                            "AND",
                            ["custrecord_da_leave_approvalstatus", "anyof", "2","24"],
                            "AND",
                            ["custrecord_da_emp_leavedays", "greaterthan", "20"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_employee_leave",
                                label: "Employee"
                            }),
                            search.createColumn({
                                name: "custrecord_da_emp_leavedays",
                                label: "Leave Days"
                            })
                        ]
                    });
                    customrecord_da_leaverecordSearchObj.run().each(function(result) {
                        var days = result.getValue('custrecord_da_emp_leavedays');
                        leavedays = parseFloat(leavedays) + parseFloat(days);
                        return true;
                    });
                    //console.log("leavedays"+leavedays);
                    var totalAllowanceAmount = parseFloat(earningsAmount) + parseFloat(0);
                    var salaryEligibleforIndemnity = parseFloat(totalAllowanceAmount) + parseFloat(basicsalary);
                    var totalunpaidLeaves = ((parseFloat(unpaidleavesOpeningbalance)) ? parseFloat(unpaidleavesOpeningbalance) : 0) + parseFloat(leavedays);
                    //working years calculation
                    var da_today = new Date();
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    var firstDate = new Date(hireDate);
                    var secondDate = da_today;
                    secondDate.setHours(0, 0, 0, 0);
                    var yesterday = new Date(secondDate);
                    yesterday.setDate(yesterday.getDate() - 1);
                    var yMonth = yesterday.getMonth()+1;
                    if (terminationDate) {
                           var tmonth = (new Date(terminationDate)).getMonth()+1;
                           log.debug('tmonth',tmonth);
                           if(yMonth == tmonth){
                            yesterday = new Date(terminationDate);
                           }                          
                    }
                    var yDate = yesterday.getDate();
                    var yMonth = yesterday.getMonth() + 1;
                    var yYear = yesterday.getFullYear();
                    var stoppedCalulation = false;
                    var previousMonthEndDate = getLastDateOFPrevMonth(yesterday);
                    previousMonthEndDate.setHours(0, 0, 0, 0);
                    if (terminationDate) {
                        if ((previousMonthEndDate < terminationDate) && (terminationDate <= yesterday)) {
                            yesterday = new Date(terminationDate);
                        }
                        if (terminationDate <= previousMonthEndDate) {
                            stoppedCalulation = true;
                        }
                    }
                    var yDate = yesterday.getDate();
                    var yMonth = yesterday.getMonth() + 1;
                    var yYear = yesterday.getFullYear();
                    log.debug('yesterday', yesterday);
                    previousMonthEndDate = getLastDateOFPrevMonth(yesterday);
                    previousMonthEndDate.setHours(0, 0, 0, 0);
                    log.debug('previousMonthEndDate', previousMonthEndDate);
                    var calculateAdditional = true,
                        calculateOpening = true;
                    if (terminationDate) {
                        if (terminationDate <= previousMonthEndDate) {
                            calculateAdditional = false;
                        }
                    }
                    log.debug('f & s ', firstDate + "  jshfjsh" + secondDate + "con" + firstDate > secondDate);
                    if (firstDate >= secondDate) {
                        return false;
                    }
                    if (firstDate > previousMonthEndDate && firstDate <= secondDate) {
                        calculateOpening = false;
                    }
                    log.debug('previousMonthEndDate', firstDate + " " + previousMonthEndDate);
                    log.debug('sec', firstDate <= secondDate);

                    var diffDays = Math.round(Math.abs((firstDate.getTime() - yesterday.getTime()) / (oneDay)));
                    if (terminationDate) {
                        var diffDays1 = Math.round(Math.abs((firstDate.getTime() - terminationDate.getTime()) / (oneDay)));
                    }
                    var workingYears = (((parseFloat(diffDays) - parseFloat(totalunpaidLeaves)) + 1)) / workingDaysPerYear;
                    if (stoppedCalulation) {
                        workingYears = (((parseFloat(diffDays1) - parseFloat(totalunpaidLeaves)) + 1)) / workingDaysPerYear;
                    }
                    var customrecord_da_monthly_leavesSearchObj = search.create({
                        type: "customrecord_da_monthly_leaves",
                        filters: [
                            ["custrecord_da_emp_leaves.custrecord_da_emp_leavetype", "anyof", "3"],
                            "AND",
                            ["custrecord_da_emp_month_leave", "anyof", empId],
                            "AND",
                            ["custrecord_da_emp_leaves.custrecord_da_leave_approvalstatus", "anyof", "2","24"],
                            "AND",
                            ["custrecord_da_month_end_date", "onorbefore", (previousMonthEndDate.getDate()) + "/" + (previousMonthEndDate.getMonth() + 1) + "/" + previousMonthEndDate.getFullYear()]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_lmonth_leavedays",
                                label: "Leave Days"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_monthly_leavesSearchObj.runPaged().count;
                    log.debug("customrecord_da_monthly_leavesSearchObj result count", searchResultCount);
                    var totalUnpaidleave_days_for_opening = 0;
                    customrecord_da_monthly_leavesSearchObj.run().each(function(result) {
                        var leaveDays = result.getValue('custrecord_da_lmonth_leavedays');
                        totalUnpaidleave_days_for_opening = parseFloat(totalUnpaidleave_days_for_opening) + parseFloat(leaveDays);
                        return true;
                    });
                    var diffDays_for_opening = Math.round(Math.abs((firstDate.getTime() - previousMonthEndDate.getTime()) / (oneDay)));
                    var workingDaysForOpening = (((parseFloat(diffDays_for_opening) - parseFloat(totalUnpaidleave_days_for_opening)) + 1));
                    var workingYears_for_opening = (((parseFloat(diffDays_for_opening) - parseFloat(totalUnpaidleave_days_for_opening)) + 1)) / workingDaysPerYear;

                    var totalUnpaidleave_days_for_Ending = parseFloat(totalunpaidLeaves) - parseFloat(totalUnpaidleave_days_for_opening);

                    var diffDays_for_ending = Math.round(Math.abs((firstDate.getTime() - yesterday.getTime()) / (oneDay)));
                    var workingDaysForEnding = (((parseFloat(diffDays_for_ending) - parseFloat(totalUnpaidleave_days_for_Ending)) + 1));
                    var workingYears_for_Ending = (((parseFloat(diffDays_for_ending) - parseFloat(totalUnpaidleave_days_for_Ending)) + 1)) / workingDaysPerYear;


                    //  console.log(workingYears);
                    var noOfDays_In_Month = (yesterday.getDate()); //yesterday is the end of month
                    if (firstDate > previousMonthEndDate) {
                        var no_of_days_to_deduct = firstDate.getDate();
                        noOfDays_In_Month = parseFloat(noOfDays_In_Month) - parseFloat(no_of_days_to_deduct) + parseFloat(1);
                    }

                    // var additional_Days = parseFloat(noOfDays_In_Month) - parseFloat(totalUnpaidLeave_Days_This_month);
                    var indemnityKWD, openingAmount, additionalAmount, paidAmount = 0,
                        finalAmount = 0;
                    //posting period id
                    var month = (da_today.getMonth());
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
                        '0': 'Dec'
                    }
                    var postingperiodMonth = monthsobj[month];
                    var year = da_today.getFullYear();
                    if (month == 0 || month == "0") {
                        year = year - 1;
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
                    log.debug("accountingperiodSearchObj result count", searchResultCount);
                    var postingPeriodId;
                    accountingperiodSearchObj.run().each(function(result) {
                        postingPeriodId = result.id;
                        return true;
                    });
                    //resignation
                    var resignationIndementiyKWD = 0,
                        terminationIndemnityAmount = 0,
                        termOpeningAmount = 0,
                        resignOpeningAmount = 0;
                    if (calculateOpening) {
                        //unlimited

                        var customrecord_da_indemnity_reportSearchObj = search.create({
                            type: "customrecord_da_indemnity_report",
                            filters: [
                                ["custrecord_da_ind_employee", "anyof", empId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_ind_final_amount",
                                    label: "Final Amount"
                                }),

                                 search.createColumn({
                                     name: "scriptid",
                                     sort: search.Sort.DESC,
                                     label: "Script ID"
                                  })
                            ]
                        });
                        var searchResultCount = customrecord_da_indemnity_reportSearchObj.runPaged().count;
                        log.debug("customrecord_da_indemnity_reportSearchObj result count", searchResultCount);
                       

                        if (searchResultCount > 0) {

                             customrecord_da_indemnity_reportSearchObj.run().each(function(result) {
                              termOpeningAmount = result.getValue('custrecord_da_ind_final_amount');
                            });

                        } else {
                            var customrecord_da_indemnity_pageSearchObj = search.create({
                                type: "customrecord_da_indemnity_page",
                                filters: [
                                    ["custrecord_da_ind_setting_parent.custrecord_da_ind_setting_country", "anyof", subsidiaryCountry]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_year_limit",
                                        label: "From"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_ind_calc_to",
                                        label: "To"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_termination_indemnity",
                                        label: "Termination (Formula)"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_resignation_indemnity",
                                        label: "Resignation Formula"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_end_contract_indemnity",
                                        label: "Resignation Formula"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_indemnity_pageSearchObj.runPaged().count;
                            log.debug("customrecord_da_indemnity_pageSearchObj result count", searchResultCount);

                            customrecord_da_indemnity_pageSearchObj.run().each(function(result) {


                                var from = result.getValue('custrecord_da_year_limit');
                                var to = result.getValue('custrecord_da_ind_calc_to');

                                var G = totalSalary;
                                var B = basicSalary;
                                var WD = workingDaysForOpening;
                                var WY = workingYears_for_opening;
                                workingYears_for_opening = Number(workingYears_for_opening.toFixed(2));


                                if ((Number(from) < workingYears_for_opening) && (workingYears_for_opening < Number(to))) {

                                    var formula = result.getValue('custrecord_da_termination_indemnity');

                                    termOpeningAmount = eval(formula);
                                    var formula = result.getValue('custrecord_da_resignation_indemnity');
                                    resignOpeningAmount = eval(formula);
                                }
                                return true;
                            });
                        }
                    }
                    var resignFinalAmount;
                    var termFinalAmount;


                    var customrecord_da_indemnity_pageSearchObj = search.create({
                        type: "customrecord_da_indemnity_page",
                        filters: [
                            ["custrecord_da_ind_setting_parent.custrecord_da_ind_setting_country", "anyof", subsidiaryCountry]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_year_limit",
                                label: "From"
                            }),
                            search.createColumn({
                                name: "custrecord_da_ind_calc_to",
                                label: "To"
                            }),
                            search.createColumn({
                                name: "custrecord_da_termination_indemnity",
                                label: "Termination (Formula)"
                            }),
                            search.createColumn({
                                name: "custrecord_da_resignation_indemnity",
                                label: "Resignation Formula"
                            }),
                            search.createColumn({
                                name: "custrecord_da_end_contract_indemnity",
                                label: "Resignation Formula"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_indemnity_pageSearchObj.runPaged().count;
                    log.debug("customrecord_da_indemnity_pageSearchObj result count", searchResultCount);


                    customrecord_da_indemnity_pageSearchObj.run().each(function(result) {


                        var from = result.getValue('custrecord_da_year_limit');
                        var to = result.getValue('custrecord_da_ind_calc_to');

                        var G = totalSalary;
                        var B = basicSalary;
                        var WD = workingDaysForEnding;
                        var WY = workingYears_for_Ending;
                        workingYears_for_Ending = Number(workingYears_for_Ending.toFixed(2));


                        if ((Number(from) < workingYears_for_Ending) && (workingYears_for_Ending < Number(to))) {

                            var formula = result.getValue('custrecord_da_termination_indemnity');

                            termFinalAmount = eval(formula);
                            var formula = result.getValue('custrecord_da_resignation_indemnity');
                            resignFinalAmount = eval(formula);
                        }
                        return true;
                    });


                    var IndemnitydaysResign = parseFloat(resignFinalAmount / (((totalSalary) ? (totalSalary) : 0) / 30));
                    var IndemnitydaysTerm = parseFloat(termFinalAmount / (((totalSalary) ? (totalSalary) : 0) / 30));

                    var resignAdditional = parseFloat(resignFinalAmount) - parseFloat(resignOpeningAmount);
                    var termAdditional = parseFloat(termFinalAmount) - parseFloat(termOpeningAmount);


                    var indemnityReportRec = record.create({
                        type: 'customrecord_da_indemnity_report'
                    });
                    indemnityReportRec.setValue('custrecord_da_ind_type', 1);
                    indemnityReportRec.setValue('custrecord_da_ind_employee', empId);

                    if (worksForSub) {
                        indemnityReportRec.setValue('custrecord_da_ind_emp_subsidairy', worksForSub);
                    } else {
                        indemnityReportRec.setValue('custrecord_da_ind_emp_subsidairy', empSubsidairy);
                    }
                    indemnityReportRec.setValue('custrecord_da_ind_working_years', Number(workingYears).toFixed(3));
                    indemnityReportRec.setValue('custrecord_indemnity_days', Number(IndemnitydaysTerm).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_salary_eligible_for_indem', Number(salaryEligibleforIndemnity).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_opening_balance', Number(termOpeningAmount).toFixed(3));
                    //indemnityReportRec.setValue('custrecord_da_ind_paid_amount',Number(paidAmount).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_adding_amount', Number(termAdditional).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_final_amount', Number(termFinalAmount).toFixed(3));
                    if (postingPeriodId) {
                        indemnityReportRec.setValue('custrecord_da_indemnity_month', postingPeriodId);
                    }
                    indemnityReportRec.save();
                    /*var indemnityReportRec = record.create({
                        type: 'customrecord_da_indemnity_report'
                    });
                    indemnityReportRec.setValue('custrecord_da_ind_type', 2); //resign
                    indemnityReportRec.setValue('custrecord_da_ind_employee', empId);

                    if (worksForSub) {
                        indemnityReportRec.setValue('custrecord_da_ind_emp_subsidairy', worksForSub);
                    } else {
                        indemnityReportRec.setValue('custrecord_da_ind_emp_subsidairy', empSubsidairy);
                    }
                    indemnityReportRec.setValue('custrecord_da_ind_working_years', Number(workingYears).toFixed(3));
                    indemnityReportRec.setValue('custrecord_indemnity_days', Number(IndemnitydaysResign).toFixed(3));
                    //indemnityReportRec.setValue('custrecord_da_emp_indemnity_amount',Number(indemnityKWD).toFixed(3));    
                    indemnityReportRec.setValue('custrecord_da_salary_eligible_for_indem', Number(salaryEligibleforIndemnity).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_opening_balance', Number(resignOpeningAmount).toFixed(3));
                    //indemnityReportRec.setValue('custrecord_da_ind_paid_amount',Number(paidAmount).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_adding_amount', Number(resignAdditional).toFixed(3));
                    indemnityReportRec.setValue('custrecord_da_ind_final_amount', Number(resignFinalAmount).toFixed(3));
                    if (postingPeriodId) {
                        indemnityReportRec.setValue('custrecord_da_indemnity_month', postingPeriodId);
                    }
                    indemnityReportRec.save();*/
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function getLastDateOFPrevMonth(endDate) {
            var d = new Date(endDate);
            d.setDate(1);
            d.setHours(-20);
            return d;
        };
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

        function removeDuplicateUsingFilter(arr) {
            var unique_array = arr.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            return unique_array
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });