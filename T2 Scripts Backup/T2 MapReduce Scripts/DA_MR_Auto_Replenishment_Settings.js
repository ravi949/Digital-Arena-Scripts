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
                var custRecordSearch = search.create({
                    type: 'customrecord_da_auto_replenishment',
                    columns: [{
                        name: 'internalid'
                    }, {
                        name: 'custrecord_da_subsidiary'
                    }, {
                        name: 'custrecord_da_class_segment'
                    }, {
                        name: 'custrecord_da_currency_3'
                    }, {
                        name: 'custrecord_da_preferred_vendor'
                    }]
                });
                custRecordSearch.run().each(function(result) {
                    var recId = result.id;
                  
                    log.debug('recId', recId);
                    var subsidiary = result.getValue({
                        name: 'custrecord_da_subsidiary'
                    });
                    log.debug('subsidiary', subsidiary);
                    var itemBrand = result.getValue({
                        name: 'custrecord_da_class_segment'
                    });
                  itemBrand= itemBrand.split(",");
                    //log.debug('itemBrand', itemBrand.split(","));
                    
                    var currency = result.getValue({
                        name: 'custrecord_da_currency_3'
                    });
                    log.debug('currency', currency);
                    var prefVendor = result.getValue({
                        name: 'custrecord_da_preferred_vendor'
                    });
                    log.debug('prefVendor', prefVendor);

                    var purchaseOrderRec = record.create({
                        type: record.Type.PURCHASE_ORDER,
                        isDynamic: true
                    });

                    purchaseOrderRec.setValue({
                        fieldId: 'entity',
                        value: prefVendor
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'approvalstatus',
                        value:  '1'
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'currency',
                        value:  currency
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'subsidiary',
                        value:  subsidiary
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'class',
                        value: '5'
                    });
                  purchaseOrderRec.setValue({
                        fieldId: 'department',
                        value: '3'
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'location',
                        value: '3'
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'custbody4',
                        value: '2'
                    });
                    purchaseOrderRec.setValue({
                        fieldId: 'tobeemailed',
                        value: false
                    });
                    var mySearch = search.create({
                    type: 'item',
                    filters:
                       [
                          ["custitem_da_local_purchase", "is", true],
                          "AND",
                          ["inventorylocation","anyof","3"], //transfer location al kout / jabriya
                          "AND", 
                          ["locationreorderpoint","greaterthan","0"]
                       ],
                    columns: [
                      search.createColumn({
                         name: "itemid",
                         sort: search.Sort.ASC,
                         label: "Name"
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
                if(subsidiary) {
                  log.debug(subsidiary);
                      var subsidiaryFilters = mySearch.filters;
                      subsidiaryFilters.push(search.createFilter({
                      name: "subsidiary",
                      operator: search.Operator.ANYOF,
                      values: subsidiary
                      }));
                    }
                    if(itemBrand) {
                  log.debug(itemBrand);
                      var subsidiaryFilters = mySearch.filters;
                      subsidiaryFilters.push(search.createFilter({
                      name: "class",
                      operator: search.Operator.ANYOF,
                      values: itemBrand
                      }));
                    }
                mySearch.run().each(function(result) {
                    var recId = result.id;
                    log.debug('recId',recId);
                    var reqQty = result.getValue({
                        name: 'formulanumeric'
                    });
                  
                    var locQtyAvaiable = result.getValue({
                        name: 'locationquantityavailable'
                    });
                   var locreorderPoint = result.getValue({
                        name: 'locationreorderpoint'
                    });
                    log.debug('reqQty', reqQty);
                    log.debug('locQtyAvaiable', locQtyAvaiable);
                    log.debug('locreorderPoint', locreorderPoint);
                  
                  if(Number(locQtyAvaiable) <= Number(locreorderPoint)){
                    log.debug(true);
                      purchaseOrderRec.selectNewLine({
                          sublistId: 'item'
                      });
                      purchaseOrderRec.setCurrentSublistValue({
                          sublistId: 'item',
                          fieldId: 'item',
                          value: recId
                      });
                      purchaseOrderRec.setCurrentSublistValue({
                          sublistId: 'item',
                          fieldId: 'quantity',
                          value: reqQty
                      });
                      purchaseOrderRec.setCurrentSublistValue({
                          sublistId: 'item',
                          fieldId: 'isclosed',
                          value: false
                      });
                      purchaseOrderRec.commitLine({
                          sublistId: 'item'
                      });
                  }
                    
                     return true;
                });
                    var recordId = purchaseOrderRec.save({
                      ignoreMandatoryFields: false
                    });
                    log.debug('recordId', recordId);
                   



                    return true;
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