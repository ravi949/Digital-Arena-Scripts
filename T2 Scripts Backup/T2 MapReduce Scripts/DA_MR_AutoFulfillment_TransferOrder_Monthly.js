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
             return search.create({
               type: "customrecord_da_transfer_to_settings",
               filters:
               [
                  ["custrecord_da_transfer_to_parent.custrecord_da_schedule","anyof","1"]
               ],
               columns:
               [
                  search.createColumn({name: "custrecord_da_transfer_to_subsidiary", label: "Subsidiary"}),
                  search.createColumn({name: "custrecord_da_transfer_to_location", label: "To Location"}),
                  search.createColumn({
                     name: "custrecord_da_class",
                     join: "CUSTRECORD_DA_TRANSFER_TO_PARENT",
                     label: "Class"
                  }),
                  search.createColumn({
                     name: "custrecord_da_from_location",
                     join: "CUSTRECORD_DA_TRANSFER_TO_PARENT",
                     label: "Warehouse Location"
                  }),
                  search.createColumn({
                     name: "custrecord_da_from_subsidiary",
                     join: "CUSTRECORD_DA_TRANSFER_TO_PARENT",
                     label: "Warehouse Subsidiary"
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
               var searchResult = JSON.parse(context.value);
              
              var values = searchResult.values;
             // log.debug('map',searchResult.values);
              var subsidiaryId = searchResult.values.custrecord_da_transfer_to_subsidiary.value;
             // log.debug('subsidiaryId value',subsidiaryId);
              var toLocation = searchResult.values.custrecord_da_transfer_to_location.value;
             // log.debug('toLocation value',toLocation);
              var classId = values["custrecord_da_class.CUSTRECORD_DA_TRANSFER_TO_PARENT"]["value"];
             // log.debug('classId value',classId);             
              var fromLocation = values["custrecord_da_from_location.CUSTRECORD_DA_TRANSFER_TO_PARENT"]["value"];
             // log.debug('fromLocation',fromLocation);

              classId = (classId)? classId: '0';
              
              context.write({
                key :{
                  subsidiaryId : subsidiaryId,
                  toLocation: toLocation,
                  classId: classId,
                  fromLocation: fromLocation
                }
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
              var pgSize = 400;
              var key = JSON.parse(context.key);
             // log.debug('key values', key);
              var subsidiary = JSON.parse(key.subsidiaryId);
             // log.debug('subsidiary', subsidiary);
              var toLocation = JSON.parse(key.toLocation);
             // log.debug('toLocation', toLocation); 
              var classId = JSON.parse(key.classId);
             // log.debug('classId', classId); 
              var fromLocation = JSON.parse(key.fromLocation);
             // log.debug('fromLocation', fromLocation);   
               
                var mySearch = search.create({
                    type: 'item',
                    filters: [
                        ["custitem_da_internal_transfer", "is", true],
                        "AND",
                        ["inventorylocation", "anyof", toLocation], // to location
                        "AND",
                        ["reorderpoint", "greaterthan", "0"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "islotitem",
                            label: "Lotitem"
                        }),
                        search.createColumn({
                            name: "isserialitem",
                            label: "Serialitem"
                        }),
                      search.createColumn({
                        name: "locationquantityavailable",
                        label: "location Qty available"
                    }),
                    search.createColumn({
                        name: "locationreorderpoint",
                        label: "locationreorderpoint"
                    }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "CASE WHEN {locationquantityonorder} is NULL AND {locationquantityavailable} is NULL THEN (({locationpreferredstocklevel} - {locationreorderpoint}) + ({locationreorderpoint}))  WHEN {locationquantityonorder} is NULL THEN (({locationpreferredstocklevel} - {locationreorderpoint}) + ({locationreorderpoint} - {locationquantityavailable})) WHEN {locationquantityavailable} is NULL THEN (({locationpreferredstocklevel} - {locationreorderpoint}) + ({locationreorderpoint}  - {locationquantityonorder})) WHEN {locationquantityavailable} > 0 AND {locationquantityavailable} <= {locationreorderpoint} THEN (({locationpreferredstocklevel} - {locationreorderpoint}) + ({locationreorderpoint} - {locationquantityavailable}) - ({locationquantityonorder}))  ELSE 0 END",
                            label: "Qty To Be Requested"
                        })
                    ]
                });
                if(classId > 0) {
                      var classIdFilters = mySearch.filters;
                      classIdFilters.push(search.createFilter({
                      name: "class",
                      operator: search.Operator.ANYOF,
                      values: classId
                      }));
                    }
                var pagedData = mySearch.runPaged({pa​g​e​S​i​z​e : pgSize});
                //log.debug('pagedData',pagedData);
                var pgcount = pagedData.count;
               // log.debug('pgcount',pgcount);
                var pageCount = Math.ceil(pgcount / pgSize);
               // log.debug('pageCount',pageCount);
                for( var i=0; i < pagedData.pageRanges.length; i++ ) {
                var currentPage = pagedData.fetch(i);
               // log.debug('currentPage',currentPage);
                var transferOrderRec = record.create({
                    type: record.Type.TRANSFER_ORDER,
                    isDynamic: true
                });
                transferOrderRec.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                });
                transferOrderRec.setValue({
                    fieldId: 'orderstatus',
                    value: "A"
                });
                transferOrderRec.setValue({
                    fieldId: 'location',
                    value: fromLocation // from location
                });
                transferOrderRec.setValue({
                    fieldId: 'transferlocation',
                    value: toLocation // to location
                });
                 currentPage.data.forEach(function (result) {
                    var recId = result.id;
                   // log.debug('recId', recId);
                    var reqQty = result.getValue({
                        name: 'formulanumeric'
                    });
                 //   log.debug('reqQty', reqQty);
                    var lotItem = result.getValue({
                        name: 'islotitem'
                    });
                    var serialItem = result.getValue({
                        name: 'isserialitem'
                    });
                   var locQtyAvaiable = result.getValue({
                            name: 'locationquantityavailable'
                        });
                        log.debug('item locQtyAvaiable', locQtyAvaiable);
                        var locreorderPoint = result.getValue({
                            name: 'locationreorderpoint'
                        });
                        log.debug('item locreorderPoint', locreorderPoint);
                if(Number(locQtyAvaiable) <= Number(locreorderPoint)){
                    if (lotItem == true) {
                      //  log.debug('lotItem');
                        var lotItemSearch = search.create({
                            type: 'item',
                            filters: [
                                ["internalid", "anyof", recId],
                                "AND",
                                ["inventorynumber.location", "anyof", fromLocation], // from location
                                "AND",
                                ["inventorynumber.isonhand", "is", true],
                                "AND",
                                ["inventorynumber.quantityavailable", "greaterthan", 0],
                                "AND",
                                ["locationquantityonhand", "greaterthan", 0],
                                "AND",
                                ["inventorylocation", "anyof", fromLocation] //from Location
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
                                }),
                                search.createColumn({
                                    name: "locationquantityavailable",
                                    label: "location Qty available"
                                }),
                                search.createColumn({
                                    name: "locationreorderpoint",
                                    label: "locationreorderpoint"
                                }),
                                    search.createColumn({
                                        name: "locationquantityonhand",
                                        label: "locationquantityonhand"
                                    }),
                                    search.createColumn({
                                        name: "locationquantitycommitted",
                                        label: "locationquantitycommitted"
                                    }),
                                    search.createColumn({
                                        name: "locationquantityintransit",
                                        label: "Location In Transit"
                                    })
                            ]
                        });
                        var count = lotItemSearch.runPaged().count;
                      //  log.debug('lotItemSearch count', count);
                        var remQty;
                        lotItemSearch.run().each(function(result) {
                                var locOnHand = result.getValue("locationquantityonhand");
                                var locCommitted = result.getValue('locationquantitycommitted');
                                var locationInTransit = result.getValue('locationquantityintransit');
                                locCommitted = (locCommitted) ? locCommitted : 0;
                                locOnHand = (locOnHand) ? locOnHand : 0;
                                locationInTransit = (locationInTransit) ? locationInTransit : 0;

                                var qtyToSet = parseFloat(locOnHand) - parseFloat(locCommitted);
                                qtyToSet = parseFloat(qtyToSet) - parseFloat(locationInTransit);
                                if (qtyToSet > 0) {
                                    if (qtyToSet > reqQty) {
                                        return false;
                                    } else {
                                        reqQty = qtyToSet;
                                    }
                                } else {
                                    reqQty = 0;
                                }

                                var locQtyAvaiable = result.getValue({
                                    name: 'locationquantityavailable'
                                });
                                //log.debug('locQtyAvaiable', locQtyAvaiable);
                                var locreorderPoint = result.getValue({
                                    name: 'locationreorderpoint'
                                });
                                //log.debug('locreorderPoint', locreorderPoint);
                                locreorderPoint = (locreorderPoint) ? locreorderPoint : 0;
                                if (Number(locQtyAvaiable) > Number(locreorderPoint)) {
                                    var reqQty1 = parseInt(locQtyAvaiable) - parseInt(locreorderPoint);
                                    //log.debug('reqQty1', reqQty1);
                                    if (reqQty1 < reqQty) {
                                        reqQty = reqQty1;
                                        //log.debug('reqQty', reqQty);
                                    }
                                }
                            });

                        if (reqQty > 0 && count > 0) {
                       //     log.debug('reqQty lotItem', reqQty);
                            transferOrderRec.selectNewLine({
                                sublistId: 'item'
                            });
                            transferOrderRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: recId
                            });
                            transferOrderRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: reqQty
                            });
                            if (count > 0) {
                                var subrec = transferOrderRec.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                                });


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
                                    //log.debug('invNumberlot', invNumber);
                                    var locQtyAvaiable = result.getValue({
                                        name: 'locationquantityavailable'
                                    });
                                    //log.debug('locQtyAvaiable', locQtyAvaiable);
                                    var locreorderPoint = result.getValue({
                                        name: 'locationreorderpoint'
                                    });
                                    //log.debug('locreorderPoint', locreorderPoint);

                                            if (remQty != 0) {
                                                remQty = remQty - availQty;
                                                //log.debug('remQty', remQty);
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
                                                  //  log.debug(remQty);
                                                }
                                            }
                                    return true;
                                });

                            }
                            transferOrderRec.commitLine({
                                sublistId: 'item'
                            });
                        }

                    } else if (serialItem == true) {
                    //    log.debug('serialItem');
                        var serialItemSearch = search.create({
                            type: 'item',
                            filters: [
                                ["internalid", "anyof", recId],
                                "AND",
                                ["inventorynumber.location", "anyof", fromLocation], // from location
                                "AND",
                                ["inventorynumber.isonhand", "is", true],
                                "AND",
                                ["inventorynumber.quantityavailable", "greaterthan", 0],
                                "AND",
                                ["locationquantityonhand", "greaterthan", 0],
                                "AND",
                                ["inventorylocation", "anyof", fromLocation] //from Location
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
                                }),
                                search.createColumn({
                                    name: "locationquantityavailable",
                                    label: "location Qty available"
                                }),
                                search.createColumn({
                                    name: "locationreorderpoint",
                                    label: "locationreorderpoint"
                                }),
                                search.createColumn({
                                    name: "locationquantityonhand",
                                    label: "locationquantityonhand"
                                }),
                                search.createColumn({
                                    name: "locationquantitycommitted",
                                    label: "locationquantitycommitted"
                                }),
                                search.createColumn({
                                    name: "locationquantityintransit",
                                    label: "Location In Transit"
                                })
                            ]
                        });
                        var serialCount = serialItemSearch.runPaged().count
                      //  log.debug('serialItemSearch count', serialCount);
                      serialItemSearch.run().each(function(result) {
                            var locOnHand = result.getValue("locationquantityonhand");
                            var locCommitted = result.getValue('locationquantitycommitted');
                            var locationInTransit = result.getValue('locationquantityintransit');
                            var locQtyAvaiable = result.getValue({
                                        name: 'locationquantityavailable'
                                    });
                                    //log.debug('locQtyAvaiable', locQtyAvaiable);
                                    var locreorderPoint = result.getValue({
                                        name: 'locationreorderpoint'
                                    });
                                    //log.debug('locreorderPoint', locreorderPoint);
                            locCommitted = (locCommitted) ? locCommitted : 0;
                            locOnHand = (locOnHand) ? locOnHand : 0;
                            locationInTransit = (locationInTransit) ? locationInTransit : 0;

                            var qtyToSet = parseFloat(locOnHand) - parseFloat(locCommitted);
                            qtyToSet = parseFloat(qtyToSet) - parseFloat(locationInTransit);
                            if (qtyToSet > 0) {
                                if (qtyToSet > reqQty) {
                                    return false;
                                } else {
                                    reqQty = qtyToSet;
                                }
                            } else {
                                reqQty = 0;
                            }
                            if (Number(locQtyAvaiable) > Number(locreorderPoint)) {
                                        var reqQty1 = parseInt(locQtyAvaiable) - parseInt(locreorderPoint);
                                        //log.debug('reqQty1', reqQty1);
                                        if (reqQty1 < reqQty) {
                                            reqQty = reqQty1;
                                            //  //log.debug('reqQty', reqQty);
                                        }
                                    }

                        });
                        if (reqQty > 0 && serialCount > 0) {
                            transferOrderRec.selectNewLine({
                                sublistId: 'item'
                            });
                            transferOrderRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: recId
                            });
                            transferOrderRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: reqQty
                            });
                            if (serialCount > 0) {
                                var subrec = transferOrderRec.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                                });
                                serialItemSearch.run().each(function(result) {
                                    var availQty = result.getValue({
                                        "name": "quantityavailable",
                                        join: 'inventorynumber'
                                    });
                                    var invNumber = result.getValue({
                                        "name": "inventorynumber",
                                        join: 'inventorynumber'
                                    });
                                    var locQtyAvaiable = result.getValue({
                                        name: 'locationquantityavailable'
                                    });
                                  //  log.debug('locQtyAvaiable', locQtyAvaiable);
                                    var locreorderPoint = result.getValue({
                                        name: 'locationreorderpoint'
                                    });
                                  //  log.debug('locreorderPoint', locreorderPoint);
                                            if (availQty > 0) {
                                                if (reqQty >= availQty) {
                                                  //  log.debug(reqQty);
                                                 //   log.debug(availQty);
                                                 //   log.debug(invNumber);

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
                                                    subrec.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'quantity',
                                                        value: availQty
                                                    });
                                                    subrec.commitLine({
                                                        sublistId: 'inventoryassignment'
                                                    });
                                                    reqQty = reqQty - availQty;
                                                 //   log.debug(reqQty);

                                                }
                                            }
                                    return true;
                                });
                            }
                            transferOrderRec.commitLine({
                                sublistId: 'item'
                            });
                        }
                    } else {
                            var invItemSearch = search.create({
                                type: 'item',
                                filters: [
                                    ["internalid", "anyof", recId],
                                    "AND",
                                    ["inventorylocation", "anyof", fromLocation] // from location
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "locationquantityavailable",
                                        label: "location Qty available"
                                    }),
                                    search.createColumn({
                                        name: "locationreorderpoint",
                                        label: "locationreorderpoint"
                                    })
                                ]
                            });
                            var count = invItemSearch.runPaged().count;
                         //   log.debug('invItemSearch count', count);
                        if (reqQty > 0) {
                         //   log.debug('reqQty inventory', reqQty);
                            if (count > 0) {
                                invItemSearch.run().each(function(result) {
                                var locQtyAvaiable = result.getValue({
                                    name: 'locationquantityavailable'
                                });
                              //  log.debug('locQtyAvaiable', locQtyAvaiable);
                                var locreorderPoint = result.getValue({
                                    name: 'locationreorderpoint'
                                });
                             //   log.debug('locreorderPoint', locreorderPoint);
                                      if (Number(locQtyAvaiable) > Number(reqQty)) {
                                if (Number(locQtyAvaiable) > Number(locreorderPoint)) {
                                    var reqQty1 = parseInt(locQtyAvaiable) - parseInt(locreorderPoint);
                                  //  log.debug('reqQty1', reqQty1);
                                    if (reqQty1 < reqQty) {
                                        reqQty = reqQty1;
                                    }
                                     //   log.debug('reqQty', reqQty);
                                        transferOrderRec.selectNewLine({
                                            sublistId: 'item'
                                        });
                                        transferOrderRec.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',
                                            value: recId
                                        });
                                        transferOrderRec.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                            value: reqQty
                                        });
                                        transferOrderRec.commitLine({
                                            sublistId: 'item'
                                        });
                                    }
                                }
                                return true;
                            });
                            }
                            
                        }
                    }
                }
                    return true;
                });
                    var recordId = transferOrderRec.save();
                  //  log.debug('recordId', recordId);
                
                        }
            } catch (ex) {
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