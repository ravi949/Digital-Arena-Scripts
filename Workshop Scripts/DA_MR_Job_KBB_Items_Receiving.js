/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/email', 'N/format'],
    function(search, record, runtime, email, format) {
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
                    name: "custscript_receive_record_id"
                });
                log.debug('recId', recId);
              
               var recieving = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_script_kbb_receiving"
                });
                var issuing = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_script_kbb_issuing"
                });
                var appleinvoice = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_apple_sales_order"
                });
                log.debug('appleinvoice', appleinvoice);
                var laborCostinvoice = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_labor_cost_sales_order"
                });
                log.debug('laborCostinvoice', laborCostinvoice);
                var settingsRec = record.load({
                    type: 'customrecord_da_maintenance_settings',
                    id: 1
                })
                var inveAdjustAccount = settingsRec.getValue('custrecord_inventory_adjustment_account');
                var adjustLocation = settingsRec.getValue('custrecord_da_kbb_location');

                //creating labor cost sales order
                //
                if(recieving){
                    var currentRecord1 = record.load({
                        type: 'customrecord_da_receive_kbb',
                        id: recId
                    });
                    var memo = currentRecord1.getValue('custrecord_da_kbb_memo');
                    var customrecord_da_pending_receiving_kbbSearchObj = search.create({
                        type: "customrecord_da_pending_receiving_kbb2",
                        filters: [
                            ["custrecord_da_kbb_transfer_order_ref", "anyof", recId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_kbb_item",
                                label: "Item"
                            }),
                           
                            search.createColumn({
                                name: "custrecord_da_kbb_serialized",
                                label: "Serialized"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_spare_parts_ref",
                                label: "Spare part Ref"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_warranty_status",
                                label: "warranty status"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_outof_warranty_price",
                                label: "out of warranty Price"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_in_warranty_price",
                                label: "In warranty Price"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_actual_price",
                                label: "Actual Price"
                            }),
                            search.createColumn({
                                name: "custrecord_da_kbb_job_card",
                                label: "Job Card"
                            }),
                           search.createColumn({
                                name: "custrecord_da_ref_record_kbb",
                                label: "ref record"
                            }),
                        ]
                    });

                        //inv  adjustment create 
                        var inventoryAdjRec = record.create({
                            type: 'inventoryadjustment',
                            isDynamic: true
                        });
                        inventoryAdjRec.setValue('account', inveAdjustAccount);
                        inventoryAdjRec.setValue('adjlocation', adjustLocation);
                        inventoryAdjRec.setValue('custrecord_da_kbb_memo', memo);
                        inventoryAdjRec.setValue('custbody_da_receive_kbb_ref', recId);
                        customrecord_da_pending_receiving_kbbSearchObj.run().each(function(result) {
                            inventoryAdjRec.selectNewLine({
                                sublistId: 'inventory'
                            });
                            inventoryAdjRec.setCurrentSublistValue({
                                sublistId: 'inventory',
                                fieldId: 'item',
                                value: result.getValue('custrecord_da_kbb_item'),
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            inventoryAdjRec.setCurrentSublistValue({
                                sublistId: 'inventory',
                                fieldId: 'adjustqtyby',
                                value: 1
                            });
                            inventoryAdjRec.setCurrentSublistValue({
                                sublistId: 'inventory',
                                fieldId: 'location',
                                value: adjustLocation
                            });
                            
                           
                            var serialized = result.getValue('custrecord_da_kbb_serialized');
                            if (serialized) {
                              
                                var subrec = inventoryAdjRec.getCurrentSublistSubrecord({
                                    sublistId: 'inventory',
                                    fieldId: 'inventorydetail'
                                });
                                subrec.selectNewLine({
                                    sublistId: 'inventoryassignment'
                                });
                                //log.debug('serialid',result.getValue('custrecord_da_transfer_serial_no_kgb'));
                                subrec.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: serialNo
                                  
                                  
                                });
                                subrec.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: 1
                                });
                                subrec.commitLine({
                                    sublistId: 'inventoryassignment'
                                });
                            }
                           inventoryAdjRec.setCurrentSublistValue({
                                sublistId: 'inventory',
                                fieldId: 'custcol_da_trans_job_card_ref',
                                value: result.getValue('custrecord_da_kbb_job_card')
                            });

                            record.submitFields({
                                type: 'customrecord_da_pending_receiving_kbb',
                                id: result.getValue('custrecord_da_ref_record_kbb'),
                                values: {
                                    'custrecord_da_kbb_issued': true,
                                     'custrecord_da_issue_kbb_ref': 1
                                }
                            });


                            inventoryAdjRec.commitLine({
                                sublistId: 'inventory'
                            });
                            return true;
                        });
                      var invadjustmentId =   inventoryAdjRec.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        });
                   record.submitFields({
                    type: 'customrecord_da_receive_kbb',
                    id: recId,
                    values: {
                        'custrecord_da_received_kbb2': true,
                        'custrecord_da_receiving_kbb2': false,
                      'custrecord_da_kbb_inv_adjustment_ref': invadjustmentId
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
            }

                    if (issuing) {
                        var currentRecord1 = record.load({
                        type: 'customrecord_da_issue_kbb',
                        id: recId
                    });
                    var memo = currentRecord1.getValue('custrecord_da_issue_kbb_memo');

                        var customrecord_da_pending_receiving_kbbSearchObj = search.create({
                            type: "customrecord_da_issue_kbb_items",
                            filters: [
                                ["custrecord_da_issue_kbb_ref","anyof",recId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_item",
                                    label: "Item"
                                }),
                                
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_serialized",
                                    label: "Serialized"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_spare_parts_ref",
                                    label: "Spare part Ref"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_warranty_status",
                                    label: "warranty status"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_outof_warranty",
                                    label: "out of warranty Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_inwarranty_price",
                                    label: "In warranty Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_actual_price",
                                    label: "Actual Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_issue_kbb_job_card",
                                    label: "Job Card"
                                }),
                                 search.createColumn({
                                    name: "custrecord_da_reference_rec",
                                    label: "Ref Record"
                                }),
                            ]
                        });


                        var settingsRec = record.load({
                            type: 'customrecord_da_maintenance_settings',
                            id: 1
                        });
                        var appleCustomerId = settingsRec.getValue('custrecord_da_apple_customer');
                        var soDays = settingsRec.getValue('custrecord_da_jc_so_days');
                        var jobCardDate = new Date();
                        var endDate = new Date();
                        endDate.setDate(endDate.getDate() + soDays);
                        log.debug('jobCardDate', jobCardDate);
                        log.debug('endDate', endDate);
                        var parsedDateStringAsRawDateObject = format.parse({
                            value: jobCardDate,
                            type: format.Type.DATE
                        });
                        log.debug('parsedDateStringAsRawDateObject', parsedDateStringAsRawDateObject);
                        var formattedDateString = format.format({
                            value: parsedDateStringAsRawDateObject,
                            type: format.Type.DATE
                        });
                        log.debug('formattedDateString', formattedDateString);
                       /* var invoiceSearchObj = search.create({
                            type: "invoice",
                            filters: [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["trandate", "onorbefore", formattedDateString],
                                "AND",
                                ["custbody_jc_end_date", "onorafter", formattedDateString],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["name", "anyof", appleCustomerId],
                                "AND",
                                ["custbody_da_apple_sales_order_type", "anyof", 2]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "trandate",
                                    label: "Date"
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
                                })
                            ]
                        });
                        var searchResultCount = invoiceSearchObj.runPaged().count;
                        log.debug("invoiceSearchObj result count", searchResultCount);
                         if (searchResultCount > 0) {
                            invoiceSearchObj.run().each(function(result) {
                                soID = result.id;
                                return true;
                            });
                        }*/
                        var soID;
                        if (soID == 1) {
                            var soRec = record.load({
                                type: "invoice",
                                id: soID,
                                isDynamic: true
                            });
                        } else {
                            var soRec = record.create({
                                type: "invoice",
                                isDynamic: true
                            });
                            soRec.setValue('entity', appleCustomerId);
                            soRec.setValue('custbody_jc_end_date', endDate);
                           soRec.setValue('custbody2', memo);
                            soRec.setValue('department', 10);
                            soRec.setValue('class', 3);
                          soRec.setValue('location', 30);
                            soRec.setValue('custbody_da_apple_sales_order_type', 2);
                           soRec.setValue('custbody_da_issue_kbb_ref', recId);
                        }
                        var customrecord_da_pending_receiving_labor_cost_SearchObj = search.create({
                            type: "customrecord_da_issue_kbb_items",
                            filters: [
                                ["custrecord_da_issue_kbb_ref","anyof",recId]                               
                            ],
                            columns: [
                                  search.createColumn({
                                     name: "custrecord_da_issue_kbb_job_card",
                                     summary: "GROUP",
                                     label: "Job Card"
                                  }),
                                  search.createColumn({
                                     name: "custrecord_da_jc_labor_cost",
                                     join: "CUSTRECORD_DA_ISSUE_SPARE_PARTS_REF",
                                     summary: "SUM",
                                     label: "Labor Cost"
                                  })
                            ]
                        });
                        customrecord_da_pending_receiving_labor_cost_SearchObj.run().each(function(result) {
                            var amount = result.getValue({
                                name: 'custrecord_da_jc_labor_cost',
                                join: 'CUSTRECORD_DA_ISSUE_SPARE_PARTS_REF',
                                summary: search.Summary.SUM
                            });
                            if(amount > 0){
                            var jobCardID = result.getValue({
                                name: 'custrecord_da_issue_kbb_job_card',
                                summary: search.Summary.GROUP
                            });
                            log.debug('jobCardID', jobCardID);
                            soRec.selectNewLine({
                                sublistId: 'item'
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: 21281,
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: 1,
                                ignoreFieldChange: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_da_trans_job_card_ref',
                                value: jobCardID,
                                ignoreFieldChange: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: amount,
                                ignoreFieldChange: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                value: amount,
                                ignoreFieldChange: true
                            });
                           soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: 30,
                                ignoreFieldChange: true
                            });
                            soRec.commitLine('item');
                        }
                            // total = parseFloat(total) + parseFloat(amount);
                            return true;
                        });
                      try{
                        var laborCostInvId = soRec.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        });
                        log.debug('laborCostInvId', laborCostInvId);
                      }catch(ex){
                        log.error(ex.name,ex.message);
                      }

                    /*  var invoiceSearchObj = search.create({
                            type: "invoice",
                            filters: [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["trandate", "onorbefore", formattedDateString],
                                "AND",
                                ["custbody_jc_end_date", "onorafter", formattedDateString],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["name", "anyof", appleCustomerId],
                                "AND",
                                ["custbody_da_apple_sales_order_type", "anyof", 1]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "trandate",
                                    label: "Date"
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
                                })
                            ]
                        });
                        var searchResultCount = invoiceSearchObj.runPaged().count;
                        log.debug("invoiceSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            invoiceSearchObj.run().each(function(result) {
                                soID1 = result.id;
                                return true;
                            });
                        }*/
                        var soID1;

                        if (soID1 == 1) {
                            var soRec = record.load({
                                type: "invoice",
                                id: soID1,
                                isDynamic: true
                            });
                        } else {
                            var soRec = record.create({
                                type: "invoice",
                                isDynamic: true
                            });
                            soRec.setValue('entity', appleCustomerId);
                            soRec.setValue('custbody_jc_end_date', endDate);
                            soRec.setValue('custbody2', memo);
                            soRec.setValue('department', 10);
                            soRec.setValue('class', 3);
                          soRec.setValue('location', 30);
                            soRec.setValue('custbody_da_apple_sales_order_type', 1);
                             soRec.setValue('custbody_da_issue_kbb_ref', recId);
                        }
                        customrecord_da_pending_receiving_kbbSearchObj.run().each(function(result) {
                           
                            var serialized = result.getValue('custrecord_da_issue_kbb_serialized');
                            if (serialized) {
                                var itemSearchObj = search.create({
                                    type: "item",
                                    filters: [
                                  
                                        ["pricing.pricelevel", "anyof", "1"]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            join: "inventoryNumber",
                                            label: "Internal ID"
                                        })
                                    ]
                                });
                                var searchResultCount = itemSearchObj.runPaged().count;
                                log.debug("itemSearchObj result count", searchResultCount);
                                var serialId;
                                itemSearchObj.run().each(function(result) {
                                    serialId = result.getValue({
                                        name: 'internalid',
                                        join: 'inventoryNumber'
                                    });
                                    return true;
                                });
                            }
                            soRec.selectNewLine({
                                sublistId: 'item'
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: result.getValue('custrecord_da_issue_kbb_item'),
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: adjustLocation,
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: 1,
                                ignoreFieldChange: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_da_trans_job_card_ref',
                                value: result.getValue('custrecord_da_issue_kbb_job_card'),
                                ignoreFieldChange: true
                            });
                          soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: 30,
                                ignoreFieldChange: true
                            });
                            
                            var warrantyStatus = result.getValue('custrecord_da_issue_kbb_warranty_status');
                            if (warrantyStatus == 1) { // inwarrnaty
                                var price = result.getValue('custrecord_da_issue_kbb_inwarranty_price');
                            }
                            if (warrantyStatus == 2) {
                                var price = result.getValue('custrecord_da_issue_kbb_outof_warranty');
                            }
                            if (!price) {
                                price = result.getValue('custrecord_da_issue_kbb_actual_price');
                            }
                          if(price < 0){
                            price = 0;
                          }
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: price,
                                ignoreFieldChange: true
                            });
                            soRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                value: price,
                                ignoreFieldChange: true
                            });
                            log.debug(serialNo);
                          if (serialNo) {
                                soRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kbb_serial_no',
                                    value: serialNo,
                                    ignoreFieldChange: true
                                });
                          }
                            if (serialized) {
                                soRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kbb_serial_no',
                                    value: serialNo,
                                    ignoreFieldChange: true
                                });
                                var subrec = soRec.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                                });
                                log.debug('subrec', subrec);
                                var a = subrec.selectNewLine({
                                    sublistId: 'inventoryassignment'
                                });
                                log.debug('a', a);
                                subrec.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'issueinventorynumber',
                                    value: serialId,
                                });
                                subrec.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: 1
                                });
                                subrec.commitLine({
                                    sublistId: 'inventoryassignment'
                                });
                            }
                            soRec.commitLine('item');
                           record.submitFields({
                                type: 'customrecord_da_pending_receiving_kbb',
                                id: result.getValue('custrecord_da_reference_rec'),
                                values: {
                                    'isinactive': true
                                },
                            });
                           record.submitFields({
                                type: 'customrecord_da_job_card_spare_parts',
                                id: result.getValue('custrecord_da_issue_spare_parts_ref'),
                                
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                            return true;
                        });
                      try{
                        var itemsInvId = soRec.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        });
                        log.debug('itemsInvId', itemsInvId);
                      }catch(ex){
                        log.error(ex.name,ex.message);
                      }
                       record.submitFields({
                    type: 'customrecord_da_issue_kbb',
                    id: recId,
                    values: {
                        'custrecord_da_kbb_issuing_to_apple': false,
                        'custrecord_da_kbb_labor_cost_invoice':laborCostInvId,
                       'custrecord_da_issue_kbb_apple_invoice': itemsInvId
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
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
            try {} catch (ex) {
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
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function summarize(context) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            getInputData: getInputData,
            //map: map,
            //reduce: reduce,
            //summarize: summarize
        };
    });