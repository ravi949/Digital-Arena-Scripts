/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],

    function(record, search, runtime, format) {


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
                var invNosArray = [];
                var lotInvNosArray = [];
                var lotInventoryobj = {};
                var scriptObj = runtime.getCurrentScript();
                var recordId = scriptObj.getParameter({
                    name: 'custscript_da_so_rec_id1_2'
                });
                var recordType = scriptObj.getParameter({
                    name: 'custscript_da_so_rec_type1_2'
                });
              log.debug('recordType', recordType);
                record.submitFields({
                    type: recordType,
                    id: recordId,
                    values: {
                        'custbody_da_inventory_detail_set': true
                    }
                })
                var salesOrderrec = record.load({
                    type: recordType,
                    id: recordId,
                    isDynamic: true
                });
                var onHandQtyField = "quantityavailable";
                var locationField = "inventorylocation";
                if(recordType == "invoice"){
                   onHandQtyField = "quantityavailable";
                    locationField = "inventorylocation";
                }

                if(recordType == "itemfulfillment"){
                   onHandQtyField = "onhand";
                    locationField = "location";
                }


                var numLines = salesOrderrec.getLineCount({
                    sublistId: 'item'
                });
                //log.debug('numLines', numLines);
                for (var i = 0; i < numLines; i++) {
                    var item = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    log.debug('item', item);
                    var quantity = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    var availbleqty = quantity;
                  /*salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: onHandQtyField,
                        line: i
                    });*/
                    var location = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: locationField,
                        line: i
                    });
                   log.debug('location', location);
                    if(!location){
                      location = salesOrderrec.getValue('location');
                    }
                   log.debug('location', location);

                    var inventoryDetailSet = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_lot_created',
                        line: i
                    });

                    if (!inventoryDetailSet) {
                        var isLot = salesOrderrec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_tran_item_lot',
                            line: i
                        });

                        // log.debug('lookup', lookup);

                        log.debug('quantity', quantity);
                        //log.debug('availbleqty', availbleqty);

                        if (isLot == true) {
                            // log.debug('lotItem');
                            var customrecord_da_trans_inventory_detailSearchObj = search.create({
                                type: "customrecord_da_trans_inventory_detail",
                                filters: [
                                    ["isinactive", "is", "F"],
                                    "AND",                                   
                                    ["custrecord_da_trans_inv_detail_location", "anyof", location],
                                    "AND",
                                    ["custrecord_da__trans_inv_detail_item", "anyof", item]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da__trans_inv_detail_item",
                                        summary: "GROUP",
                                        label: "Item"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_trans_inv_detail_location",
                                        summary: "GROUP",
                                        label: "Location"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_trans_inv_detail_bin",
                                        summary: "GROUP",
                                        label: "Bin"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_trans_inv_detail_number",
                                        summary: "GROUP",
                                        label: "Lot Number"
                                    }),
                                    search.createColumn({
                                        name: "internalid",
                                        join: "CUSTRECORD_DA_TRANS_INV_DETAIL_NUMBER",
                                        summary: "GROUP",
                                        label: "Lot Id"
                                    }),
                                    search.createColumn({
                                        name: "formulanumeric",
                                        summary: "SUM",
                                        formula: "CASE WHEN {custrecord_da_inventory_detail_trans} like '%Invoice%' THEN {custrecord_da_trans_inv_detail_quantity} * -1   WHEN {custrecord_da_inventory_detail_trans} like '%Item Fulfillment%' THEN {custrecord_da_trans_inv_detail_quantity} * -1   WHEN {custrecord_da_inventory_detail_trans} like '%Bill Credit%' THEN {custrecord_da_trans_inv_detail_quantity} * -1 ELSE {custrecord_da_trans_inv_detail_quantity} end",
                                        label: "Formula (Numeric)"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_trans_inv_detail_expiry",
                                        summary: "GROUP",
                                        sort: search.Sort.ASC,
                                        label: "Expiry Date"
                                    })
                                ]
                            });
                            var count = customrecord_da_trans_inventory_detailSearchObj.runPaged().count;
                            log.debug("customrecord_da_trans_inventory_detailSearchObj result count", count);

                            var remQty;
                            if (quantity > 0) {
                                // log.debug('quantity lotItem', quantity);
                                if (count > 0) {
                                    if (availbleqty > 0) {

                                        salesOrderrec.selectLine({
                                            sublistId: 'item',
                                            line: i
                                        });

                                        var remQty = quantity;
                                        //log.debug('remQty', remQty);
                                        if (remQty != 0) {
                                            customrecord_da_trans_inventory_detailSearchObj.run().each(function(result) {
                                                var expDate = result.getValue({
                                                    "name": "custrecord_da_trans_inv_detail_expiry",
                                                    summary: search.Summary.GROUP
                                                });
                                                log.debug('expDate');
                                                var availQty = result.getValue({
                                                    "name": "formulanumeric",
                                                    summary: search.Summary.SUM
                                                });
                                              if(availQty > 0){
                                              
                                                //log.debug('availQty', availQty);

                                                var invNumber = result.getValue({
                                                    "name": "custrecord_da_trans_inv_detail_number",
                                                    summary: search.Summary.GROUP
                                                });
                                                log.debug('invNumber', invNumber);
                                                //   log.audit('Arrrrr', lotInvNosArray);
                                                //   log.audit('lennnnn', lotInvNosArray.length);
                                                if (lotInvNosArray.length == 0) {
                                                    lotInventoryobj.invNumber1 = invNumber;
                                                    lotInventoryobj.availQty1 = availQty;
                                                    lotInvNosArray.push(lotInventoryobj);
                                                    log.debug('lotInvNosArray', lotInvNosArray);
                                                } else {
                                                    var index1;
                                                    for (var j = 0; j < lotInvNosArray.length; j++) {
                                                        var objInvNo = lotInvNosArray[j];
                                                        log.debug('objInvNo', objInvNo);
                                                        log.debug('invNumber', invNumber);
                                                        log.debug('check', invNumber == objInvNo.invNumber1);
                                                        if (invNumber == objInvNo.invNumber1) {
                                                            index1 = j;
                                                            var availQtyy = objInvNo.availQty1;
                                                            log.debug('availQtyy', availQtyy);
                                                            availQty = availQtyy;
                                                            if (availQtyy <= 0) {
                                                                return true;
                                                            }
                                                            j = lotInvNosArray.length;
                                                        } else {
                                                            index1 = -1;
                                                        }
                                                    }
                                                    if (index1 == '-1') {
                                                        //lotInventoryobj[j].invNumber1 = invNumber;
                                                        // lotInventoryobj[j].availQty1 = availQty;
                                                        lotInvNosArray.push({
                                                            "invNumber1": invNumber,
                                                            "availQty1": availQty
                                                        });
                                                        log.debug('else lotInvNosArray', lotInvNosArray);
                                                    }

                                                }

                                                remQty = remQty - availQty;
                                                // log.debug('remQty', remQty);
                                                if (remQty > 0) {
                                                    if (availQty > 0) {

                                                        var customLotRec = record.create({
                                                            type: 'customrecord_da_trans_inventory_detail'
                                                        });
                                                        customLotRec.setValue('custrecord_da__trans_inv_detail_item', item);
                                                        customLotRec.setValue('custrecord_da_trans_inv_detail_location', location);
                                                        if (invNumber) {
                                                            customLotRec.setValue('custrecord_da_trans_inv_detail_number', invNumber);
                                                        }

                                                        var index;
                                                        log.debug('lotInvNosArray1', lotInvNosArray);
                                                        for (var i = 0; i < lotInvNosArray.length; i++) {
                                                            var objInvNo = lotInvNosArray[i];
                                                            //  log.debug('objInvNo', objInvNo);
                                                            if (objInvNo.invNumber1 == invNumber) {
                                                                index = i;
                                                                //  log.debug('index',index);
                                                            }
                                                        }
                                                        if (index >= 0) {
                                                            lotInvNosArray[index].availQty1 = parseFloat(lotInvNosArray[index].availQty1) - parseFloat(availQty);
                                                            log.debug(lotInvNosArray[index].availQty1);

                                                        }
                                                        customLotRec.setValue('custrecord_da_trans_inv_detail_quantity', availQty);
                                                        customLotRec.setValue('custrecord_da_inventory_detail_trans', recordId);
                                                        customLotRec.save();
                                                    }
                                                } else {
                                                    if (availQty > 0) {
                                                        remQty = parseInt(remQty) + parseInt(availQty);
                                                        log.debug(remQty);
                                                        if (remQty > 0) {
                                                            var customLotRec = record.create({
                                                                type: 'customrecord_da_trans_inventory_detail'
                                                            });
                                                            customLotRec.setValue('custrecord_da__trans_inv_detail_item', item);
                                                            customLotRec.setValue('custrecord_da_trans_inv_detail_location', location);
                                                            if (invNumber) {
                                                                customLotRec.setValue('custrecord_da_trans_inv_detail_number', invNumber);
                                                            }


                                                            var index;
                                                            log.debug('lotInvNosArray2', lotInvNosArray);
                                                            for (var i = 0; i < lotInvNosArray.length; i++) {
                                                                var objInvNo = lotInvNosArray[i];
                                                                //   log.debug('objInvNo', objInvNo);
                                                                //   log.debug(objInvNo.invNumber1);
                                                                if (objInvNo.invNumber1 == invNumber) {
                                                                    index = i;
                                                                    //  log.debug('index',index);
                                                                }
                                                            }
                                                            if (index >= 0) {
                                                                lotInvNosArray[index].availQty1 = parseFloat(lotInvNosArray[index].availQty1) - parseFloat(remQty);
                                                                log.debug(lotInvNosArray[index].availQty1);
                                                            }

                                                            customLotRec.setValue('custrecord_da_trans_inv_detail_quantity', remQty);
                                                            customLotRec.setValue('custrecord_da_inventory_detail_trans', recordId);
                                                            customLotRec.save();

                                                        }
                                                    }
                                                    remQty = 0;

                                                }
                                            }

                                                if (remQty != 0) {
                                                    return true;
                                                }

                                            });
                                        }
                                        // log.debug('(remQty);', remQty);
                                        try {
                                            salesOrderrec.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'custcol_da_lot_created',
                                                line: i,
                                                value: true
                                            });
                                            salesOrderrec.commitLine({
                                                sublistId: 'item'
                                            });
                                            //lotInvNosArray = [];
                                        } catch (ex) {

                                        }
                                    }

                                }
                            }
                            log.debug('lotInvNosArray final', lotInvNosArray);
                        }

                    }
                }
                salesOrderrec.setValue('custbody_da_inventory_detail_set', false);
                var recordId = salesOrderrec.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug('recordId', recordId);
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
            try {} catch (ex) {
                log.error(ex.name, ex.message);

            }
        }
        // example usage
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                log.debug("Process Completed");
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