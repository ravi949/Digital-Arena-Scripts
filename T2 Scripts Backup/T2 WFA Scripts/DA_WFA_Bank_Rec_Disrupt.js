/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],

    function(search, record) {

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
                var recId = scriptContext.newRecord.id;

                var customrecord_bankstatementoutflowtranSearchObj = search.create({
                    type: "customrecord_bankstatementoutflowtran",
                    filters: [
                        ["custrecord_reconcilebankstatpareoutflow", "anyof", scriptContext.newRecord.id]
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
                            'custbody_reconciled': false
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    return true;
                });

                var customrecord_bankstatementinflowtransSearchObj = search.create({
                    type: "customrecord_bankstatementinflowtrans",
                    filters: [
                        ["custrecord_reconcilebankstatpareinflow", "anyof", scriptContext.newRecord.id]
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
                            'custbody_reconciled': false
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    return true;
                });


                var customrecord_bankchargesSearchObj = search.create({
                    type: "customrecord_bankcharges",
                    filters: [
                        
                        ["custrecord_reconcilebankcharge", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_reconbankcharge",
                            label: "Reconcile"
                        }),
                        search.createColumn({
                            name: "custrecord_documentnumberbankchar",
                            label: "Document Number"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankchargesSearchObj.runPaged().count;
                log.debug("customrecord_bankchargesSearchObj result count", searchResultCount);
                customrecord_bankchargesSearchObj.run().each(function(result) {
                    var tranId = result.getValue('custrecord_documentnumberbankchar');
                    log.debug('type', type);
                    record.submitFields({
                        type: 'customtransaction_bankcharges',
                        id: tranId,
                        values: {
                            'custbody_reconciled': false
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    return true;
                });

                var customrecord_bankinterestSearchObj = search.create({
                    type: "customrecord_bankinterest",
                    filters: [                  
                        ["custrecord_custrecord_reconcilebankinter", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_reconcilebankinter",
                            label: "Reconcile"
                        }),
                        search.createColumn({
                            name: "custrecord_documentnumberbankinterest",
                            label: "Document Number"
                        })
                    ]
                });
                var searchResultCount = customrecord_bankinterestSearchObj.runPaged().count;
                log.debug("customrecord_bankinterestSearchObj result count", searchResultCount);
                customrecord_bankinterestSearchObj.run().each(function(result) {
                    var tranId = result.getValue('custrecord_documentnumberbankchar');
                    log.debug('type', type);
                    record.submitFields({
                        type: 'customtransaction_bank_interests',
                        id: tranId,
                        values: {
                            'custbody_reconciled': false
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
        }

        return {
            onAction: onAction
        };

    });