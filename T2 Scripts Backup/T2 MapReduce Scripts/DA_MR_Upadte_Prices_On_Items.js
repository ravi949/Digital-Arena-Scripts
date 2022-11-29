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
                var recId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_rec_id"
                });
                log.debug('recId', recId);
                if (recId) {
                    return search.create({
                        type: "customrecord_da_price_allocation_schedul",
                        filters: [
                            ["custrecord_da_price_allocation_parent", "anyof", recId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "internalid"
                            }),
                            search.createColumn({
                                name: "custrecord_da_brand_child",
                                label: "Class"
                            }),
                            search.createColumn({
                                name: "custrecord_da_brand_items",
                                label: "Items"
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
                log.debug('values', values);
                var recordID = values.internalid.value;
                //log.debug('subjectId', subjectId);
                context.write({
                    key: recordID,
                    value: recordID
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
                var recordID = JSON.parse(context.key);
                log.debug('recordID', recordID);
                var childRec = record.load({
                    type: 'customrecord_da_price_allocation_schedul',
                    id: recordID
                });
              log.debug('Child record',childRec);

                var parntRecId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_mr_rec_id"
                });
                var parentRec = record.load({
                    type:'customrecord_da_pricing_allocation',
                    id: parntRecId
                });
                var currency = parentRec.getValue('custrecord_da_pricing_currency');
                var priceLevelID = parentRec.getValue('custrecord_da_price_list');
                var markUp = parentRec.getValue('custrecord_da_markup_check');
                var percent = parentRec.getValue('custrecord_da_markup_discount');
               var flatRate = parentRec.getValue('custrecord_da_pricing_all_flat_rate');
                log.debug('flatrate', flatRate);
              
                var brandItems = childRec.getValue('custrecord_da_brand_items');
               log.debug('Items', brandItems);
              var NumberofItems= childRec.getLineCount('Items');
              log.debug('LineCount',NumberofItems);
               
             var a= brandItems.length;
              log.debug('length', a);
              
                if (brandItems.length > 0) {
                    for (var i = 0; i < brandItems.length; i++) {
                        var itemId = brandItems[i];
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["internalid", "anyof", itemId]
                            ],
                            columns: ['type']
                        });
                        itemSearchObj.run().each(function(result) {
                            var itemType = result.getValue('type');
                            if (itemType == "InvtPart") {
                                itemType = "inventoryitem"
                            }
                            if (itemType == "NonInvtPart") {
                                itemType = "noninventoryitem"
                            }
                            if (itemType == "OthCharge") {
                                itemType = "otherchargeitem"
                            }
                            if (itemType == "Discount") {
                                itemType = "discountitem"
                            }
                            if (itemType == "Assembly") {
                                itemType = "assemblyitem"
                            }
                            if (itemType == "GiftCert") {
                                itemType = "giftcertificateitem"
                            }

                            var itemRec = record.load({
                                type: itemType,
                                id: result.id,
                                isDynamic: false
                            });
                            var baseprice =  itemRec.getSublistValue({
                                sublistId: 'price'+currency,
                                fieldId: 'price_1_',
                                line: 0
                            });
                            log.debug('baseprice', baseprice);
                            if(baseprice){
                                log.debug('currency', currency);
                              var sublistId = 'price'+currency;
                              log.debug('sublistId',typeof sublistId);
                                var lineCount = itemRec.getLineCount({
                                    sublistId: sublistId.toString()
                                });
                                log.debug('lineCount', lineCount +"str price"+currency);
                                for(var i = 0; i < lineCount ; i++){
                                    var pricelevel = itemRec.getSublistValue({
                                        sublistId: 'price'+currency,
                                        fieldId: 'pricelevel',
                                        line: i
                                    });
                                    log.debug('pricelevel', pricelevel);
                                    if(pricelevel == priceLevelID){
                                        log.debug('true');
                                      if(percent){
                                        if(markUp){
                                            var value = ((percent/100) * baseprice).toFixed(3);
                                            value = parseFloat(baseprice) + parseFloat(value);
                                        }else{
                                            var value = ((percent/100) * baseprice).toFixed(3);
                                            value = parseFloat(baseprice) - parseFloat(value);
                                        }
                                      }
                                      
                                      if(flatRate){
                                        value = flatRate;
                                      }
                                        
                                        itemRec.setSublistValue({
                                            sublistId: 'price'+currency,
                                            fieldId: 'price_1_',
                                            line: i,
                                            value: value
                                        });
                                    }
                                }
                            }

                            itemRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            
                            
                        });
                    }
                }

               /* var subBrandItem = childRec.getValue('custrecord_da_pricing_items_child');

                if (subBrandItem.length > 0) {
                    for (var i = 0; i < subBrandItem.length; i++) {
                        var itemId = subBrandItem[i];
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["internalid", "anyof", itemId]
                            ],
                            columns: ['type']
                        });
                        itemSearchObj.run().each(function(result) {
                            var itemType = result.getValue('type');
                            if (itemType == "InvtPart") {
                                itemType = "inventoryitem"
                            }
                            if (itemType == "NonInvtPart") {
                                itemType = "noninventoryitem"
                            }
                            if (itemType == "OthCharge") {
                                itemType = "otherchargeitem"
                            }
                            if (itemType == "Discount") {
                                itemType = "discountitem"
                            }
                            if (itemType == "Assembly") {
                                itemType = "assemblyitem"
                            }
                            if (itemType == "GiftCert") {
                                itemType = "giftcertificateitem"
                            }

                            var itemRec = record.load({
                                type: itemType,
                                id: result.id,
                                isDynamic: false
                            });
                            var baseprice =  itemRec.getSublistValue({
                                sublistId: 'price'+currency,
                                fieldId: 'price_1_',
                                line: 0
                            });
                            log.debug('baseprice', baseprice);
                            if(baseprice){
                                log.debug('currency', currency);
                              var sublistId = 'price'+currency;
                              log.debug('sublistId',typeof sublistId);
                                var lineCount = itemRec.getLineCount({
                                    sublistId: sublistId.toString()
                                });
                                log.debug('lineCount', lineCount +"str price"+currency);
                                for(var i = 0; i < lineCount ; i++){
                                    var pricelevel = itemRec.getSublistValue({
                                        sublistId: 'price'+currency,
                                        fieldId: 'pricelevel',
                                        line: i
                                    });
                                    log.debug('pricelevel', pricelevel);
                                    if(pricelevel == priceLevelID){
                                        log.debug('true');
                                      if(percent){
                                        
                                        if(markUp){
                                            var value = ((percent/100) * baseprice).toFixed(3);
                                            value = parseFloat(baseprice) + parseFloat(value);
                                        }else{
                                            var value = ((percent/100) * baseprice).toFixed(3);
                                            value = parseFloat(baseprice) - parseFloat(value);
                                        }
                                      }
                                      
                                       if(flatRate){
                                        value = flatRate;
                                      }
                                        itemRec.setSublistValue({
                                            sublistId: 'price'+currency,
                                            fieldId: 'price_1_',
                                            line: i,
                                            value: value
                                        });
                                    }
                                }
                            }

                            itemRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            
                            
                        });
                    }
                }*/

             if(brandItems.length == 0) {
                    var brand = childRec.getValue('custrecord_da_brand_child');
                    var itemSearchObj = search.create({
                        type: "item",
                        filters: [
                            ["type", "anyof", "Discount", "Description", "InvtPart", "Group", "Kit", "Service"],
                            "AND",
                            ["cseg_da_brand", "anyof", brand]
                        ],
                        columns: [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "displayname",
                                label: "Display Name"
                            }),
                            search.createColumn({
                                name: "salesdescription",
                                label: "Description"
                            }),
                            search.createColumn({
                                name: "type",
                                label: "Type"
                            }),
                            search.createColumn({
                                name: "baseprice",
                                label: "Base Price"
                            }),
                            search.createColumn({
                                name: "custitem_da_item_name_ar",
                                label: "Item Arabic Description"
                            }),
                            search.createColumn({
                                name: "custitemitem_brand",
                                label: "Brand"
                            })
                        ]
                    });
                    
                    var searchResultCount = itemSearchObj.runPaged().count;
                    log.debug("itemSearchObj result count", searchResultCount);
                    itemSearchObj.run().each(function(result) {
                        var itemType = result.getValue('type');
                        log.debug('itemType', itemType);
                        if (itemType == "InvtPart") {
                            itemType = "inventoryitem"
                        }
                        if (itemType == "NonInvtPart") {
                            itemType = "noninventoryitem"
                        }
                        if (itemType == "OthCharge") {
                            itemType = "otherchargeitem"
                        }
                        if (itemType == "Discount") {
                            itemType = "discountitem"
                        }
                        if (itemType == "Assembly") {
                            itemType = "assemblyitem"
                        }
                        if (itemType == "GiftCert") {
                            itemType = "giftcertificateitem"
                        };
                        var itemRec = record.load({
                                type: itemType,
                                id: result.id,
                                isDynamic: false
                            });
                            var baseprice =  itemRec.getSublistValue({
                                sublistId: 'price'+currency,
                                fieldId: 'price_1_',
                                line: 0
                            });
                            log.debug('baseprice', baseprice);
                            if(baseprice){
                                log.debug('currency', currency);
                              var sublistId = 'price'+currency;
                              log.debug('sublistId',typeof sublistId);
                                var lineCount = itemRec.getLineCount({
                                    sublistId: sublistId.toString()
                                });
                                log.debug('lineCount', lineCount +"str price"+currency);
                                for(var i = 0; i < lineCount ; i++){
                                    var pricelevel = itemRec.getSublistValue({
                                        sublistId: 'price'+currency,
                                        fieldId: 'pricelevel',
                                        line: i
                                    });
                                    log.debug('pricelevel', pricelevel);
                                    if(pricelevel == priceLevelID){
                                        log.debug('true');
                                      if(percent){
                                          if(markUp){
                                              var value = ((percent/100) * baseprice).toFixed(3);
                                              value = parseFloat(baseprice) + parseFloat(value);
                                          }else{
                                              var value = ((percent/100) * baseprice).toFixed(3);
                                              value = parseFloat(baseprice) - parseFloat(value);
                                          }
                                      }
                                      if(flatRate){
                                        value = flatRate;
                                      }
                                        itemRec.setSublistValue({
                                            sublistId: 'price'+currency,
                                            fieldId: 'price_1_',
                                            line: i,
                                            value: value
                                        });
                                    }
                                }
                            }

                            itemRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                        return true;
                    });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function calculateNoOfDays(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }

        function getDates(startDate, endDate) {
            var dates = [],
                currentDate = startDate,
                addDays = function(days) {
                    var date = new Date(this.valueOf());
                    date.setDate(date.getDate() + days);
                    return date;
                };
            while (currentDate <= endDate) {
                dates.push(currentDate);
                currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        };

        function getWeekDays(dDate1, dDate2, a) {
            if (dDate1 > dDate2) return false;
            var date = dDate1;
            var dates = [];
            while (date < dDate2) {
                // log.debug(a.indexOf(date.getDay()));
                if (a.indexOf(date.getDay()) != -1) dates.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
            return dates;
        }
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