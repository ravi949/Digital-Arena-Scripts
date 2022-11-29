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
                var empRecId = runtime.getCurrentScript().getParameter({
                    name: "custscript_employee_id_2"
                });
                log.debug('recId', empRecId);
                if (empRecId) {
                    return search.create({
                        type: "employee",
                        filters: [
                            ["internalid", "anyof", empRecId], "AND", ["isinactive", "is", false]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                sort: search.Sort.ASC,
                                label: "id"
                            }),
                            search.createColumn({
                                name: "email",
                                label: "Email"
                            }),
                            search.createColumn({
                                name: "phone",
                                label: "Phone"
                            })
                        ]
                    });
                } else {
                    return search.create({
                        type: "employee",
                        filters: [
                           ["isinactive", "is", false]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                sort: search.Sort.ASC,
                                label: "id"
                            }),
                            search.createColumn({
                                name: "email",
                                label: "Email"
                            }),
                            search.createColumn({
                                name: "phone",
                                label: "Phone"
                            })
                        ]
                    });
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
            try {
                var searchResult = JSON.parse(context.value);
                var values = searchResult.values;
                var empId = values.internalid.value;
                //log.debug('EMpID',empId);
                context.write({
                    key: empId,
                    value: empId
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
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);
                var generalSettingRecID = 0;
                if (featureEnabled) {
                    var employeeSubsidairy = record.load({
                        type: 'employee',
                        id: empId
                    }).getValue('subsidiary');
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
                var empRecord = record.load({
                    type: 'employee',
                    id: empId
                });
                var hiddenLeaveBalance = empRecord.getValue('custentity_da_leave_balance_storing');
                if (!hiddenLeaveBalance) {
                    hiddenLeaveBalance = 0;
                }
                var employeeGradeId = empRecord.getValue('custentity_da_employee_grade');
                if (true) {
                    log.debug('empId', empId);
                    // Search for leeave balance records if exists ok otherwise will cretae the record.
                    var currentLeaveBalance = 0;
                    var customrecord407SearchObj = search.create({
                        type: "customrecord_emp_leave_balance",
                        filters: [
                            ["custrecord_employee_id", "anyof", empId]
                        ],
                        columns: ['custrecord_emp_leave_balance']
                    });
                    var searchResultCount = customrecord407SearchObj.runPaged().count;
                    //log.debug("customrecord407SearchObj result count",searchResultCount);
                    var leavebalanceRecId;
                    if (searchResultCount > 0) {
                        customrecord407SearchObj.run().each(function(result) {
                            leavebalanceRecId = result.id;
                            currentLeaveBalance = result.getValue('custrecord_emp_leave_balance');
                        });
                    } else {
                        var leavebalcRec = record.create({
                            type: 'customrecord_emp_leave_balance'
                        });
                        leavebalcRec.setValue('custrecord_employee_id', empId);
                        leavebalanceRecId = leavebalcRec.save();
                    }
                    log.debug('leavebalanceRecId', leavebalanceRecId);
                    //Process starts now
                    //employee opening balance
                    var employeeOpeningBalance = empRecord.getValue('custentity_da_leave_opening_balance');
                     if (!employeeOpeningBalance) {
                        employeeOpeningBalance = 0;
                    }
                    var empHireDate = empRecord.getText('hiredate');
                    log.debug('empHiredate1', empHireDate);
                    empHireDate = empHireDate.toString();
                    log.debug('empHiredate2', empHireDate);
                    empHireDate = new Date(empHireDate.split("/")[1] + "/" + empHireDate.split("/")[0] + "/" + empHireDate.split("/")[2]);
                    log.debug('empHiredate', empHireDate);
                  
                    var empTermDate = empRecord.getText('releasedate');
          
                    if(empTermDate){
                      empTermDate = empTermDate.toString();
                      empTermDate = new Date(empTermDate.split("/")[1]+"/"+empTermDate.split("/")[0]+"/"+empTermDate.split("/")[2]);
                    }
                  
                    if (!employeeOpeningBalance) {
                        employeeOpeningBalance = 0;
                    }
                    if (generalSettingRecID > 0) {
                        // log.debug('c',c[0].id);
                        var settingsRec = record.load({
                            type: 'customrecord_da_general_settings',
                            id: generalSettingRecID
                        });
                        var systemStartDate = settingsRec.getText('custrecord_da_system_start_date');
                        var leavesCarryForward = settingsRec.getValue('custrecord_leaves_carry_forward');
                        if (leavesCarryForward) {
                            var carryForwardDays = settingsRec.getValue('custrecord_da_carry_forward_days');
                        }
                        var settingForLeaveCalculation = settingsRec.getValue('custrecord_calculate_reports_based_on_sd');
                        log.debug("systemStartDate", systemStartDate);
                        systemStartDate = systemStartDate.toString();
                        systemStartDate = new Date(systemStartDate.split("/")[1] + "/" + systemStartDate.split("/")[0] + "/" + systemStartDate.split("/")[2]);
                        log.debug("systemStartDate", systemStartDate);
                        if (settingForLeaveCalculation) {
                            //empHireDate = systemStartDate;
                            if (empHireDate < systemStartDate) {
                                empHireDate = systemStartDate;
                            }
                            var searchDate = empHireDate.getDate() + "/" + (parseFloat((empHireDate.getMonth())) + parseFloat(1)) + "/" + empHireDate.getFullYear();
                            log.debug("searchDate", searchDate);
                            var customrecord_da_emp_leaves_entitlementSearchObj = search.create({
                                type: "customrecord_da_emp_leaves_entitlement",
                                filters: [
                                    ["custrecord_da_leave_entitlement_employee", "anyof", empId], "AND", [
                                        ["custrecord_da_leave_entitlement_edate", "isempty", ""], "OR", ["custrecord_da_leave_entitlement_edate", "after", searchDate]
                                    ]
                                ],
                                columns: [
                                    //search.createColumn({name: "id", label: "ID"}),
                                    search.createColumn({
                                        name: "scriptid",
                                        label: "Script ID"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_sdate",
                                        sort: search.Sort.DESC,
                                        label: "Date From"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_edate",
                                        label: "Date To"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_value",
                                        label: "Entitlement"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_leaves_entitlementSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_leaves_entitlementSearchObj result count", searchResultCount);
                            var totalEntitleDays = 0;
                            customrecord_da_emp_leaves_entitlementSearchObj.run().each(function(result) {
                                var leaveEntitleStartDate = result.getValue('custrecord_da_leave_entitlement_sdate');
                                leaveEntitleStartDate = new Date(leaveEntitleStartDate.split("/")[1] + "/" + leaveEntitleStartDate.split("/")[0] + "/" + leaveEntitleStartDate.split("/")[2]);
                                var leaveEntitleEndDate = (result.getValue('custrecord_da_leave_entitlement_edate'));
                                if (leaveEntitleEndDate) {
                                    leaveEntitleEndDate = new Date(leaveEntitleEndDate.split("/")[1] + "/" + leaveEntitleEndDate.split("/")[0] + "/" + leaveEntitleEndDate.split("/")[2]);
                                    log.debug("leaveEntitleEndDate", leaveEntitleEndDate + " " + new Date());
                                    if (leaveEntitleStartDate < empHireDate) {
                                        leaveEntitleStartDate = empHireDate;
                                    }
                                    if (leaveEntitleEndDate > new Date()) {
                                        leaveEntitleEndDate = new Date();
                                    }
                                    log.debug("leaveEntitleEndDate", leaveEntitleEndDate + " " + leaveEntitleStartDate);
                                } else {
                                    log.debug("Empty end");
                                    leaveEntitleEndDate = new Date();
                                }
                              
                              if(empTermDate){
                                if(leaveEntitleEndDate > empTermDate){
                                  leaveEntitleEndDate = empTermDate;
                                }
                              }
                                //log.debug("leaveEntitleStartDate",leaveEntitleStartDate +" "+ new Date(leaveEntitleStartDate) +" "+ result.getText('custrecord_da_leave_entitlement_sdate') + new Date(result.getText('custrecord_da_leave_entitlement_sdate')));
                                var unpaidLeaves = 0;
                                var lstartDate = leaveEntitleStartDate.getDate() + "/" + (parseFloat((leaveEntitleStartDate.getMonth())) + parseFloat(1)) + "/" + leaveEntitleStartDate.getFullYear();
                                var lendDate = leaveEntitleEndDate.getDate() + "/" + (parseFloat((leaveEntitleEndDate.getMonth())) + parseFloat(1)) + "/" + leaveEntitleEndDate.getFullYear();
                                var customrecord_da_employee_leavesSearchObj = search.create({
                                    type: "customrecord_da_employee_leaves",
                                    filters: [
                                        ["custrecord_da_employee_leave", "anyof", empId],
                                        "AND",
                                        ["custrecord_da_emp_leavetype", "anyof", "3"],
                                        "AND",
                                        ["custrecord_da_leave_approvalstatus", "anyof", "2"],
                                        "AND",
                                        ["custrecord_da_leave_startdate", "before", lendDate],
                                        "AND",
                                        ["custrecord_da_leave_startdate", "after", lstartDate]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "custrecord_da_emp_leavedays",
                                            label: "Leave Days"
                                        })
                                    ]
                                });
                                var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                                log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                                customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                    var leaveDays_unpaid = result.getValue('custrecord_da_emp_leavedays');
                                    unpaidLeaves = parseFloat(unpaidLeaves) + parseFloat(leaveDays_unpaid);
                                    return true;
                                });
                                log.debug('Days ', empHireDate + "  " + leaveEntitleEndDate);
                                var diffDays = calculateNoOfDays(empHireDate, leaveEntitleEndDate);
                                var totalWorkingDays = 0;
                                if (diffDays > 0) {
                                    totalWorkingDays = parseFloat(diffDays) - parseFloat(unpaidLeaves);
                                }
                                var leaveEntValue = result.getValue('custrecord_da_leave_entitlement_value');
                                var totalValue = (totalWorkingDays / 365) * leaveEntValue;
                                totalEntitleDays = parseFloat(totalEntitleDays) + parseFloat(totalValue);
                                empHireDate = leaveEntitleEndDate;
                                empHireDate.setDate(empHireDate.getDate() + 1);
                                return true;
                            });
                        } else {
                            //leave entitlements calculation
                            var searchDate = empHireDate.getDate() + "/" + (parseFloat((empHireDate.getMonth())) + parseFloat(1)) + "/" + empHireDate.getFullYear();
                            log.debug("searchDate", searchDate);
                            var customrecord_da_emp_leaves_entitlementSearchObj = search.create({
                                type: "customrecord_da_emp_leaves_entitlement",
                                filters: [
                                    ["custrecord_da_leave_entitlement_employee", "anyof", empId], "AND", [
                                        ["custrecord_da_leave_entitlement_edate", "isempty", ""], "OR", ["custrecord_da_leave_entitlement_edate", "after", searchDate]
                                    ]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_sdate",
                                        sort: search.Sort.ASC,
                                        label: "Date From"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_edate",
                                        label: "Date To"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_leave_entitlement_value",
                                        label: "Entitlement"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_emp_leaves_entitlementSearchObj.runPaged().count;
                            log.debug("customrecord_da_emp_leaves_entitlementSearchObj result count", searchResultCount);
                            var totalEntitleDays = 0;
                            customrecord_da_emp_leaves_entitlementSearchObj.run().each(function(result) {
                                var leaveEntitleStartDate = result.getValue('custrecord_da_leave_entitlement_sdate');
                                leaveEntitleStartDate = new Date(leaveEntitleStartDate.split("/")[1] + "/" + leaveEntitleStartDate.split("/")[0] + "/" + leaveEntitleStartDate.split("/")[2]);
                                var leaveEntitleEndDate = (result.getValue('custrecord_da_leave_entitlement_edate'));
                                if (leaveEntitleEndDate) {
                                    leaveEntitleEndDate = new Date(leaveEntitleEndDate.split("/")[1] + "/" + leaveEntitleEndDate.split("/")[0] + "/" + leaveEntitleEndDate.split("/")[2]);
                                    log.debug("leaveEntitleEndDate", leaveEntitleEndDate + " " + new Date());
                                    if (leaveEntitleStartDate < empHireDate) {
                                        leaveEntitleStartDate = empHireDate;
                                    }
                                    if (leaveEntitleEndDate > new Date()) {
                                        leaveEntitleEndDate = new Date();
                                    }
                                    log.debug("leaveEntitleEndDate", leaveEntitleEndDate + " " + leaveEntitleStartDate);
                                } else {
                                    log.debug("Empty end");
                                    leaveEntitleEndDate = new Date();
                                }
                              
                               if(empTermDate){
                                if(leaveEntitleEndDate > empTermDate){
                                  leaveEntitleEndDate = empTermDate;
                                }
                              }
                                var unpaidLeaves = 0;
                                var lendDate = leaveEntitleEndDate.getDate() + "/" + (parseFloat((leaveEntitleEndDate.getMonth())) + parseFloat(1)) + "/" + leaveEntitleEndDate.getFullYear();
                                //log.debug("lendDate",lendDate);
                                var lstartDate = leaveEntitleStartDate.getDate() + "/" + (parseFloat((leaveEntitleStartDate.getMonth())) + parseFloat(1)) + "/" + leaveEntitleStartDate.getFullYear();
                                //log.debug('lendDate',lendDate +"lstartDate"+lstartDate);
                                var customrecord_da_employee_leavesSearchObj = search.create({
                                    type: "customrecord_da_employee_leaves",
                                    filters: [
                                        ["custrecord_da_employee_leave", "anyof", empId],
                                        "AND",
                                        ["custrecord_da_emp_leavetype", "anyof", "2"],
                                        "AND",
                                        ["custrecord_da_leave_approvalstatus", "anyof", "2"],
                                        "AND",
                                        ["custrecord_da_leave_startdate", "before", lendDate], //startdate
                                        "AND",
                                        ["custrecord_da_leave_startdate", "after", lstartDate]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "custrecord_da_emp_leavedays",
                                            label: "Leave Days"
                                        })
                                    ]
                                });
                                var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                                customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                    var leaveDays_unpaid = result.getValue('custrecord_da_emp_leavedays');
                                    unpaidLeaves = parseFloat(unpaidLeaves) + parseFloat(leaveDays_unpaid);
                                    return true;
                                });
                                var diffDays = calculateNoOfDays(empHireDate, leaveEntitleEndDate);
                                log.debug('Days ', empHireDate + "  " + leaveEntitleEndDate);
                                var totalWorkingDays = 0;
                                if (diffDays > 0) {
                                    totalWorkingDays = parseFloat(diffDays) - parseFloat(unpaidLeaves);
                                }
                                log.debug("diffDays", "diffDays" + diffDays + "unpaidLeaves" + unpaidLeaves);
                                var leaveEntValue = result.getValue('custrecord_da_leave_entitlement_value');
                                var totalValue = (totalWorkingDays / 365) * leaveEntValue;
                                log.debug("total value", totalValue);
                                totalEntitleDays = parseFloat(totalEntitleDays) + parseFloat(totalValue);
                                empHireDate = leaveEntitleEndDate;
                                empHireDate.setDate(empHireDate.getDate() + 1);
                                return true;
                            });
                        }
                        //Getting leave days which are not equal to rejected
                        var customrecord_da_employee_leavesSearchObj = search.create({
                            type: "customrecord_da_employee_leaves",
                            filters: [
                                ["custrecord_da_employee_leave", "anyof", empId],
                                "AND",
                                ["custrecord_da_leave_approvalstatus", "noneof", "3"],
                                "AND",
                                ["custrecord_da_emp_leavetype", "anyof", "1"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_employee_leave",
                                    label: "Employee"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_emp_leavetype",
                                    label: "Leave Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_emp_leavedays",
                                    label: "Leave Days"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                        log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                        var totalLeavedays = 0;
                        customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                            var leaveDays = result.getValue('custrecord_da_emp_leavedays');
                            totalLeavedays = parseFloat(totalLeavedays) + parseFloat(leaveDays);
                            return true;
                        });
                        log.debug("totalEntitleDays", totalEntitleDays + " " + employeeOpeningBalance);
                        //leave Adjustments
                        var customrecord_da_leave_adjustmentsSearchObj = search.create({
                            type: "customrecord_da_leave_adjustments",
                            filters: [
                                ["custrecord_da_leave_adj_employee", "anyof", empId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_leave_adj_days",
                                    label: "Adjustment Days"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_leave_adjustmentsSearchObj.runPaged().count;
                        log.debug("customrecord_da_leave_adjustmentsSearchObj result count", searchResultCount);
                        var adjustmentDays = 0;
                        customrecord_da_leave_adjustmentsSearchObj.run().each(function(result) {
                            var days = result.getValue('custrecord_da_leave_adj_days');
                            adjustmentDays = parseFloat(adjustmentDays) + parseFloat(days);
                            return true;
                        });
                        //Adding all Leaves 
                        log.debug("leavedays", totalLeavedays);
                        var total_Leave_Balnce = (((parseFloat(employeeOpeningBalance) + parseFloat(totalEntitleDays)) - ((parseFloat(totalLeavedays) - parseFloat(hiddenLeaveBalance))))).toFixed(2);
                        total_Leave_Balnce = parseFloat(total_Leave_Balnce) + parseFloat(adjustmentDays);
                        log.debug('total_Leave_Balnce', total_Leave_Balnce);
                        var today_date = new Date();
                        if (new Date().getDate() == "01" || new Date().getDate() == 1 || new Date().getDate() == 01) {
                            var yesterday = new Date(today_date);
                            yesterday.setDate(yesterday.getDate() - 1);
                            var leaveBalance_end_monthRec = record.create({
                                type: 'customrecord_da_leave_balance_at_mon_end'
                            });
                            leaveBalance_end_monthRec.setValue('custrecord_da_leave_end_employee', empId);
                            leaveBalance_end_monthRec.setValue('custrecord_da_leave_balance_of_date', total_Leave_Balnce);
                            leaveBalance_end_monthRec.setValue('custrecord_da_end_leave_bal_date', yesterday);
                            leaveBalance_end_monthRec.save();
                        }
                        if (leavesCarryForward) {
                            var empHireDate1 = empRecord.getText('hiredate');
                            empHireDate1 = empHireDate1.toString();
                            empHireDate1 = new Date(empHireDate1.split("/")[1] + "/" + empHireDate1.split("/")[0] + "/" + empHireDate1.split("/")[2]);
                            //log.debug('vvv',empHireDate1.split("/")[0] +"  "+ empHireDate1.split("/")[1]);
                            if (new Date().getDate() == empHireDate1.getDate() && new Date().getMonth() == empHireDate1.getMonth()) {
                                if (currentLeaveBalance > carryForwardDays) {
                                    total_Leave_Balnce = carryForwardDays;
                                    var storingLeaveBal = parseFloat(currentLeaveBalance) - parseFloat(carryForwardDays);
                                    record.submitFields({
                                        type: 'employee',
                                        id: empId,
                                        values: {
                                            'custentity_da_leave_balance_storing': -(storingLeaveBal)
                                        },
                                        options: {
                                            enableSourcing: false,
                                            ignoreMandatoryFields: true
                                        }
                                    });
                                } else {
                                    record.submitFields({
                                        type: 'employee',
                                        id: empId,
                                        values: {
                                            'custentity_da_leave_balance_storing': 0
                                        },
                                        options: {
                                            enableSourcing: false,
                                            ignoreMandatoryFields: true
                                        }
                                    });
                                }
                            }
                        }
                        record.submitFields({
                            type: 'customrecord_emp_leave_balance',
                            id: leavebalanceRecId,
                            values: {
                                'custrecord_emp_leave_balance': total_Leave_Balnce
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function getUnpaidLeaves(empId, leaveEntitleStartDate, leaveEntitleEndDate) {}

        function calculateLeaveEntitlementDays(startDate, endDate, entitleDays) {
            var leave_day = entitleDays / 365;
            var leave_month = entitleDays / 12;
            if (isFirstDay(startDate) == true && isLastDay(endDate) == true) {
                log.debug('start & end');
                var noOfMonths = diff_months(endDate, startDate);
                return (noOfMonths * leave_month);
            }
            if (isFirstDay(startDate) == true && isLastDay(endDate) == false) {
                log.debug('start & !end');
                var new_end_date = new Date(getLastDateOFPrevMonth(endDate));
                log.debug('new_end_date', new_end_date);
                var noOfMonths = diff_months(new_end_date, startDate);
                var result = noOfMonths * leave_month;
                var noOfDays = calculateNoOfDays(new_end_date, endDate);
                log.debug('noOfDays & noOfMonths', noOfDays + "     " + noOfMonths);
                return (result + (noOfDays * leave_day));
            }
            if (isFirstDay(startDate) == false && isLastDay(endDate) == true) {
                log.debug('!start & end');
                var new_start_date = new Date(getFirstDateOfNextMonth(startDate));
                log.debug('new_start_date', new_start_date);
                var noOfMonths = diff_months(endDate, new_start_date);
                var result = noOfMonths * leave_month;
                var noOfDays = calculateNoOfDays(new_start_date, startDate);
                log.debug('noOfDays & noOfMonths', noOfDays + "     " + noOfMonths);
                return (result + (noOfDays * leave_day));
            }
            if (isFirstDay(startDate) == false && isLastDay(endDate) == false) {
                log.debug('!start & !end');
                var new_start_date = new Date(getFirstDateOfNextMonth(startDate));
                var new_end_date = new Date(getLastDateOFPrevMonth(endDate));
                log.debug('new_start_date,,new_end_date', new_start_date + "  " + new_end_date);
                var noOfMonths = diff_months(new_end_date, new_start_date);
                var result = noOfMonths * leave_month;
                var noOfDays_f_period = calculateNoOfDays(new_start_date, startDate);
                var noOfDays_l_period = calculateNoOfDays(new_end_date, endDate);
                log.debug('noOfDays & noOfMonths', noOfDays_f_period + "  " + noOfDays_l_period + "     " + noOfMonths);
                result = result + (noOfDays_f_period * leave_day);
                return (result + (noOfDays_l_period * leave_day));
            }
        }

        function calculateNoOfDays(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }

        function isFirstDay(dt) {
            var firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1);
            if (firstDay.getDate() == dt.getDate()) {
                return true;
            } else {
                return false;
            }
        }

        function getLastDateOFPrevMonth(endDate) {
            var kuwaitTime = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_RIYADH
            });
            var d = new Date(endDate);
            d.setDate(1);
            d.setHours(-20);
            return d;
        }

        function getFirstDateOfNextMonth(now) {
            if (now.getMonth() == 11) {
                var current = new Date(now.getFullYear() + 1, 0, 1);
                return current;
            } else {
                var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                return current;
            }
        }

        function isLastDay(dt) {
            var test = new Date(dt.getTime()),
                month = test.getMonth();
            test.setDate(test.getDate() + 1);
            return test.getMonth() !== month;
        }

        function diff_months(dt2, dt1) {
            var diff = (dt2.getTime() - dt1.getTime()) / 1000;
            diff /= (60 * 60 * 24 * 7 * 4);
            return Math.floor(Math.abs(diff));
        }

        function daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        }

        function convertminutes(hours, minutes) {
            return Number((hours * 60)) + Number(minutes);
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