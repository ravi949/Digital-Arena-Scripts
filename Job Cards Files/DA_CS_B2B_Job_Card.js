/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord', 'N/format'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search, url, currentRecord, format) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is
         *            being accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */

        var sc;
  var mode ;

        function pageInit(scriptContext) {
            sc = scriptContext;
          mode = scriptContext.mode;
        }

        /**
         * Function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            try {

                if (scriptContext.fieldId == 'custrecord_da_b_to_b_customer') {
                    var customerId = scriptContext.currentRecord.getValue('custrecord_da_b_to_b_customer');

                    var lookup = search.lookupFields({
                        type: 'customer',
                        id: customerId,
                        columns: ['overduebalance']
                    });

                    console.log(lookup.overduebalance);

                    if (Number(lookup.overduebalance) > 0) {
                        alert("This customer is having overduebalance : " + lookup.overduebalance);
                        return false;
                    }
                }

                if (scriptContext.fieldId == 'custrecord_da_btob_serial_no') {

                    var serialNo = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_btob_serial_no'
                    });

                    console.log(serialNo);

                    var customrecord_wrm_warrantyregSearchObj = search.create({
                        type: "customrecord_wrm_warrantyreg",
                        filters: [
                            ["custrecord_wrm_reg_serialnumber", "anyof", serialNo]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_wrm_reg_invoicedate",
                                label: "Invoice Date"
                            }),
                            search.createColumn({
                                name: "custrecord_wrm_reg_status",
                                label: "Status"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_wrm_warrantyregSearchObj.runPaged().count;
                    log.debug("customrecord_wrm_warrantyregSearchObj result count", searchResultCount);
                    customrecord_wrm_warrantyregSearchObj.run().each(function(result) {
                        var invoiceDate = result.getValue('custrecord_wrm_reg_invoicedate');
                        log.debug('invoiceDate', invoiceDate);
                        var status = result.getValue('custrecord_wrm_reg_status');
                        log.debug('status', status);

                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_btob_parent1',
                            fieldId: 'custrecord_da_warranty_ref',
                            value: result.id
                        });
                        if (status == 'Under Warranty') {
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_btob_parent1',
                                fieldId: 'custrecord_da_btob_warranty',
                                value: true
                            });
                        }

                        return true;
                    });
                }

                if (scriptContext.fieldId == 'custrecord_da_b_to_b_subsidiary') {
                    var subsidiary = scriptContext.currentRecord.getValue('custrecord_da_b_to_b_subsidiary');
                    var workshop_settings_SearchObj = search.create({
                        type: "customrecord_da_custom_workshop_settings",
                        filters: [
                            ["custrecord_da_workshop_subsidiary", "anyof", subsidiary]
                        ],
                        columns: [

                            search.createColumn({
                                name: "custrecord_da_default_business_unit",
                                label: "Default Business Unit"
                            }),
                            search.createColumn({
                                name: "custrecord_da_default_receptionist",
                                label: "Default Receptionist"
                            }),
                            search.createColumn({
                                name: "custrecord_da_job_manager",
                                label: "Job Manager"
                            }),
                          search.createColumn({
                                name: "custrecord_da_default_workshop_location",
                                label: "loc"
                            }),
                           search.createColumn({
                                name: "custrecord_da_workshop_technician",
                                label: "tec"
                            }),
                        ]
                    });

                    var searchResultCount = workshop_settings_SearchObj.runPaged().count;
                    log.debug("workshop_settings_SearchObj result count", searchResultCount);
                    workshop_settings_SearchObj.run().each(function(result) {
                        var BusinessUnit = result.getValue('custrecord_da_default_business_unit');
                        var receptionist = result.getValue('custrecord_da_default_receptionist');
                        var jobmanager = result.getValue('custrecord_da_job_manager');
                        scriptContext.currentRecord.setValue({
                            fieldId: 'custrecord_da_btob_business_unit',
                            value: BusinessUnit
                        });
                      
                       scriptContext.currentRecord.setValue({
                            fieldId: 'custrecord_da_btob_workshop_loc',
                            value:  result.getValue('custrecord_da_default_workshop_location')
                        });
                      
                      scriptContext.currentRecord.setValue({
                            fieldId: 'custrecord_da_technician_email_address',
                            value:  result.getValue('custrecord_da_workshop_technician')
                        });

                        scriptContext.currentRecord.setValue({
                            fieldId: 'custrecord_da_b_to_b_receptionist',
                            value: receptionist
                        });
                        scriptContext.currentRecord.setValue({
                            fieldId: 'custrecord_da_btob_job_manager',
                            value: jobmanager
                        });


                    });
                }

                if (scriptContext.fieldId == 'custrecord_da_btob_service') {
                    var itemId = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent2',
                        fieldId: 'custrecord_da_btob_service'
                    });
                    var itemSearchObj = search.create({
                        type: "item",
                        filters: [
                            ["internalid", "anyof", itemId],
                            "AND",
                            ["pricing.currency", "anyof", "1"],
                            "AND",
                            ["pricing.pricelevel", "anyof", "1"]
                        ],
                        columns: [
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
                            //search.createColumn({name: "custitemitem_arabic_name", label: "Item Arabic Name"}),
                            search.createColumn({
                                name: "locationquantityavailable",
                                label: "Location Available"
                            }),
                            search.createColumn({
                                name: "unitprice",
                                join: "pricing",
                                label: "Unit Price"
                            })
                        ]
                    });
                    var searchResultCount = itemSearchObj.runPaged().count;
                    log.debug("itemSearchObj result count", searchResultCount);
                    itemSearchObj.run().each(function(result) {

                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_btob_parent2',
                            fieldId: 'custrecord_da_btob_unit_price',
                            value: result.getValue({
                                name: 'unitprice',
                                join: "pricing"
                            }),
                            ignoreFieldChange: true
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_btob_parent2',
                            fieldId: 'custrecord_da_btob_total',
                            value: result.getValue({
                                name: 'unitprice',
                                join: "pricing"
                            }),
                            ignoreFieldChange: true
                        });
                    });
                }

                if (scriptContext.fieldId == 'custrecord_da_btob_quantity' || scriptContext.fieldId == 'custrecord_da_btob_unit_price') {
                    var quantity = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent2',
                        fieldId: 'custrecord_da_btob_quantity'
                    });

                    var unitPrice = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent2',
                        fieldId: 'custrecord_da_btob_unit_price'
                    });

                    if (quantity > 0 && unitPrice > 0) {
                        var total = unitPrice * quantity;
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_btob_parent2',
                            fieldId: 'custrecord_da_btob_total',
                            value: total,
                            ignoreFieldChange: true
                        });
                    }
                }
              if (scriptContext.fieldId == 'custrecord_da_aj_service_check_list') {
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_instal_or_assemble',
                        value: false
                       });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_maintenance_repair',
                        value: false
                    });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_site_survey',
                        value: false
                    });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_commission_and_train',
                        value: false
                    });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_warranty',
                        value: false
                    });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_googs_remove_from_site',
                        value: false
                    });
                scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_services_completed',
                        value: false
                    });
                var serviceCheckList = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_aj_service_check_list'
                    });
                        
                    for(var i = 0; i < serviceCheckList.length; i++){
                    var id = serviceCheckList[i];
                     
                    if(id == 1){
                         
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_instal_or_assemble',
                        value: true
                       });
                         
                    }
                    if(id == 2){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_maintenance_repair',
                        value: true
                    });
                    }
                    if(id == 3){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_site_survey',
                        value: true
                    });
                    }
                    if(id == 4){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_commission_and_train',
                        value: true
                    });
                    }
                    if(id == 5){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_warranty',
                        value: true
                    });
                    }
                    if(id == 6){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_googs_remove_from_site',
                        value: true
                    });
                    }
                    if(id == 7){
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_btob_parent1',
                        fieldId: 'custrecord_da_services_completed',
                        value: true
                    });
                    }
                    
                }
                
                    }

}
         catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        function generateQuotation(id) {

            window.open(window.location.origin + "" + "/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=125&trantype=estimate&&id=" + id + "&label=Estimate&printtype=transaction");


        }

        /**
         * Function to be executed when field is slaved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * 
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        function jobprint(id) {
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_da_su_b2b_job_print',
                deploymentId: 'customdeploy_da_su_b2b_job_print',
                params: {
                    recordId: id,
                  urlorigin : window.location.origin

                }
            });
            window.open(suiteletUrl);
        }

        function jobprint1(id) {
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

        function jobprint2(id) {
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
   function jobprint3(id) {
            var suiteletUrl3 = url.resolveScript({
               scriptId: 'customscript_da_su_receipt_voucher',
                deploymentId: 'customdeploy_da_su_receipt_voucher',
                params: {
                    recordId: id,
 urlorigin : window.location.origin
                }
            });
            window.open(suiteletUrl3);
        }
   

        /**
         * Function to be executed after sublist is inserted, removed, or
         * edited.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            try {} catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        /**
         * Validation function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @returns {boolean} Return true if field is valid
         * 
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is
         * committed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            try {
                    
            }
            catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         * 
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try {
              
              if(mode == 'create'){
                var customerId = scriptContext.currentRecord.getValue('custrecord_da_b_to_b_customer');

                var lookup = search.lookupFields({
                    type: 'customer',
                    id: customerId,
                    columns: ['overduebalance']
                });

                console.log(lookup.overduebalance);

                if (Number(lookup.overduebalance) > 0) {
                    alert("This customer is having overduebalance : " + lookup.overduebalance);
                    return false;
                }
              }


                
                return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord,
            // openNewJobCard :openNewJobCard,
            jobprint: jobprint,
            generateQuotation: generateQuotation,
          jobprint1:jobprint1,
          jobprint2:jobprint2,
           jobprint3:jobprint3,
        };

    });