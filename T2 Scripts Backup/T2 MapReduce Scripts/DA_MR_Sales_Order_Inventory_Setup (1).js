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
                    name: 'custscript_da_so_rec_id1'
                });
                var recordType = scriptObj.getParameter({
                    name: 'custscript_da_so_rec_type1'
                });
                // log.debug('recordId', recordId);
                record.submitFields({
                  type :'salesorder',
                  id : recordId,
                  values :{
                    'custbody_da_inventory_detail_set': true
                  }
                })
                var salesOrderrec = record.load({
                    type: recordType,
                    id: recordId,
                    isDynamic: true
                });


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
                    var availbleqty = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityavailable',
                        line: i
                    });
                    var location = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    });
                     log.debug('location', location);

                    var inventoryDetailSet = salesOrderrec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });

                    if (!inventoryDetailSet) {
                        var lookup = search.lookupFields({
                            type: 'item',
                            id: item,
                            columns: ['islotitem', 'isserialitem']
                        });

                        // log.debug('lookup', lookup);

                        log.debug('quantity', quantity);
                        //log.debug('availbleqty', availbleqty);

                        if (lookup.islotitem == true) {
                            // log.debug('lotItem');
                            var lotItemSearch = search.create({
                                type: 'item',
                                filters: [
                                    ["internalid", "anyof", item],
                                    "AND",
                                    ["inventorynumber.location", "anyof", location],
                                    "AND",
                                    ["inventorynumber.isonhand", "is", true],
                                    "AND",
                                    ["inventorynumber.quantityavailable", "greaterthan", 0]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "expirationdate",
                                        join: 'inventorynumber',
                                        sort: search.Sort.ASC,
                                        label: "Expiration Date"
                                    }),
                                    search.createColumn({
                                        name: "inventorynumber",
                                        join: 'inventorynumber',
                                        label: "Inventory Number"
                                    }),
                                    search.createColumn({
                                        name: "quantityavailable",
                                        join: 'inventorynumber',
                                        label: "availQty"
                                    })
                                ]
                            });
                            var count = lotItemSearch.runPaged().count;
                           // log.debug('lotItemSearch count', count);
                            var remQty;
                            if (quantity > 0) {
                                // log.debug('quantity lotItem', quantity);
                                if (count > 0) {
                                    if (availbleqty > 0) {
                                        salesOrderrec.selectLine({
                                            sublistId: 'item',
                                            line: i
                                        });
                                        var subrec = salesOrderrec.getCurrentSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail'
                                        });
                                        // log.debug('subrec', subrec);
                                        var Lines = subrec.getLineCount({
                                            sublistId: 'inventoryassignment'
                                        });
                                        // log.debug('Lines', Lines);
                                        var remQty = quantity;
                                        //log.debug('remQty', remQty);
                                        if (remQty != 0) {
                                            lotItemSearch.run().each(function(result) {
                                                var expDate = result.getValue({
                                                    "name": "expirationdate",
                                                    join: 'inventorynumber'
                                                });
                                                var availQty = result.getValue({
                                                    "name": "quantityavailable",
                                                    join: 'inventorynumber'
                                                });
                                                //log.debug('availQty', availQty);

                                                var invNumber = result.getValue({
                                                    "name": "inventorynumber",
                                                    join: 'inventorynumber'
                                                });
                                              //  log.debug('invNumber', invNumber);
                                             //   log.audit('Arrrrr', lotInvNosArray);
                                             //   log.audit('lennnnn', lotInvNosArray.length);
                                                if (lotInvNosArray.length == 0) {
                                                    lotInventoryobj.invNumber1 = invNumber;
                                                    lotInventoryobj.availQty1 = availQty;
                                                    lotInvNosArray.push(lotInventoryobj);
                                                   // log.debug('lotInvNosArray', lotInvNosArray);
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
                                                                    } j = lotInvNosArray.length;
                                                                } else{
                                                                        index1 = -1;
                                                                    }
                                                    } if(index1 == '-1') {
                                                                        //lotInventoryobj[j].invNumber1 = invNumber;
                                                                        // lotInventoryobj[j].availQty1 = availQty;
                                                                         lotInvNosArray.push({"invNumber1": invNumber, "availQty1": availQty});
                                                                        //log.debug('else lotInvNosArray', lotInvNosArray);
                                                                }
                                                    
                                                }

                                                remQty = remQty - availQty;
                                                // log.debug('remQty', remQty);
                                                if (remQty > 0) {
                                                    if (availQty > 0) {
                                                        subrec.selectNewLine({
                                                            sublistId: 'inventoryassignment'
                                                        });

                                                        if (invNumber) {
                                                            subrec.setCurrentSublistValue({
                                                                sublistId: 'inventoryassignment',
                                                                fieldId: 'receiptinventorynumber',
                                                                value: invNumber
                                                            });
                                                        }
                                                      //  log.debug('invNumber', invNumber);

                                                        var index;
                                                       // log.debug('lotInvNosArray',lotInvNosArray);
                                                       for (var i = 0; i < lotInvNosArray.length; i++) {
                                                                var objInvNo = lotInvNosArray[i];
                                                              //  log.debug('objInvNo', objInvNo);
                                                                if(objInvNo.invNumber1 == invNumber){
                                                                    index = i;
                                                                  //  log.debug('index',index);
                                                                }
                                                                }
                                                                if(index >= 0){
                                                                    lotInvNosArray[index].availQty1 = parseFloat(lotInvNosArray[index].availQty1) - parseFloat(availQty);
                                                                   // log.debug(lotInvNosArray[index].availQty1);
                                                                
                                                            }
                                                               // log.debug('lotInvNosArray',lotInvNosArray);
                                                        /*for (var k = 0; k < lotInvNosArray.length; k++) {
                                                            var objInvNo = lotInvNosArray[k];
                                                           // log.debug('objInvNo', objInvNo);
                                                            for (var key in objInvNo) {
                                                                if (objInvNo.hasOwnProperty(key)) {
                                                                   // log.debug('key value', objInvNo[key]);
                                                                    if (invNumber == objInvNo[key]) {
                                                                        lotInvNosArray[k].availQty1 = parseFloat(lotInvNosArray[k].availQty1) - parseFloat(availQty);
                                                                    }
                                                                }
                                                            }
                                                        }*/
                                                        subrec.setCurrentSublistValue({
                                                            sublistId: 'inventoryassignment',
                                                            fieldId: 'quantity',
                                                            value: availQty
                                                        });
                                                        subrec.commitLine({
                                                            sublistId: 'inventoryassignment'
                                                        });
                                                    }
                                                } else {
                                                    if (availQty > 0) {
                                                        remQty = parseInt(remQty) + parseInt(availQty);
                                                        log.debug(remQty);
                                                        if (remQty > 0) {
                                                            subrec.selectNewLine({
                                                                sublistId: 'inventoryassignment'
                                                            });
                                                            if (invNumber) {
                                                                subrec.setCurrentSublistValue({
                                                                    sublistId: 'inventoryassignment',
                                                                    fieldId: 'receiptinventorynumber',
                                                                    value: invNumber
                                                                });
                                                            }
                                                       // log.debug('invNumber', invNumber);

                                                             var index;
                                                           //  log.debug('lotInvNosArray',lotInvNosArray);
                                                            for (var i = 0; i < lotInvNosArray.length; i++) {
                                                                var objInvNo = lotInvNosArray[i];
                                                             //   log.debug('objInvNo', objInvNo);
                                                             //   log.debug(objInvNo.invNumber1);
                                                                if(objInvNo.invNumber1 == invNumber){
                                                                    index = i;
                                                                  //  log.debug('index',index);
                                                                }
                                                            }
                                                                if(index >= 0){
                                                                    lotInvNosArray[index].availQty1 = parseFloat(lotInvNosArray[index].availQty1) - parseFloat(remQty);
                                                                   // log.debug(lotInvNosArray[index].availQty1);
                                                                }

                                                               // log.debug('lotInvNosArray',lotInvNosArray);
                                                           /* for (var l = 0; l < lotInvNosArray.length; l++) {
                                                                var objInvNo = lotInvNosArray[l];
                                                              //  log.debug('objInvNo', objInvNo);
                                                                for (var key in objInvNo) {
                                                                    if (objInvNo.hasOwnProperty(key)) {
                                                                      //  log.debug('key value', objInvNo[key]);
                                                                        if (invNumber == objInvNo[key]) {
                                                                            lotInvNosArray[l].availQty1 = parseFloat(lotInvNosArray[l].availQty1) - parseFloat(remQty);
                                                                        }
                                                                    }
                                                                }
                                                            }*/

                                                            subrec.setCurrentSublistValue({
                                                                sublistId: 'inventoryassignment',
                                                                fieldId: 'quantity',
                                                                value: remQty
                                                            });
                                                            subrec.commitLine({
                                                                sublistId: 'inventoryassignment'
                                                            });
                                                        }
                                                    }
                                                    remQty = 0;

                                                }

                                                if (remQty != 0) {
                                                    return true;
                                                }

                                            });
                                        }
                                       // log.debug('(remQty);', remQty);
                                      try{
                                        salesOrderrec.commitLine({
                                            sublistId: 'item'
                                        });
                                        lotInvNosArray = [];
                                      }catch(ex){
                                        
                                      }
                                    }

                                }
                            }
                           // log.debug('lotInvNosArray final',lotInvNosArray);

                        } else if (lookup.isserialitem == true) {
                            // log.debug('serialItem');
                            var serialItemSearch = search.create({
                                type: 'item',
                                filters: [
                                    ["internalid", "anyof", item],
                                    "AND",
                                    ["inventorynumber.location", "anyof", location],
                                    "AND",
                                    ["inventorynumber.isonhand", "is", true],
                                    "AND",
                                    ["quantitycommitted", "is", 0]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "inventorynumber",
                                        join: 'inventorynumber',
                                        label: "Inventory Number"
                                    }),
                                    search.createColumn({
                                        name: "quantityavailable",
                                        join: 'inventorynumber',
                                        label: "availQty"
                                    })
                                ]
                            });
                            var serialCount = serialItemSearch.runPaged().count
                            // log.debug('serialItemSearch count', serialCount);
                            if (serialCount > 0) {
                                if (quantity > 0) {
                                    if (availbleqty > 0) {
                                        var lineNum = salesOrderrec.selectLine({
                                            sublistId: 'item',
                                            line: i
                                        });
                                        var subrec = salesOrderrec.getCurrentSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail',
                                        });
                                        //  log.debug('subrec', subrec);

                                        serialItemSearch.run().each(function(result) {
                                            var availQty = result.getValue({
                                                "name": "quantityavailable",
                                                join: 'inventorynumber'
                                            });
                                            var invNumber = result.getValue({
                                                "name": "inventorynumber",
                                                join: 'inventorynumber'
                                            });

                                            if (availQty > 0) {
                                                if (quantity >= availQty) {

                                                    //   log.debug('invNosArray', invNosArray);
                                                    //   log.debug('invNumber', invNumber);
                                                    //  log.debug('check', invNosArray.indexOf(invNumber));

                                                    if (invNosArray.indexOf(invNumber) == -1) {
                                                        //  log.debug('true');
                                                        subrec.selectNewLine({
                                                            sublistId: 'inventoryassignment'
                                                        });

                                                        if (invNumber) {
                                                            subrec.setCurrentSublistValue({
                                                                sublistId: 'inventoryassignment',
                                                                fieldId: 'receiptinventorynumber',
                                                                value: invNumber
                                                            });
                                                        }
                                                        invNosArray.push(invNumber);
                                                        // log.debug('setinvNosArray', invNosArray);
                                                        subrec.setCurrentSublistValue({
                                                            sublistId: 'inventoryassignment',
                                                            fieldId: 'quantity',
                                                            value: availQty
                                                        });
                                                        subrec.commitLine({
                                                            sublistId: 'inventoryassignment'
                                                        });

                                                        quantity = quantity - availQty;
                                                        //   log.debug(quantity);
                                                    }


                                                }
                                            }
                                            return true;
                                        });
                                    }
                                    salesOrderrec.commitLine({
                                        sublistId: 'item'
                                    });
                                    invNosArray = [];

                                }


                            }
                        }



                    } else {
                        log.debug('inventoryDetailSet', inventoryDetailSet);
                        /* var subrec = scriptContext.newRecord.getSublistSubrecord({
                             sublistId: 'item',
                             fieldId: 'inventorydetail',
                             line: i
                         });*/
                        var salesOrderSubrec = record.load({
                            type: 'inventorydetail',
                            id: inventoryDetailSet
                        });
                        var Lines = salesOrderSubrec.getLineCount({
                            sublistId: 'inventoryassignment'
                        });
                        // log.debug('Lines', Lines);
                        for (var j = 0; j < Lines; j++) {
                            var serialInvNo = salesOrderSubrec.getSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                line: j
                            });
                            //   log.debug('serialInvNo', serialInvNo);
                            invNosArray.push(serialInvNo);
                            //  log.debug('invNosArray', invNosArray);
                        }
                    }
                }
             salesOrderrec.setValue('custbody_da_inventory_detail_set', false);
                var recordId = salesOrderrec.save({
                  enableSourcing : false,
                  ignoreMandatoryFields : true
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