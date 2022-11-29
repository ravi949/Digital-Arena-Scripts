/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record'],

    function(message, serverWidget, search, runtime, record) {

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
            try {} catch (ex) {
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
            try {} catch (ex) {
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

                var invNosArray = [];
                var lotInvNosArray = [];
                var lotInventoryobj = {};
                var recId = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                

                var salesOrderrec = record.load({
                    type: type,
                    id: recId,
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
                        fieldId: 'inventorylocation',
                        line: i
                    });
                   // log.debug('location', location);

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

                       // log.debug('quantity', quantity);
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
                            log.debug('lotItemSearch count', count);
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
                                                log.debug('invNumber', invNumber);
                                                log.audit('Arrrrr', lotInvNosArray);
                                                log.audit('lennnnn', lotInvNosArray.length);
                                                if (lotInvNosArray.length == 0) {
                                                    lotInventoryobj.invNumber1 = invNumber;
                                                    lotInventoryobj.availQty1 = availQty;
                                                    lotInvNosArray.push(lotInventoryobj);
                                                    log.debug('lotInvNosArray', lotInvNosArray);
                                                } else {
                                                    for (var j = 0; j < lotInvNosArray.length; j++) {
                                                        var objInvNo = lotInvNosArray[j];
                                                        log.debug('objInvNo', objInvNo);
                                                        for (var key in objInvNo) {
                                                            if (objInvNo.hasOwnProperty(key)) {
                                                               // log.error('key', key);
                                                                log.error('invNumber', invNumber );
                                                               log.error('key value', objInvNo[key]); 
                                                                log.error('check', invNumber == objInvNo[key]);
                                                               // log.error('check2', key == 'invNumber1');

                                                               
                                                                    if (invNumber == objInvNo[key]) {
                                                                        var availQtyy = lotInvNosArray[j].availQty1;
                                                                        availQty = availQtyy;
                                                                        if(availQtyy <= 0){
                                                                            return true;
                                                                        }
                                                                    }

                                                                if(key == 'invNumber1'){
                                                                    if (invNumber == objInvNo[key]) {                                                                       

                                                                    } else {
                                                                        //lotInventoryobj[j].invNumber1 = invNumber;
                                                                       // lotInventoryobj[j].availQty1 = availQty;
                                                                      // lotInvNosArray.push({"invNumber1": invNumber, "availQty1": availQty});
                                                                        log.debug('else lotInvNosArray', lotInvNosArray);
                                                                    }
                                                                }                                                                
                                                            }
                                                        }
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
                                                        log.debug('invNumber', invNumber);
                                                        for (var j = 0; j < lotInvNosArray.length; j++) {
                                                            var objInvNo = lotInvNosArray[j];
                                                            log.debug('objInvNo', objInvNo);
                                                            for (var key in objInvNo) {
                                                                if (objInvNo.hasOwnProperty(key)) {
                                                                    log.debug('key value', objInvNo[key]);
                                                                    if (invNumber == objInvNo[key]) {
                                                                        lotInvNosArray[j].availQty1 = parseFloat(lotInvNosArray[j].availQty1) - parseFloat(availQty);
                                                                    }
                                                                }
                                                            }
                                                        }
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
                                                    if (availQty) {
                                                        remQty = parseInt(remQty) + parseInt(availQty);
                                                        //log.debug(remQty);
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
                                                            for (var j = 0; j < lotInvNosArray.length; j++) {
                                                                var objInvNo = lotInvNosArray[j];
                                                                log.debug('objInvNo', objInvNo);
                                                                for (var key in objInvNo) {
                                                                    if (objInvNo.hasOwnProperty(key)) {
                                                                        log.debug('key value', objInvNo[key]);
                                                                        if (invNumber == objInvNo[key]) {
                                                                            lotInvNosArray[j].availQty1 = parseFloat(lotInvNosArray[j].availQty1) - parseFloat(remQty);
                                                                        }
                                                                    }
                                                                }
                                                            }

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

                                                if(remQty != 0){
                                                    return true;
                                                }
                                                
                                            });
                                        }
                                        log.debug('(remQty);',remQty);
                                        salesOrderrec.commitLine({
                                            sublistId: 'item'
                                        });
                                    }

                                }
                            }

                        } else if (lookup.isserialitem == true) {
                            log.debug('serialItem');
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
                            log.debug('serialItemSearch count', serialCount);
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
                                        log.debug('subrec', subrec);

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

                                                    log.debug('invNosArray', invNosArray);
                                                    log.debug('invNumber', invNumber);
                                                    log.debug('check', invNosArray.indexOf(invNumber));

                                                    if (invNosArray.indexOf(invNumber) == -1) {
                                                        log.debug('true');
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
                                                        log.debug('setinvNosArray', invNosArray);
                                                        subrec.setCurrentSublistValue({
                                                            sublistId: 'inventoryassignment',
                                                            fieldId: 'quantity',
                                                            value: availQty
                                                        });
                                                        subrec.commitLine({
                                                            sublistId: 'inventoryassignment'
                                                        });

                                                        quantity = quantity - availQty;
                                                        log.debug(quantity);
                                                    }


                                                }
                                            }
                                            return true;
                                        });
                                    }
                                    salesOrderrec.commitLine({
                                        sublistId: 'item'
                                    });

                                }


                            }
                        }



                    } else {
                        log.debug('inventoryDetailSet', inventoryDetailSet);
                        var subrec = scriptContext.newRecord.getSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                            line: i
                        });
                        var salesOrderSubrec = record.load({
                            type: 'inventorydetail',
                            id: inventoryDetailSet
                        });
                        var Lines = salesOrderSubrec.getLineCount({
                            sublistId: 'inventoryassignment'
                        });
                        log.debug('Lines', Lines);
                        for (var j = 0; j < Lines; j++) {
                            var serialInvNo = salesOrderSubrec.getSublistText({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                line: j
                            });
                            log.debug('serialInvNo', serialInvNo);
                            invNosArray.push(serialInvNo);
                            log.debug('invNosArray', invNosArray);
                        }
                    }
                }
                var recordId = salesOrderrec.save();
                log.debug('recordId', recordId);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }


        }


        return {
            beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });