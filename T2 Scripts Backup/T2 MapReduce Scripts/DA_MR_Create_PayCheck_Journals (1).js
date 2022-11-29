/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
    function(record, search, runtime) {
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
                var payrunRecId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_da_sch_payrun_recid'
                });
                //  log.debug('payrunRecId', payrunRecId);
                var deductionRec = record.load({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: payrunRecId
                });
                // log.debug('deductionRec', deductionRec.getValue('custrecord_da_sch_pay_run_emplist'));
                var arr = JSON.parse(deductionRec.getValue('custrecord_da_sch_pay_run_emplist'));
                log.debug('arr', arr);
                for (var i = 0; i < arr.length; i++) {
                    // log.debug('i', arr[i]);
                    context.write({
                        key: arr[i],
                        value: arr[i]
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
                var empId = JSON.parse(context.key);
                // log.debug('empId', empId);
                var empRecord = record.load({
                    type: 'employee',
                    id: empId
                });
                var employeeWorkingSubsidary = empRecord.getValue('subsidiary');
                var department = empRecord.getValue('department');
                // log.debug('employeeWorkingSubsidary',typeof employeeWorkingSubsidary);
                log.debug('employeeWorkingSubsidary', employeeWorkingSubsidary.length);
                var payrunRecId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_da_sch_payrun_recid'
                });
                log.debug('payrunRecId', payrunRecId);
                var payrunSchRec = record.load({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: payrunRecId
                });
                var pperiod = payrunSchRec.getValue('custrecord_da_sch_pay_run_period');
                var subsidiary = payrunSchRec.getValue('custrecord_da_override_primary_subsidair');
                var icArAccount = payrunSchRec.getValue('custrecord_da_payroll_ic_ar_account');

                var overrideSubsidiary = payrunSchRec.getValue('custrecord_da_override_primary_subsidair');
                var quickPay = payrunSchRec.getValue('custrecord_da_sch_pay_run_quick_pay');
                var sameSubsidairy = true;
                if (overrideSubsidiary == employeeWorkingSubsidary) {
                    //creating paycheck journal record
                    var paycheckJournalRec = record.create({
                        type: "customtransaction_da_paycheck_journal",
                        isDynamic: true
                    });
                } else {
                    sameSubsidairy = false;
                    var paycheckJournalRec = record.create({
                        type: "customtransaction_da_ic_paycheck_journal",
                        isDynamic: true
                    });
                }
                if (employeeWorkingSubsidary.length == 0) {
                    sameSubsidairy = true;
                    var paycheckJournalRec = record.create({
                        type: "customtransaction_da_paycheck_journal",
                        isDynamic: true
                    });
                }
                var date = payrunSchRec.getValue('custrecord_da_sch_pay_run_date');
                var account = payrunSchRec.getValue('custrecord_da_sch_pay_run_account');
                paycheckJournalRec.setValue('subsidiary', subsidiary);


                // paycheckJournalRec.setValue('account',account);
                paycheckJournalRec.setValue('custbody_da_ic_paycheck_employee', empId);
                paycheckJournalRec.setValue('custbody_da_created_from_payroll_sheet', payrunRecId);
                try {
                    paycheckJournalRec.setValue('department', department);
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }

                paycheckJournalRec.setValue('trandate', date);
                paycheckJournalRec.setValue('postingperiod', pperiod);

                //deleting pending claims

                var customrecord_da_pending_claims_for_emplySearchObj = search.create({
                    type: "customrecord_da_pending_claims_for_emply",
                    filters: [
                        ["custrecord_da_pending_claim_employee", "anyof", empId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "scriptid",
                            sort: search.Sort.ASC,
                            label: "Script ID"
                        }),
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
                //log.debug("customrecord_da_pending_claims_for_emplySearchObj result count",searchResultCount);
                customrecord_da_pending_claims_for_emplySearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_pending_claims_for_emply',
                        id: result.id
                    })
                    return true;
                });
                var customrecord_da_pay_run_itemsSearchObj = search.create({
                    type: "customrecord_da_pay_run_items",
                    filters: [
                        ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
                        "AND",
                        ["custrecord_da_pay_run_employee", "anyof", empId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_pay_run_ded_amount",
                            summary: "SUM",
                            label: "Deducted Amount"
                        })
                    ]
                });
                var totalNetPaid = 0;
                var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                // log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
                customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                    totalNetPaid = result.getValue({
                        name: 'custrecord_da_pay_run_ded_amount',
                        summary: search.Summary.SUM
                    });
                    return true;
                });
                log.debug('sameSubsidairy', sameSubsidairy);
                ///////////////////////////////////////////
                if (sameSubsidairy == false) {

                    var totalReceievableAmount = 0;
                    var customrecord_da_pay_run_itemsSearchObj = search.create({
                    type: "customrecord_da_pay_run_items",
                        filters: [
                            ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
                            "AND",
                            ["custrecord_da_pay_run_employee", "anyof", empId],
                            "AND",
                            ["custrecord_da_ic_payrun_items","is","F"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_pay_run_ded_amount",
                                summary: "SUM",
                                label: "Deducted Amount"
                            })
                        ]
                    });
                    //var totalNetPaid = 0;
                    var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                    // log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
                    customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                        totalReceievableAmount = result.getValue({
                            name: 'custrecord_da_pay_run_ded_amount',
                            summary: search.Summary.SUM
                        });
                        return true;
                    });

                    paycheckJournalRec.selectNewLine({
                        sublistId: 'line'
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: icArAccount
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: Number(totalReceievableAmount).toFixed(2)
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_da_paycheck_3dp_value',
                        value: Number(totalReceievableAmount).toFixed(3)
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: "Total Net Paid Salary"
                    });
                    paycheckJournalRec.commitLine({
                        sublistId: 'line'
                    });

                    var interCompanyAmount = 0;

                    var customrecord_da_pay_run_itemsSearchObj = search.create({
                       type: "customrecord_da_pay_run_items",
                       filters:
                       [
                             ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
                             "AND",
                             ["custrecord_da_pay_run_employee", "anyof", empId],
                             "AND", 
                             ["custrecord_da_ic_payrun_items","is","T"]
                       ],
                       columns:
                       [
                          search.createColumn({name: "custrecord_da_pay_run_employee", label: "Employee"}),
                          search.createColumn({name: "custrecord_da_pay_run_paroll_items", label: "Payroll Item"}),
                          search.createColumn({name: "custrecord_da_pay_run_item_hours", label: "Hours"}),
                          search.createColumn({name: "custrecord_da_pay_run_item_amount", label: "Amount"}),
                          search.createColumn({name: "custrecord_da_payroll_item_type", label: "Item Type"}),
                          search.createColumn({
                             name: "custrecord_da_item_expense_account",
                             join: "CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS",
                             label: "Account"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                    log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
                    customrecord_da_pay_run_itemsSearchObj.run().each(function(result){

                        var itemType = result.getValue('custrecord_da_payroll_item_type');

                        paycheckJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: result.getValue({name :'custrecord_da_item_expense_account', join :'CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS'})
                        });
                        if(itemType == 1){

                             var amount = Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2);
                             interCompanyAmount = parseFloat(interCompanyAmount) + parseFloat(amount);

                             paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2)
                            });
                        }
                        if(itemType == 2){
                             var amount = Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2);
                             interCompanyAmount = parseFloat(interCompanyAmount) - parseFloat(amount);

                             paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2)
                            });
                        }                       
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_paycheck_3dp_value',
                            value: Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(3)
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: result.getText('custrecord_da_pay_run_paroll_items')
                        });
                        paycheckJournalRec.commitLine({
                            sublistId: 'line'
                        });

                        return true;
                    });

                    var basicAmount = parseFloat(totalReceievableAmount) + parseFloat(interCompanyAmount);

                    var customrecord_da_pay_run_itemsSearchObj = search.create({
                       type: "customrecord_da_pay_run_items",
                       filters:
                       [
                          ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
                          "AND",
                          ["custrecord_da_pay_run_employee", "anyof", empId],
                          "AND", 
                          ["custrecord_da_pay_run_paroll_items.custrecord_da_payrol_item_category","anyof","1"]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "custrecord_da_pay_run_ded_amount",
                             summary: "SUM",
                             label: "Deducted Amount"
                          }),
                          search.createColumn({
                             name: "custrecord_da_item_expense_account",
                             join: "CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS",
                             summary: "GROUP",
                             label: "Account"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                    log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
                    customrecord_da_pay_run_itemsSearchObj.run().each(function(result){

                        paycheckJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: result.getValue({
                                name :'custrecord_da_item_expense_account',
                                join :'CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS',
                                summary : search.Summary.GROUP
                            })
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: Number(basicAmount).toFixed(2)
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_paycheck_3dp_value',
                            value: Number(basicAmount).toFixed(3)
                        });
                        paycheckJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: "Basic Salary"
                        });
                        paycheckJournalRec.commitLine({
                            sublistId: 'line'
                        });
                       
                        //return true;
                    });


                }
                //////////////////////////////////////////
                if (totalNetPaid != 0 && sameSubsidairy) {
                    paycheckJournalRec.selectNewLine({
                        sublistId: 'line'
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: account
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: Number(totalNetPaid).toFixed(2)
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_da_paycheck_3dp_value',
                        value: Number(totalNetPaid).toFixed(2)
                    });

                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: "Total Net Paid Salary"
                    });
                    paycheckJournalRec.commitLine({
                        sublistId: 'line'
                    });
                }
                if (sameSubsidairy) {
                    var customrecord_da_pay_run_itemsSearchObj = search.create({
                        type: "customrecord_da_pay_run_items",
                        filters: [
                            ["custrecord_da_pay_run_scheduling", "anyof", payrunRecId],
                            "AND",
                            ["custrecord_da_pay_run_employee", "anyof", empId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({
                                name: "custrecord_da_pay_run_employee",
                                label: "Employee"
                            }),
                            search.createColumn({
                                name: "custrecord_da_payroll_item_type",
                                label: "Item Type"
                            }),
                            search.createColumn({
                                name: "custrecord_da_pay_run_paroll_items",
                                label: "Payroll Item"
                            }),
                            search.createColumn({
                                name: "custrecord_da_pay_run_item_hours",
                                label: "Hours"
                            }),
                            search.createColumn({
                                name: "custrecord_da_pay_run_item_amount",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leave_record_id",
                                label: "Leaverecord ID"
                            }),
                            search.createColumn({
                                name: "custrecord_da_payroll_project",
                                label: "Payroll Project"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                    log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
                    customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
                        log.debug('result', result);
                        log.debug('pYROLLITEM', result.getValue('custrecord_da_pay_run_paroll_items') + ',' + result.getText('custrecord_da_pay_run_paroll_items') + ',' + result.getText('custrecord_da_payroll_item_type'));
                        log.debug('pYROLLITEM', result.getText('custrecord_da_pay_run_paroll_items'));
                        var payrollType = result.getText('custrecord_da_payroll_item_type');
                        var digitalPayrollId = result.getValue('custrecord_da_pay_run_paroll_items');
                        var payrollItemRec = record.load({
                            type: 'customrecord_da_payroll_items',
                            id: digitalPayrollId
                        })
                        if (payrollType == "Earnings") { //earnings
                            var account = payrollItemRec.getValue('custrecord_da_item_expense_account');
                            paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: account
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2)
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_paycheck_3dp_value',
                                value: result.getValue('custrecord_da_pay_run_item_amount')
                            });
                            /* paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });*/
                            var project = result.getValue('custrecord_da_payroll_project');
                            if (project) {
                                paycheckJournalRec.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'entity',
                                    value: project
                                });
                            }
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: result.getText('custrecord_da_pay_run_paroll_items')
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                        }
                        if (payrollType == "Deductions") { //deductions
                            var account = payrollItemRec.getValue('custrecord_da_item_expense_account');
                            paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: account
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: Number(result.getValue('custrecord_da_pay_run_item_amount')).toFixed(2)
                            });
                            /* paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });*/
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_paycheck_3dp_value',
                                value: (result.getValue('custrecord_da_pay_run_item_amount'))
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: result.getText('custrecord_da_pay_run_paroll_items')
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                        }
                        return true;
                    });
                }
                var paycheck = paycheckJournalRec.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug('paycheck', paycheck);

                if (totalNetPaid < 0) {
                    var claimRec = record.create({
                        type: 'customrecord_da_pending_claims_for_emply'
                    });

                    claimRec.setValue('custrecord_da_pending_claim_employee', empId);
                    claimRec.setValue('custrecord_da_pending_claim_amount', totalNetPaid);
                    claimRec.setValue('custrecord_da_pending_claim_month', pperiod);

                    claimRec.save();
                }
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
                var payrunRecId = runtime.getCurrentScript().getParameter({
                    name: 'custscript_da_sch_payrun_recid'
                });
                log.debug('payrunRecId', payrunRecId);
                record.submitFields({
                    type: 'customrecord_da_pay_run_scheduling',
                    id: payrunRecId,
                    values: {
                        'custrecord_creating_paycheck_jounrals': false
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
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