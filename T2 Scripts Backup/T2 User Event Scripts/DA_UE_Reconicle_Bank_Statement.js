    /**
     * @NApiVersion 2.x
     * @NScriptType UserEventScript
     * @NModuleScope TargetAccount
     */
    define(['N/runtime', 'N/record', 'N/search', 'N/format'],

        function(runtime, record, search, format) {
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
                    var reconciled = scriptContext.newRecord.getValue('custrecord_da_bank_stmnt_reconciled');
                    var scriptObj = runtime.getCurrentScript();
                    log.debug("Deployment Id: " + scriptObj.deploymentId);
                    if (scriptContext.type == 'view' && reconciled == false) {
                        var subsidiary = scriptContext.newRecord.getValue('custrecord_da_bank_reco_subsidairy');
                        var account = scriptContext.newRecord.getValue('custrecord_reconcilebankaccount');

                        var featureInEffect = runtime.isFeatureInEffect({
                            feature: 'SUBSIDIARIES'
                        });
                        log.debug('Subsidiaries feature is enabled:', featureInEffect);
                        if (featureInEffect) {
                            if (subsidiary) {

                                /* var s = search.create({
                                     type: "customtransactiontype",
                                     filters: [
                                         ["scriptid", "is", "customtransaction_bankcharges"]
                                     ],
                                     columns: ["name", "scriptid"]
                                 }).run().getRange(0, 1);*/

                                var bankChargesRecID = record.create({
                                    type: 'customtransaction_bankcharges'
                                }).getValue('customtype');
                                log.debug('bankChargesRecID', bankChargesRecID);
                                //log.debug(s);
                                scriptContext.form.addButton({
                                    id: 'custpage_add_bank_charge',
                                    label: 'Add Bank Charge',
                                    functionName: 'LinesBankCharge("' + scriptContext.newRecord.id + '",' + subsidiary + ', "' + account + '","' + bankChargesRecID + '")'
                                });

                                /*var bankInterestSearch = search.create({
                                    type: "customrecordtype",
                                    filters: [
                                        ["scriptid", "is", "customtransaction_bank_interests"]
                                    ],
                                    columns: ["name", "scriptid"]
                                }).run().getRange(0, 1);*/


                                var bankInterestRecID = record.create({
                                    type: 'customtransaction_bank_interests'
                                }).getValue('customtype');
                                log.debug('bankInterestRecID', bankInterestRecID);
                                //log.debug(bankInterestSearch[0].id);
                                scriptContext.form.addButton({
                                    id: 'custpage_add_interest',
                                    label: 'Add Interest Earned',
                                    functionName: 'LinesInterest("' + scriptContext.newRecord.id + '",' + subsidiary + ', "' + account + '","' + bankInterestRecID + '")'
                                });
                            }

                        } else {
                            /* var s = search.create({
                                 type: "customtransactiontype",
                                 filters: [
                                     ["scriptid", "is", "customtransaction_bankcharges"]
                                 ],
                                 columns: ["name", "scriptid"]
                             }).run().getRange(0, 1);*/

                            var bankChargesRecID = record.create({
                                type: 'customtransaction_bankcharges'
                            }).getValue('customtype');
                            log.debug('bankChargesRecID', bankChargesRecID);
                            //log.debug(s);
                            scriptContext.form.addButton({
                                id: 'custpage_add_bank_charge',
                                label: 'Add Bank Charge',
                                functionName: 'LinesBankCharge("' + scriptContext.newRecord.id + '", "' + account + '","' + bankChargesRecID + '")'
                            });

                            /*var bankInterestSearch = search.create({
                                type: "customrecordtype",
                                filters: [
                                    ["scriptid", "is", "customtransaction_bank_interests"]
                                ],
                                columns: ["name", "scriptid"]
                            }).run().getRange(0, 1);*/

                            var bankInterestRecID = record.create({
                                type: 'customtransaction_bank_interests'
                            }).getValue('customtype');
                            log.debug('bankInterestRecID', bankInterestRecID);
                            //log.debug(bankInterestSearch[0].id);
                            scriptContext.form.addButton({
                                id: 'custpage_add_interest',
                                label: 'Add Interest Earned',
                                functionName: 'LinesInterest("' + scriptContext.newRecord.id + '", "' + account + '","' + bankInterestRecID + '")'
                            });
                        }


                    }



                    scriptContext.form.clientScriptModulePath = './DA_CS_Reconcile_Bank_Statement.js';

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
                    var recId = scriptContext.newRecord.id;
                    log.debug(recId);
                    try {
                        var type = scriptContext.newRecord.type;
                        var cashInflowSearch = search.create({
                            type: 'customrecord_bankstatementinflowtrans',
                            columns: [
                                'internalid'
                            ],
                            filters: ['custrecord_reconcilebankstatpareinflow', 'anyof', recId]
                        });
                        log.debug('cashInflowSearch count', cashInflowSearch.runPaged().count);
                        cashInflowSearch.run().each(function(result) {
                            var recordId = result.id;
                            record.delete({
                                type: 'customrecord_bankstatementinflowtrans',
                                id: recordId
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    try {
                        var cashOutflowSearch = search.create({
                            type: 'customrecord_bankstatementoutflowtran',
                            columns: [
                                'internalid'
                            ],
                            filters: [
                                ["custrecord_reconcilebankstatpareoutflow", "anyof", recId]
                            ],
                        });
                        log.debug('cashOutflowSearch count', cashOutflowSearch.runPaged().count);
                        cashOutflowSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            record.delete({
                                type: 'customrecord_bankstatementoutflowtran',
                                id: recordId
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    try {
                        var bankChargesSearch = search.create({
                            type: 'customrecord_bankcharges',
                            columns: [
                                'internalid'
                            ],
                            filters: ['custrecord_reconcilebankcharge', 'anyof', recId]
                        });
                        log.debug('bankChargesSearch count', bankChargesSearch.runPaged().count);
                        bankChargesSearch.run().each(function(result) {
                            var recordId = result.id;
                            record.delete({
                                type: 'customrecord_bankcharges',
                                id: recordId
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    try {
                        var bankInterestSearch = search.create({
                            type: 'customrecord_bankinterest',
                            columns: [
                                'internalid'
                            ],
                            filters: ['custrecord_custrecord_reconcilebankinter', 'anyof', recId]
                        });
                        log.debug('bankInterestSearch count', bankInterestSearch.runPaged().count);
                        bankInterestSearch.run().each(function(result) {
                            var recordId = result.id;
                            record.delete({
                                type: 'customrecord_bankinterest',
                                id: recordId
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    var objRecord = record.load({
                        type: 'customrecord_reconcilebankstatement',
                        id: recId,
                        isDynamic: true
                    });
                    var endingBalance = scriptContext.newRecord.getValue('custrecord_endingstatementbalance');
                    log.debug('endingBalance', endingBalance);
                    var currentReconciledAmount = scriptContext.newRecord.getValue('custrecord_reconciledthisstatement');
                    log.debug('currentReconciledAmount', currentReconciledAmount);
                    var lastReconciledAmount = scriptContext.newRecord.getValue('custrecord_lastreconciledbalanceopening');
                    log.debug('lastReconciledAmount', lastReconciledAmount);
                    var differenceAmount = parseFloat(endingBalance) - (parseFloat(currentReconciledAmount) + parseFloat(lastReconciledAmount));
                    objRecord.setValue('custrecord_statementdifference', differenceAmount);
                    log.debug('differenceAmount', differenceAmount);



                    //////////////////////////////////////////////////////////////////////////////////////////

                    var taxLiablityRecId = record.create({
                        type: 'customtransaction_da_write_tax_liability'
                    }).getValue('customtype');
                    log.debug('taxLiablityRecId', taxLiablityRecId);

                    var bankChargesRecID = record.create({
                        type: 'customtransaction_bankcharges'
                    }).getValue('customtype');
                    log.debug('bankChargesRecID', bankChargesRecID);

                    var bankInterestRecID = record.create({
                        type: 'customtransaction_bank_interests'
                    }).getValue('customtype');
                    log.debug('bankInterestRecID', bankInterestRecID);

                    var featureInEffect = runtime.isFeatureInEffect({
                        feature: 'SUBSIDIARIES'
                    });
                    log.debug('Subsidiaries feature is enabled:', featureInEffect);
                    var account = objRecord.getValue('custrecord_reconcilebankaccount');
                    //new code
                    try {
                        var customrecord_reconcilebankstatementSearchObj = search.create({
                            type: "customrecord_reconcilebankstatement",
                            filters: [
                                ["custrecord_reconcilebankaccount", "anyof", account], "AND", ["custrecord_da_bank_stmnt_reconciled", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_reconcilebankaccount",
                                    label: "Bank Account"
                                }),
                                search.createColumn({
                                    name: "custrecord_currencystatement",
                                    label: "Currency"
                                }),
                                search.createColumn({
                                    name: "custrecord_bankstatementstartdate",
                                    label: "Bank Statement Start Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_bankstatementenddate",
                                    sort: search.Sort.DESC,
                                    label: "Bank Statement End Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_endingstatementbalance",
                                    label: "Ending Statement Balance"
                                }),
                                search.createColumn({
                                    name: "custrecord_reconciledthisstatement",
                                    label: "reconciled amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_lastreconciledbalanceopening",
                                    label: "Last Reconciled Balance (Opening Balance)"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_reconcilebankstatementSearchObj.runPaged().count;
                        log.debug("customrecord_reconcilebankstatementSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            customrecord_reconcilebankstatementSearchObj.run().each(function(result) {
                                log.debug(result.id, result.getValue('custrecord_reconciledthisstatement'));
                                objRecord.setValue('custrecord_lastreconciledbalanceopening', result.getValue('custrecord_reconciledthisstatement'));
                                //return true;
                            });

                        } else {
                            objRecord.setValue('custrecord_lastreconciledbalanceopening', 0);
                        }
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    var statementStartDate = objRecord.getValue('custrecord_bankstatementstartdate');
                    var statementEndDate = objRecord.getValue('custrecord_bankstatementenddate');
                    var statementStartDateT = objRecord.getText('custrecord_bankstatementstartdate');
                    var statementEndDateT = objRecord.getText('custrecord_bankstatementenddate');
                    var currency = objRecord.getValue('custrecord_currencystatement');
                    var subsidiaryId = objRecord.getValue('custrecord_da_bank_reco_subsidairy');
                    log.debug('statementStartDateT', statementStartDateT);
                    log.debug('statementEndDateT', statementEndDateT);

                    try {
                        var journalSearch = search.create({
                            type: 'journalentry',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account]
                            ]
                        });
                        if (featureInEffect) {
                            // log.debug('push subsidiary',subsidiaryId);
                            var subsidiaryFilters = journalSearch.filters;
                            subsidiaryFilters.push(search.createFilter({
                                name: "subsidiary",
                                operator: search.Operator.ANYOF,
                                values: subsidiaryId
                            }));
                        }
                        log.debug('journalSearch count', journalSearch.runPaged().count);
                        journalSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    try {
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["type", "anyof", "Custom" + bankChargesRecID, "Custom" + bankInterestRecID],
                                "AND",
                                ["custbody_da_bank_account", "anyof", account],
                                "AND",
                                ["account", "anyof", account],
                                "AND",
                                ["currency", "anyof", currency],
                                "AND",
                                ["custbody_reconciled", "is", "F"],
                                "AND",
                                ["trandate", "within", statementStartDateT, statementEndDateT]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Total 3 Decimal"
                                }),
                                search.createColumn({
                                    name: "custbody_createdfrombankstatement",
                                    label: "Created From Bank Statement"
                                }),
                                search.createColumn({
                                    name: "type",
                                    label: "Type"
                                })
                            ]
                        });
                        if (featureInEffect) {
                            log.debug('push subsidiary', subsidiaryId);
                            var subsidiaryFilters = transactionSearchObj.filters;
                            subsidiaryFilters.push(search.createFilter({
                                name: "subsidiary",
                                operator: search.Operator.ANYOF,
                                values: subsidiaryId
                            }));
                        }
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("new transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var type = result.getText('type');
                            log.debug('type', type);
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var createdFromBankStatement = result.getValue('custbody_createdfrombankstatement');
                            log.debug('createdFromBankStatement', createdFromBankStatement);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);

                            if (type == "Bank Charges") {
                                log.debug('bank charges');
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                if (!createdFromBankStatement) {
                                    log.debug('bank charges not having created from');
                                    objRecord.selectNewLine({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                        fieldId: 'custrecord_documentnumberoutflow',
                                        value: recordId,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                        fieldId: 'custrecord_da_outflow_tran_record_type',
                                        value: type
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                        fieldId: 'custrecord_amount3decimaloutflow',
                                        value: (bankStatementAmt)
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                    });
                                }
                            }
                            if (type == "Other Deposits") {
                                log.debug('other Deposit');
                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                if (!createdFromBankStatement) {
                                    log.debug('other Deposit not having created from');
                                    objRecord.selectNewLine({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                        fieldId: 'custrecord_da__inflow_tran_record_type',
                                        value: type
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                        fieldId: 'custrecord__documentnumberoutflow',
                                        value: recordId,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: false
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                        fieldId: 'custrecord__amount3decimalinflow',
                                        value: (bankStatementAmt)
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                    });
                                }
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }



                    try {
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["account", "anyof", account],
                                "AND",
                                ["custbody_reconciled", "is", "F"],
                                "AND",
                                ["type", "anyof", "CustRfnd", "CustPymt", "CustDep", "CashSale", "CashRfnd", "Deposit", "VendPymt", "VPrep", "Check", "Custom" + taxLiablityRecId, ],
                                "AND",
                                ["trandate", "within", statementStartDateT, statementEndDateT]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "ordertype",
                                    sort: search.Sort.ASC,
                                    label: "Order Type"
                                }),
                                search.createColumn({
                                    name: "mainline",
                                    label: "*"
                                }),
                                search.createColumn({
                                    name: "trandate",
                                    label: "Date"
                                }),
                                search.createColumn({
                                    name: "asofdate",
                                    label: "As-Of Date"
                                }),
                                search.createColumn({
                                    name: "postingperiod",
                                    label: "Period"
                                }),
                                search.createColumn({
                                    name: "taxperiod",
                                    label: "Tax Period"
                                }),
                                search.createColumn({
                                    name: "type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    label: "Document Number"
                                }),
                                search.createColumn({
                                    name: "entity",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "account",
                                    label: "Account"
                                }),
                                search.createColumn({
                                    name: "memo",
                                    label: "Memo"
                                }),
                                search.createColumn({
                                    name: "amount",
                                    label: "Amount"
                                }),
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Total"
                                }),
                                search.createColumn({
                                    name: "recordtype",
                                    label: "Record Type"
                                }),

                            ]
                        });
                        transactionSearchObj.filters.push(search.createFilter({
                            "name": "custbody_dabankstatementamount",
                            "operator": "greaterthan",
                            "values": "0.00"
                        }));
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var documentNo = result.id;
                            var entity = result.getValue('entity');
                            log.debug('entity', entity);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            if (bankStatementAmt < 0) {
                                bankStatementAmt = -(bankStatementAmt);
                            }

                            objRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                            });
                            if (entity) {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__payeeinflow',
                                    value: entity
                                });
                            }
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                fieldId: 'custrecord_da__inflow_tran_record_type',
                                value: result.getValue('recordtype')
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                fieldId: 'custrecord__documentnumberoutflow',
                                value: documentNo,
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                fieldId: 'custrecord__amount3decimalinflow',
                                value: bankStatementAmt,
                                ignoreFieldChange: true
                            });
                            objRecord.commitLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    try {
                        transactionSearchObj.filters.pop({
                            "name": "custbody_dabankstatementamount"
                        });
                        transactionSearchObj.filters.push(search.createFilter({
                            "name": "custbody_dabankstatementamount",
                            "operator": "lessthan",
                            "values": "0.00"
                        }));
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var documentNo = result.id;
                            var entity = result.getValue('entity');
                            var amount = Number(result.getValue('custbody_dabankstatementamount')).toFixed(3);
                            objRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                            });

                            if (entity) {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_payeeoutflow',
                                    value: entity
                                });
                            }
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                fieldId: 'custrecord_documentnumberoutflow',
                                value: documentNo,
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                fieldId: 'custrecord_da_outflow_tran_record_type',
                                value: result.getValue('recordtype')
                            });
                            if (amount > 0) {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: -(amount)
                                });
                            } else {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (amount)
                                });
                            }
                            objRecord.commitLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    try {
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["formulatext: {recordType}", "contains", "customtransaction_dabanktransfer"],
                                "AND",
                                ["custbody_dadestinationaccount", "anyof", account], "AND", ["custbody_reconciled", "is", "F"],
                                "AND",
                                ["mainline", "is", "T"], "AND",
                                ["trandate", "within", statementStartDateT, statementEndDateT]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custbody_da_total_3_decimal",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "currency",
                                    label: "Currency"
                                }),
                                search.createColumn({
                                    name: "exchangerate",
                                    label: "Exchange Rate"
                                }),
                                search.createColumn({
                                    name: "recordtype",
                                    label: "Record Type"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    label: "Document Number"
                                }),
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var documentNo = result.id;
                            var bankTransCurrency = result.getValue('currency');
                            log.debug('bankTransCurrency', bankTransCurrency);
                            var amount3Decimal = result.getValue('custbody_da_total_3_decimal');
                            log.debug('amount3Decimal', amount3Decimal);
                            var exchangerateAmt = result.getValue('exchangerate');
                            log.debug('exchangerateAmt', exchangerateAmt);
                            exchangerateAmt = parseFloat(amount3Decimal) * parseFloat(exchangerateAmt);
                            log.debug('exchangerateAmt', exchangerateAmt);

                            objRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                fieldId: 'custrecord_da__inflow_tran_record_type',
                                value: result.getValue('recordtype')
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                fieldId: 'custrecord__documentnumberoutflow',
                                value: documentNo,
                                ignoreFieldChange: false,
                                forceSyncSourcing: false
                            });
                            if (currency == bankTransCurrency) {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: amount3Decimal
                                });
                            } else {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: exchangerateAmt.toFixed(3)
                                });
                            }

                            objRecord.commitLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    /* var journalentrySearchObj = search.create({
                         type: "journalentry",
                         filters: [
                             ["type", "anyof", "Journal"],
                             "AND",
                             [
                                 ["memo", "contains", "void of check"], "OR", ["memo", "contains", "Void Of Customer"], "OR", ["memo", "contains", "void of bill pay"]
                             ],
                             "AND",
                             ["account", "anyof", account],
                             "AND",
                             ["trandate", "within", statementStartDateT, statementEndDateT]
                         ],
                         columns: [
                             search.createColumn({
                                 name: "internalid",
                                 label: "Internal ID"
                             }),
                             search.createColumn({
                                 name: "custbody_dabankstatementamount",
                                 label: "Bank Statement Amount"
                             }),
                             search.createColumn({
                                 name: "recordtype",
                                 label: "Record Type"
                             })
                         ]
                     });
                     var searchResultCount = journalentrySearchObj.runPaged().count;
                     log.debug("journalentrySearchObj result count", searchResultCount);
                     journalentrySearchObj.run().each(function(result) {
                         var documentNo = result.id;
                         var amount = Number(result.getValue('custbody_dabankstatementamount')).toFixed(3);
                         objRecord.selectNewLine({
                             sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                         });
                         objRecord.setCurrentSublistValue({
                             sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                             fieldId: 'custrecord_da__inflow_tran_record_type',
                             value: result.getValue('recordtype')
                         });
                         objRecord.setCurrentSublistValue({
                             sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                             fieldId: 'custrecord__documentnumberoutflow',
                             value: documentNo,
                             ignoreFieldChange: false,
                             forceSyncSourcing: true
                         });
                         objRecord.setCurrentSublistValue({
                             sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                             fieldId: 'custrecord__amount3decimalinflow',
                             value: -(amount)
                         });
                         objRecord.commitLine({
                             sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                         });
                         return true;
                     });
                     */

                    ////////////////////////////////////////////////////////////

                    try {
                        var bankloanpaymentSearch = search.create({
                            type: 'customtransaction_da_loan_settlement',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account],
                                "and",
                                ["subsidiary", "anyof", subsidiaryId]
                            ]

                        });
                        log.debug('bank loanpayment Search count', bankloanpaymentSearch.runPaged().count);
                        bankloanpaymentSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    //////////////////////////////////////////////

                    try {
                        var bankloanInterestPaymentSearch = search.create({
                            type: 'customtransaction_da_loan_interest_payme',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account],
                                "and",
                                ["subsidiary", "anyof", subsidiaryId]
                            ]

                        });
                        log.debug('loan Interest Payment Search count', bankloanInterestPaymentSearch.runPaged().count);
                        bankloanInterestPaymentSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    /////////////////////////////////////////////

                    try {
                        var BondInterestPaymentSearch = search.create({
                            type: 'customtransaction_da_bond_interest_payme',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account],
                                "and",
                                ["subsidiary", "anyof", subsidiaryId]
                            ]

                        });
                        log.debug('Bond Interest Payment Search count', BondInterestPaymentSearch.runPaged().count);
                        BondInterestPaymentSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    /////////////////////////////////////////////

                    try {
                        var CallOptionSearch = search.create({
                            type: 'customtransaction_da_call_option',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account],
                                "and",
                                ["subsidiary", "anyof", subsidiaryId]
                            ]

                        });
                        log.debug('CallOptionSearch Search count', CallOptionSearch.runPaged().count);
                        CallOptionSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    ////////////////////////////////////////////

                    try {
                        var LoanIssuanceSearch = search.create({
                            type: 'customtransaction_da_loan_issuance',
                            columns: [
                                search.createColumn({
                                    name: "custbody_dabankstatementamount",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Debit Amount"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Credit Amount"
                                })
                            ],
                            filters: [
                                ["custbody_dabankstatementamount", "ISNOTEMPTY", ""],
                                "and",
                                ["trandate", "within", statementStartDateT, statementEndDateT],
                                "and",
                                ["account", "anyof", account],
                                "and",
                                ["subsidiary", "anyof", subsidiaryId]
                            ]

                        });
                        log.debug('Loan Issuance Search count', LoanIssuanceSearch.runPaged().count);
                        LoanIssuanceSearch.run().each(function(result) {
                            var recordId = result.id;
                            log.debug('recordId', recordId);
                            var bankStatementAmt = result.getValue('custbody_dabankstatementamount');
                            log.debug('bankStatementAmt', bankStatementAmt);
                            var debitAmt = result.getValue('debitamount');
                            log.debug('debitAmt', debitAmt);
                            var creditAmt = result.getValue('creditamount');
                            log.debug('creditAmt', creditAmt);
                            if (debitAmt > 0) {

                                if (bankStatementAmt < 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord_da__inflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: false
                                });
                                log.debug(recordId, bankStatementAmt);
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow',
                                    fieldId: 'custrecord__amount3decimalinflow',
                                    value: bankStatementAmt,
                                    ignoreFieldChange: true
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareinflow'
                                });
                            }

                            if (creditAmt > 0) {
                                if (bankStatementAmt > 0) {
                                    bankStatementAmt = -(bankStatementAmt);
                                }
                                objRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_documentnumberoutflow',
                                    value: recordId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_da_outflow_tran_record_type',
                                    value: result.getValue('recordtype')
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: (bankStatementAmt)
                                });
                                objRecord.commitLine({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                                });
                            }
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }



                    //////////////////////////////////////////

                    try {
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["formulatext: {recordType}", "contains", "customtransaction_dabanktransfer"],
                                "AND",
                                ["custbody_da_bank_account", "anyof", account], "AND", ["custbody_reconciled", "is", "F"],
                                "AND",
                                ["mainline", "is", "T"], "AND",
                                ["trandate", "within", statementStartDateT, statementEndDateT]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custbody_da_total_3_decimal",
                                    label: "Bank Statement Amount"
                                }),
                                search.createColumn({
                                    name: "currency",
                                    label: "Currency"
                                }),
                                search.createColumn({
                                    name: "exchangerate",
                                    label: "Exchange Rate"
                                }),
                                search.createColumn({
                                    name: "recordtype",
                                    label: "Record Type"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    label: "Document Number"
                                }),
                            ]


                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var documentNo = result.id;
                            var bankTransCurrency = result.getValue('currency');
                            log.debug('bankTransCurrency', bankTransCurrency);
                            var amount3Decimal = result.getValue('custbody_da_total_3_decimal');
                            log.debug('amount3Decimal', amount3Decimal);
                            var exchangerateAmt = result.getValue('exchangerate');
                            log.debug('exchangerateAmt', exchangerateAmt);
                            objRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                            });
                            var amount = Number(result.getValue('custbody_da_total_3_decimal')).toFixed(3);
                            log.debug('amount', amount);
                            var exchangerateAmt = parseFloat(amount) * parseFloat(exchangerateAmt);
                            log.debug('exchangerateAmt', exchangerateAmt);

                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                fieldId: 'custrecord_documentnumberoutflow',
                                value: documentNo,
                                ignoreFieldChange: false,
                                forceSyncSourcing: false
                            });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                fieldId: 'custrecord_da_outflow_tran_record_type',
                                value: result.getValue('recordtype')
                            });
                            if (currency == bankTransCurrency) {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: -(amount)
                                });
                            } else {
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow',
                                    fieldId: 'custrecord_amount3decimaloutflow',
                                    value: -(exchangerateAmt).toFixed(3)
                                });
                            }

                            objRecord.commitLine({
                                sublistId: 'recmachcustrecord_reconcilebankstatpareoutflow'
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    try {
                        if (scriptContext.Type != "create") {
                            var transactionSearchObj = search.create({
                                type: "transaction",
                                filters: [
                                    ["type", "anyof", "Custom" + bankChargesRecID, "Custom" + bankInterestRecID],
                                    "AND",
                                    ["custbody_da_bank_account", "anyof", account],
                                    "AND",
                                    ["account", "anyof", account],
                                    "AND",
                                    ["custbody_createdfrombankstatement", "anyof", scriptContext.newRecord.id],
                                    "AND",
                                    ["custbody_reconciled", "is", "F"],
                                    "AND",
                                    ["trandate", "within", statementStartDateT, statementEndDateT]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custbody_dabankstatementamount",
                                        label: "Total 3 Decimal"
                                    }),
                                    search.createColumn({
                                        name: "type",
                                        label: "Type"
                                    })
                                ]
                            });
                            var searchResultCount = transactionSearchObj.runPaged().count;
                            log.debug("transactionSearchObj result count", searchResultCount);
                            transactionSearchObj.run().each(function(result) {
                                var type = result.getText('type');
                                log.debug(type);
                                if (type == "Bank Charges") {
                                    objRecord.selectNewLine({
                                        sublistId: 'recmachcustrecord_reconcilebankcharge'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankcharge',
                                        fieldId: 'custrecord_documentnumberbankchar',
                                        value: result.id,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_reconcilebankcharge',
                                        fieldId: 'custrecord_amount3decimalbankcharge',
                                        value: -(Number(result.getValue('custbody_dabankstatementamount')).toFixed(3)),
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'recmachcustrecord_reconcilebankcharge'
                                    });
                                    log.debug("setting, charge");
                                }
                                if (type == "Other Deposits") {
                                    log.debug("setting, charge");
                                    objRecord.selectNewLine({
                                        sublistId: 'recmachcustrecord_custrecord_reconcilebankinter'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
                                        fieldId: 'custrecord_documentnumberbankinterest',
                                        value: result.id,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_custrecord_reconcilebankinter',
                                        fieldId: 'custrecord_amount3decimalbankinterest',
                                        value: (Number(result.getValue('custbody_dabankstatementamount')).toFixed(3)),
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'recmachcustrecord_custrecord_reconcilebankinter'
                                    });
                                }
                                return true;
                            });
                        }
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }


                    objRecord.save();

                    try {
                        var customrecord_bankstatementoutflowtranSearchObj = search.create({
                            type: "customrecord_bankstatementoutflowtran",
                            filters: [
                                ["custrecord_reconcilebankstatpareoutflow", "anyof", scriptContext.newRecord.id],
                                "AND",
                                ["custrecord_reconcilecheckoutflow", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_documentnumberoutflow",
                                    label: "Document Number"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_outflow_tran_record_type",
                                    label: "Transaction Type"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_bankstatementoutflowtranSearchObj.runPaged().count;
                        log.debug("customrecord_bankstatementoutflowtranSearchObj result count", searchResultCount);
                        customrecord_bankstatementoutflowtranSearchObj.run().each(function(result) {

                            var tranId = result.getValue('custrecord_documentnumberoutflow');
                            var type = result.getValue('custrecord_da_outflow_tran_record_type');
                            log.debug('type', type);
                            record.submitFields({
                                type: type,
                                id: tranId,
                                values: {
                                    'custbody_reconciled': true
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }

                    try {
                        var customrecord_bankstatementinflowtransSearchObj = search.create({
                            type: "customrecord_bankstatementinflowtrans",
                            filters: [
                                ["custrecord_reconcilebankstatpareinflow", "anyof", scriptContext.newRecord.id],
                                "AND",
                                ["custrecord_reconcilecheckinflow", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord__documentnumberoutflow",
                                    label: "Document Number"
                                }),
                                search.createColumn({
                                    name: "custrecord_da__inflow_tran_record_type",
                                    label: "Transaction Type"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_bankstatementinflowtransSearchObj.runPaged().count;
                        log.debug("customrecord_bankstatementinflowtransSearchObj result count", searchResultCount);
                        customrecord_bankstatementinflowtransSearchObj.run().each(function(result) {
                            var tranId = result.getValue('custrecord__documentnumberoutflow');
                            var type = result.getValue('custrecord_da__inflow_tran_record_type');
                            log.debug('type', type);
                            record.submitFields({
                                type: type,
                                id: tranId,
                                values: {
                                    'custbody_reconciled': true
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                            return true;
                        });
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }


            }

            return {
                beforeLoad: beforeLoad,
                beforeSubmit: beforeSubmit,
                afterSubmit: afterSubmit
            };

        });