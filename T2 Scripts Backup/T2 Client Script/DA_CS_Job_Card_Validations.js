/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/currentRecord', 'N/search', 'N/record', 'N/runtime','N/url'],
    function(currentRecord, search, record, runtime,url) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode;

        function pageInit(scriptContext) {
            try {
                mode = scriptContext.mode;
                var userObj = runtime.getCurrentUser();
                var role = userObj.role;
                console.log("Internal ID of current user role: " + userObj.role);
                var techinican = scriptContext.currentRecord.getValue('custrecord_da_technician');
                if (mode == "edit" && !techinican) {
                    console.log(userObj.id);
                    scriptContext.currentRecord.setValue('custrecord_da_technician', userObj.id);
                }
                var formId = scriptContext.currentRecord.getValue('customform');
                console.log(formId + "" + mode);
                if (mode == "create" && formId != "364") {
                    scriptContext.currentRecord.setValue('customform', 364);
                }
                if (mode == "edit" && formId != "365") {
                    console.log(true);
                    scriptContext.currentRecord.setValue('customform', 365);
                }
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {
                if (scriptContext.fieldId == "custrecord_da_spare_part_kgb_text") {
                 // alert('');
                    var techLocation = scriptContext.currentRecord.getValue({
                        fieldId: 'custrecord_da_technician_location'
                    });
                    var enterSerialNo = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                        fieldId: 'custrecord_da_spare_part_kgb_text'
                    });
                    if (techLocation) {
                        var itemId = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_spare_part_job_card',
                            fieldId: 'custrecord_da_spare_part_item'
                        });
                        console.log('itemId', itemId);
                        var inventorynumberSearchObj = search.create({
                            type: "inventorynumber",
                            filters: [
                                ["item.internalid", "anyof", itemId],
                                "AND",
                                ["quantityonhand", "greaterthan", "0"],
                                "AND",
                                ["location", "anyof", techLocation]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "inventorynumber",
                                    sort: search.Sort.ASC,
                                    label: "Number"
                                })
                            ]
                        });
                        var serialNoArr = {};
                        var searchResultCount = inventorynumberSearchObj.runPaged().count;
                        log.debug("inventorynumberSearchObj result count", searchResultCount);
                        inventorynumberSearchObj.run().each(function(result) {
                            var serialNo = result.getValue('inventorynumber').toUpperCase();
                            serialNoArr[serialNo] = result.id;
                            return true;
                        });
                        enterSerialNo = enterSerialNo.toUpperCase();
                        console.log('serialNoArr', serialNoArr);
                        // var key;
                        var found = false;
                        Object.keys(serialNoArr).forEach(function(k) {
                            if (k == enterSerialNo) {
                                console.log(k, serialNoArr[k]);
                                scriptContext.currentRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                    fieldId: 'custrecord_da_spare_part_new_serial',
                                    value: serialNoArr[k]
                                });
                                scriptContext.currentRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                    fieldId: 'custrecord_da_item_received',
                                    value: true
                                });
                                found = true;
                            }
                        });
                        if (!found) {
                            alert('Sorry you entered wrong serial No');
                        }
                    } else {
                        alert('Please select Technician and his location');
                    }
                }
               /* if (scriptContext.fieldId == "custrecord_spare_part_item_family") {
                   // var repairType = scriptContext.currentRecord.getValue('custrecord_da_repair_type');
                    var productModel = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId :'recmachcustrecord_da_spare_part_job_card',
                        fieldId : 'custrecord_da_product_model'
                    });
                    if (productModel) {
                        var customrecord_da_job_card_labor_costSearchObj = search.create({
                            type: "customrecord_da_job_card_labor_cost",
                            filters: [
                                ["custrecord_da_cost_product_model", "anyof", productModel]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_labor_cost_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var loabrCost = 0;
                        customrecord_da_job_card_labor_costSearchObj.run().each(function(result) {
                            loabrCost = result.getValue('custrecord_da_labor_cost_amount');
                            return true;
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId :'recmachcustrecord_da_spare_part_job_card',
                            fieldId :'custrecord_da_jc_labor_cost', 
                            value :loabrCost
                        });
                    }
                }*/
                if (scriptContext.fieldId == "custrecord_da_workshop_location_2") {
                    var sparePartsLocation = record.load({
                        type: 'customrecord_da_maintenance_settings',
                        id: 1
                    }).getValue('custrecord_da_spare_parts_location');
                    scriptContext.currentRecord.setValue('custrecord_da_job_card_parts_location', sparePartsLocation);
                }
             /*   if (scriptContext.fieldId == "custrecord_da_serial_number") {
                    var serialNo = scriptContext.currentRecord.getValue('custrecord_da_serial_number');
                    if (serialNo) {
                        var invoiceSearchObj = search.create({
                            type: "invoice",
                            filters: [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["shipping", "is", "F"],
                                "AND",
                                ["itemnumber.inventorynumber", "is", serialNo],
                                "AND",
                                ["taxline", "is", "F"],
                                "AND",
                                ["shipping", "is", "F"],
                                "AND",
                                ["mainline", "is", "F"],
                                "AND",
                                ["cogs", "is", "F"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "item",
                                    label: "Item"
                                }),
                                search.createColumn({
                                    name: "entity",
                                    label: "Name"
                                })
                            ]
                        });
                        var searchResultCount = invoiceSearchObj.runPaged().count;
                        console.log("invoiceSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            invoiceSearchObj.run().each(function(result) {
                                var item = result.getValue('item');
                                var entity = result.getValue('entity');
                                scriptContext.currentRecord.setValue('custrecord_da_item', item);
                                scriptContext.currentRecord.setValue('custrecord_da_customer', entity);
                                scriptContext.currentRecord.setValue('custrecord_da_purchase_from', 1);
                            });
                        } else {
                            scriptContext.currentRecord.setValue('custrecord_da_purchase_from', 2);
                        }
                        var customrecord_da_job_cardsSearchObj = search.create({
                            type: "customrecord_da_job_cards",
                            filters: [
                                ["custrecord_da_serial_number", "is", serialNo]
                            ]
                        });
                        var previousJobssearchResultCount = customrecord_da_job_cardsSearchObj.runPaged().count;
                        console.log("customrecord_da_job_cardsSearchObj result count", previousJobssearchResultCount);
                        if (previousJobssearchResultCount > 0) {
                            scriptContext.currentRecord.setValue('custrecord_da_maintenance_type', 2);
                        } else {
                            scriptContext.currentRecord.setValue('custrecord_da_maintenance_type', 1);
                        }
                    }
                }*/
                if (scriptContext.fieldId == 'custrecord_da_gsx_number') {
                    var gsxNo = scriptContext.currentRecord.getValue('custrecord_da_gsx_number');
                    if (gsxNo) {
                        var customrecord_da_job_cardsSearchObj = search.create({
                            type: "customrecord_da_job_cards",
                            filters: [
                                ["custrecord_da_gsx_number", "is", gsxNo]
                            ]
                        });
                        var searchResultCount = customrecord_da_job_cardsSearchObj.runPaged().count;
                        log.debug("customrecord_da_job_cardsSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            alert("Sorry, GSX No Must be Unique. Please enter Correct GSX No");
                            scriptContext.currentRecord.setValue('custrecord_da_gsx_number', ' ');
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_spare_part_item') {
                    var itemId = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                        fieldId: 'custrecord_da_spare_part_item'
                    });
                    var workShopLocation = scriptContext.currentRecord.getValue('custrecord_da_job_card_parts_location');
                    console.log(workShopLocation);
                    if (itemId) {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["internalid", "anyof", itemId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "itemid",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "unitprice",
                                    join: "pricing",
                                    label: "Unit Price"
                                }),
                                search.createColumn({
                                    name: "totalquantityonhand",
                                    label: "Total Quantity On Hand"
                                }),
                                search.createColumn({
                                    name: "isserialitem",
                                    label: "Is Serialized Item"
                                })
                            ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        console.log("itemSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            itemSearchObj.run().each(function(result) {
                                var pricelevel = result.getValue({
                                    name: 'pricelevel',
                                    join: "pricing"
                                });
                                    //listed price
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_spare_part_price',
                                        value: result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        }),
                                        ignoreFieldChange: true
                                    });
                                    var isSeralized = result.getValue('isserialitem');
                                    console.log(isSeralized);
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_is_serialized',
                                        value: isSeralized,
                                        ignoreFieldChange: true
                                    });
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_spare_part_avail_qty',
                                        value: result.getValue({
                                            name: 'totalquantityonhand'
                                        }),
                                        ignoreFieldChange: true
                                    });
                               // }
                                /*if(pricelevel == 6){
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_in_warranty_price',
                                        value: result.getValue({name:'unitprice',join:"pricing"}),
                                        ignoreFieldChange: true
                                    });
                                }

                                if(pricelevel == 7){
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_out_of_warranty_price',
                                        value: result.getValue({name:'unitprice',join:"pricing"}),
                                        ignoreFieldChange: true
                                    });
                                }*/
                                return true;
                            });
                        } else {
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_spare_part_price',
                                value: 0,
                                ignoreFieldChange: true
                            });
                            /* scriptContext.currentRecord.setCurrentSublistValue({
                                 sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                 fieldId: 'custrecord_da_part_out_of_warranty_price',
                                 value: 0,
                                 ignoreFieldChange: true
                             });
                             scriptContext.currentRecord.setCurrentSublistValue({
                                 sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                 fieldId: 'custrecord_da_part_in_warranty_price',
                                 value: 0,
                                 ignoreFieldChange: true
                             });*/
                        }
                    }
                }
                /*if (scriptContext.fieldId == 'custrecord_da_item_warranty_status') {
                    var itemId = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                        fieldId: 'custrecord_da_spare_part_item'
                    });
                    var warrantyStatus = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                        fieldId: 'custrecord_da_item_warranty_status'
                    });
                    var workShopLocation = scriptContext.currentRecord.getValue('custrecord_da_job_card_parts_location');
                    console.log(workShopLocation);
                    if (itemId) {
                        var settingsRec = record.load({
                            type: 'customrecord_da_maintenance_settings',
                            id: 1
                        });
                        var settingsCurrency = settingsRec.getValue('custrecord_da_salesorder_currency');
                      
                      if(warrantyStatus == 1){
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["pricing.pricelevel", "anyof", "6"],
                                "AND",
                                ["internalid", "anyof", itemId],
                                "AND",
                                ["pricing.currency", "anyof", settingsCurrency]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    join: "inventoryNumber",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "unitprice",
                                    join: "pricing",
                                    label: "Unit Price"
                                }),
                                search.createColumn({
                                    name: "currency",
                                    join: "pricing",
                                    label: "Currency"
                                }),
                                search.createColumn({
                                    name: "pricelevel",
                                    join: "pricing",
                                    label: "Price Level"
                                })
                            ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            itemSearchObj.run().each(function(result) {
                                var pricelevel = result.getValue({
                                    name: 'pricelevel',
                                    join: "pricing"
                                });
                                if (pricelevel == 6 && warrantyStatus == 1) {
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_in_warranty_price',
                                        value: result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        }),
                                        ignoreFieldChange: true
                                    });
                                }
                                if (pricelevel == 7 && warrantyStatus == 2) {
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_out_of_warranty_price',
                                        value: result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        }),
                                        ignoreFieldChange: true
                                    });
                                }
                                return true;
                            });
                      }else {
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_out_of_warranty_price',
                                value: 0,
                                ignoreFieldChange: true
                            });
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_in_warranty_price',
                                value: 0,
                                ignoreFieldChange: true
                            });
                        }
                        
                        } 
                      
                       if(warrantyStatus == 2){
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["pricing.pricelevel", "anyof", "6","7"],
                                "AND",
                                ["internalid", "anyof", itemId],
                                "AND",
                                ["pricing.currency", "anyof", settingsCurrency]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    join: "inventoryNumber",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "unitprice",
                                    join: "pricing",
                                    label: "Unit Price"
                                }),
                                search.createColumn({
                                    name: "currency",
                                    join: "pricing",
                                    label: "Currency"
                                }),
                                search.createColumn({
                                    name: "pricelevel",
                                    join: "pricing",
                                    label: "Price Level"
                                })
                            ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                          var inWarrantyPrice = 0;
                           var outWarrantyPrice = 0;
                            itemSearchObj.run().each(function(result) {
                                var pricelevel = result.getValue({
                                    name: 'pricelevel',
                                    join: "pricing"
                                });
                                if (pricelevel == 6 ) {
                                  inWarrantyPrice =result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        });
                                   
                                }
                              if (pricelevel == 7 ) {
                                  outWarrantyPrice =result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        });
                                   
                                }
                              
                                return true;
                            });
                           scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_out_of_warranty_price',
                                        value: parseFloat(inWarrantyPrice) - parseFloat(outWarrantyPrice),
                                        ignoreFieldChange: true
                                    });
                      }else {
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_out_of_warranty_price',
                                value: 0,
                                ignoreFieldChange: true
                            });
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_in_warranty_price',
                                value: 0,
                                ignoreFieldChange: true
                            });
                        }
                        
                        } 
                    }
                }*/
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }
        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {}
        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {}
        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {}
        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {
           /*  if (scriptContext.sublistId == "recmachcustrecord_da_spare_part_job_card") {
               
                  //  var repairType = scriptContext.currentRecord.getValue('custrecord_da_repair_type');
                    var productModel = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId :'recmachcustrecord_da_spare_part_job_card',
                        fieldId : 'custrecord_spare_part_item_family'
                    });
                    console.log(productModel);
                    if (productModel) {
                        var customrecord_da_job_card_labor_costSearchObj = search.create({
                            type: "customrecord_da_job_card_labor_cost",
                            filters: [
                                ["custrecord_da_cost_product_model", "anyof", productModel]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_labor_cost_amount",
                                    label: "Amount"
                                })
                            ]
                        });
                        var loabrCost = 0;
                        customrecord_da_job_card_labor_costSearchObj.run().each(function(result) {
                            loabrCost = result.getValue('custrecord_da_labor_cost_amount');
                            return true;
                        });
                        console.log(loabrCost);
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId :'recmachcustrecord_da_spare_part_job_card',
                            fieldId :'custrecord_da_jc_labor_cost', 
                            value :loabrCost
                        });
                    }

                    return true;
                }*/
        }
        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {}
        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {
            try {
                console.log(scriptContext);
                var sublistValue = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                    fieldId: 'id'
                });
                console.log('sublistValue', sublistValue);
                if (sublistValue) {
                    var customrecord_da_pending_receiving_kbbSearchObj = search.create({
                        type: "customrecord_da_pending_receiving_kbb",
                        filters: [
                            ["custrecord_da_spare_part_ref_kbb", "anyof", sublistValue]
                        ]
                    });
                    customrecord_da_pending_receiving_kbbSearchObj.run().each(function(result) {
                        record.delete({
                            type: 'customrecord_da_pending_receiving_kbb',
                            id: result.id
                        })
                        return true;
                    });
                    var customrecord_da_spare_part_request_itemsSearchObj = search.create({
                        type: "customrecord_da_spare_part_request_items",
                        filters: [
                            ["custrecord_da_spare_part_ref_2", "anyof", sublistValue]
                        ]
                    });
                    customrecord_da_spare_part_request_itemsSearchObj.run().each(function(result) {
                        record.delete({
                            type: 'customrecord_da_spare_part_request_items',
                            id: result.id
                        })
                        return true;
                    });
                }
                return true;
            } catch (ex) {}
        }
        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try {
                var status = scriptContext.currentRecord.getValue('custrecord_da_work_done');
                if (status == 3) {
                    var numLines = scriptContext.currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_da_spare_part_job_card'
                    });
                    var allRecieved = true;
                    if (numLines > 0) {
                    
                        for (var i = 0; i < numLines; i++) {
                            var KGBRecieved = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_item_received',
                                line: i
                            });
                            var itemType = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_spare_part_item_type',
                                line: i
                            });
                            console.log("KGBRecieved", KGBRecieved);
                            if (KGBRecieved == false && itemType != 3) {
                                allRecieved = false;
                            }
                        }
                        if (!allRecieved) {
                            alert("you cant make this Job Card as Completed");
                            return false;
                        }
                    }
                       
                }
                var jobCardWarranty = scriptContext.currentRecord.getValue('custrecord_da_job_card_warranty_status');
                console.log('jobCardWarranty',jobCardWarranty);
                var jobCardPOS = scriptContext.currentRecord.getValue('custrecord_da_job_card_pos_list');
                console.log('jobCardPOS',jobCardPOS);
                var jobCostCenter = scriptContext.currentRecord.getValue('custrecord_da_job_card_cost_center_list');
                console.log('jobCostCenter',jobCostCenter);
                var jobCardPOSRec = record.load({
                            type: 'customrecord_da_job_card_pos',
                            id: jobCardPOS
                        });
                        var posWarranty = jobCardPOSRec.getValue('custrecord_da_job_card_warranty');
                        console.log('posWarranty', posWarranty);
                        if(jobCardWarranty != posWarranty){
                            scriptContext.currentRecord.setValue('custrecord_da_job_card_pos_list'," ");
                        } else {
                            var jobCostCenterRec = record.load({
                            type: 'customrecord_da_job_card_cost_center',
                            id: jobCostCenter
                        });
                        var costCenterPOS = jobCostCenterRec.getValue('custrecord_da_job_card_pos');
                        console.log('costCenterPOS', costCenterPOS);
                        if(jobCardPOS != costCenterPOS){
                            scriptContext.currentRecord.setValue('custrecord_da_job_card_cost_center_list'," ");
                        }
                        }
                return true;
            } catch (ex) {}
        }
 /* function jobprint(id) {
    console.log('id',id);
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_da_su_jobcard_checklist',
                deploymentId: 'customdeploy_da_su_jobcard_checklist',
                params: {
                    recordId: id,
                  urlorigin : window.location.origin

                }
            });
            window.open(suiteletUrl);
        }*/
  function printServiceAppointment(id) {
            var suiteletUrl2 = url.resolveScript({
                scriptId: 'customscript_da_su_service_appointment',
                deploymentId: 'customdeploy_da_su_service_appointment',
                params: {
                    recordId: id,
 urlorigin : window.location.origin
                }
            });
            window.open(suiteletUrl2);
        }
        function printdeliveryAppointment(id) {
            var suiteletUrl1 = url.resolveScript({
                scriptId: 'customscript_da_su_delivery_appointment',
                deploymentId: 'customdeploy_da_su_delivery_appointment',
                params: {
                    id1: id,
 urlorigin : window.location.origin
                }
            });
            window.open(suiteletUrl1);
        }
  function receiptVoucher(id) {
            var suiteletUrl3 = url.resolveScript({
               scriptId: 'customscript_da_su_job_receipt_voucher',
                deploymentId: 'customdeploy_da_su_job_receipt_voucher',
                params: {
                    recordId: id,
 urlorigin : window.location.origin
                }
            });
            window.open(suiteletUrl3);
        }
  /*function SendCliam(id) {
            var suiteletUrl4 = url.resolveScript({
               scriptId: 'customscript_da_su_send_cliam',
                deploymentId: 'customdeploy_da_su_send_cliam',
                params: {
                    recordId: id,
 urlorigin : window.location.origin
                }
            });
            window.open(suiteletUrl4);
        }*/
  
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            //      postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            //      lineInit: lineInit,
            //      validateField: validateField,
           //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            validateDelete: validateDelete,
           saveRecord: saveRecord,
          //jobprint:jobprint,
          printServiceAppointment:printServiceAppointment,
          printdeliveryAppointment:printdeliveryAppointment,
          receiptVoucher:receiptVoucher
        };
    });