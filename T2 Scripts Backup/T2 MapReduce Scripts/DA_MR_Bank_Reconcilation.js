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
                var total = 0;
                var scriptObjPeriod = runtime.getCurrentScript();
                var recordId = scriptObjPeriod.getParameter({
                    name: 'custscript_da_mr_record_id'
                });
                log.debug('recordId', recordId);
                var customrecord_bankstatementoutflowtranSearchObj = search.create({
                    type: "customrecord_bankstatementoutflowtran",
                    filters: [
                        ["custrecord_reconcilebankstatpareoutflow", "anyof", recordId],
                        //  "AND",
                        //  ["custrecord_reconcilecheckoutflow", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_documentnumberoutflow",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "custrecord_amount3decimaloutflow",
                            label: "Amount"
                        }),
                        search.createColumn({
                            name: "custrecord_da_outflow_tran_record_type",
                            label: "Transaction Type"
                        }),
                        search.createColumn({
                            name: "custrecord_transactiontypeoutflow",
                            label: "Transaction Type1"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankstatementoutflowtranSearchObj.runPaged().count;
                log.debug("customrecord_bankstatementoutflowtranSearchObj result count", searchResultCount);
                customrecord_bankstatementoutflowtranSearchObj.run().each(function(result) {

                    var tranId = result.getValue('custrecord_documentnumberoutflow');
                    var type = result.getValue('custrecord_da_outflow_tran_record_type');
                    var amount = result.getValue('custrecord_amount3decimaloutflow');
                    total = parseFloat(amount) + parseFloat(total);
                    log.debug('type', type);
                    log.debug('amount', amount);
                    log.debug('total', total);
                    log.debug('tranId', tranId);

                    var tType = result.getText('custrecord_transactiontypeoutflow');
                    log.debug('tType', tType);
                    if (tType == "Journal") {
                        record.submitFields({
                            type: "journalentry",
                            id: tranId,
                            values: {
                                'custbody_reconciled': true
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    } else {


                        if (type == "Other Deposit" || type == "Bank Charges") {

                            if (type == "Other Deposit") {
                                record.submitFields({
                                    type: "customtransaction_bank_interests",
                                    id: tranId,
                                    values: {
                                        'custbody_reconciled': true
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                            if (type == "Bank Charges") {
                                record.submitFields({
                                    type: "customtransaction_bankcharges",
                                    id: tranId,
                                    values: {
                                        'custbody_reconciled': true
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }

                        } else {
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
                            log.debug('search');
                        }
                    }

                    return true;
                });
                log.debug('search1');
                var customrecord_bankstatementinflowtransSearchObj = search.create({
                    type: "customrecord_bankstatementinflowtrans",
                    filters: [
                        ["custrecord_reconcilebankstatpareinflow", "anyof", recordId],
                        //  "AND",
                        //  ["custrecord_reconcilecheckinflow", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord__documentnumberoutflow",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "custrecord__amount3decimalinflow",
                            label: "Amount"
                        }),
                        search.createColumn({
                            name: "custrecord_da__inflow_tran_record_type",
                            label: "Transaction Type"
                        }),
                        search.createColumn({
                            name: "custrecord_transactiontypeinflow",
                            label: "Record Type"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankstatementinflowtransSearchObj.runPaged().count;
                log.debug("customrecord_bankstatementinflowtransSearchObj result count", searchResultCount);
                customrecord_bankstatementinflowtransSearchObj.run().each(function(result) {
                    var tranId = result.getValue('custrecord__documentnumberoutflow');
                    var type = result.getValue('custrecord_da__inflow_tran_record_type');

                    log.debug('tranId', tranId);
                    log.debug('type', type);
                    var amount = result.getValue('custrecord__amount3decimalinflow');
                    log.debug('amount', amount);
                    total = parseFloat(amount) + parseFloat(total);
                    log.debug('total', total);
                    var tType = result.getText('custrecord_transactiontypeinflow');
                    log.debug('tType', tType);

                    if (tType == "Journal") {
                        record.submitFields({
                            type: "journalentry",
                            id: tranId,
                            values: {
                                'custbody_reconciled': true
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    } else {


                        if (type == "Other Deposit" || type == "Bank Charges") {

                            if (type == "Other Deposit") {
                                record.submitFields({
                                    type: "customtransaction_bank_interests",
                                    id: tranId,
                                    values: {
                                        'custbody_reconciled': true
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                            if (type == "Bank Charges") {
                                record.submitFields({
                                    type: "customtransaction_bankcharges",
                                    id: tranId,
                                    values: {
                                        'custbody_reconciled': true
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }

                        } else {
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
                        }
                    }
                    return true;

                });

                log.debug('search2');


                var customrecord_bankchargesSearchObj = search.create({
                    type: "customrecord_bankcharges",
                    filters: [
                        // ["custrecord_reconbankcharge", "is", "T"],
                        //  "AND",
                        ["custrecord_reconcilebankcharge", "anyof", recordId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_reconbankcharge",
                            label: "Reconcile"
                        }),
                        search.createColumn({
                            name: "custrecord_documentnumberbankchar",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "custrecord_amount3decimalbankcharge",
                            label: "Amount"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankchargesSearchObj.runPaged().count;
                log.debug("customrecord_bankchargesSearchObj result count", searchResultCount);
                customrecord_bankchargesSearchObj.run().each(function(result) {
                    var tranId = result.getValue('custrecord_documentnumberbankchar');
                    var amount = result.getValue('custrecord_amount3decimalbankcharge');
                    total = parseFloat(amount) + parseFloat(total);
                    log.debug('tranId', tranId);
                    log.debug('amount', amount);
                    log.debug('total', total);
                    record.submitFields({
                        type: 'customtransaction_bankcharges',
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

                log.debug('search3');
                var customrecord_bankinterestSearchObj = search.create({
                    type: "customrecord_bankinterest",
                    filters: [
                        // ["custrecord_reconcilebankinter", "is", "T"],
                        // "AND",
                        ["custrecord_custrecord_reconcilebankinter", "anyof", recordId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_reconcilebankinter",
                            label: "Reconcile"
                        }),
                        search.createColumn({
                            name: "custrecord_documentnumberbankinterest",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "custrecord_amount3decimalbankinterest",
                            label: "Amount"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankinterestSearchObj.runPaged().count;
                log.debug("customrecord_bankinterestSearchObj result count", searchResultCount);
                customrecord_bankinterestSearchObj.run().each(function(result) {
                    var tranId = result.getValue('custrecord_documentnumberbankinterest');
                    var amount = result.getValue('custrecord_amount3decimalbankinterest');
                    log.debug('tranId', tranId);
                    total = parseFloat(amount) + parseFloat(total);
                    log.debug('amount', amount);
                    log.debug('total', total);
                    record.submitFields({
                        type: 'customtransaction_bank_interests',
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

                log.debug('search4');
                var bankReconcileRec = record.load({
                    type: 'customrecord_reconcilebankstatement',
                    id: recordId,
                    isDynamic: true
                });
                bankReconcileRec.setValue('custrecord_reconciledthisstatement', Number(total).toFixed(3));
                bankReconcileRec.setValue('custrecord_da_bank_stmnt_reconciled', true);
                var endingBalance = bankReconcileRec.getValue('custrecord_endingstatementbalance');
                log.debug('endingBalance', endingBalance);
                var currentReconciledAmount = total;
                log.debug('currentReconciledAmount', currentReconciledAmount);
                var lastReconciledAmount = bankReconcileRec.getValue('custrecord_lastreconciledbalanceopening');
                log.debug('lastReconciledAmount', lastReconciledAmount);
                var differenceAmount = (parseFloat(currentReconciledAmount) + parseFloat(lastReconciledAmount)) - parseFloat(endingBalance);
                bankReconcileRec.setValue('custrecord_statementdifference', Number(differenceAmount).toFixed(3));
                var bankReconcileRecId = bankReconcileRec.save();
                log.debug('bankReconcileRecId', bankReconcileRecId);
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
                log.debug('process completed');
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