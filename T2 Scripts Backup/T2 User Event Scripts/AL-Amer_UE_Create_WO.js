/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/ui/message', 'N/runtime', 'N/task'],
    function(search, serverWidget, record, message, runtime, task) {
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
            try {
                var scriptObj = runtime.getCurrentScript();
                var deploymentId = scriptObj.deploymentId;
                if (deploymentId == "customdeploy_al_amr_ue_create_wo") {
                    scriptContext.form.clientScriptModulePath = './Ameer_CS_Create_WO.js';
                    var status = scriptContext.newRecord.getValue('custrecord_job_order_status');
                    if (scriptContext.type == 'view') {
                        var field = scriptContext.form.addField({
                            id: 'custpageinjectcode',
                            type: 'INLINEHTML',
                            label: 'Inject Code'
                        });
                        var src = "jQuery('#recmachcustrecord_jo_particulars_job_order__tab').find('tr').find('td:first,td:last').remove()";
                        field.defaultValue = "<script>jQuery(function($){require([], function(){" + src + ";})})</script>"
                        var flag = scriptContext.newRecord.getValue('custrecord_job_order_creating');
                        var type = scriptContext.newRecord.getValue('custrecord_job_order_service_type');
                        scriptContext.form.addButton({
                            id: 'custpage_job_print',
                            label: ' Print',
                            functionName: 'jobprint(' + scriptContext.newRecord.id + ')'
                        });
                        /*if(flag && type == 2 ){ //job card released
                            var msgText = message.create({
                                title: "Please Wait",
                                message: "While we are doing Vendor approval Mechanism.",
                                type: message.Type.INFORMATION
                            });
                            scriptContext.form.addPageInitMessage({message: msgText});
                        }

                        if(flag && type == 1 ){ // pending
                            var msgText = message.create({
                                title: "Please Wait",
                                message: "While we are processing the job order",
                                type: message.Type.INFORMATION
                            });
                            scriptContext.form.addPageInitMessage({message: msgText});
                        }*/
                        var jobOrderStatus = scriptContext.newRecord.getValue('custrecord_job_order_status');
                        var quotationExists = scriptContext.newRecord.getValue('custrecord_customer_quotation_ref');
                        if (jobOrderStatus == 1) { //Pending
                            /*scriptContext.form.addButton({
                                id : 'custpage_generate_repair_agreement',
                                label : 'Generate Equip Repair Agreement',
                                functionName:'generateRepairAgreement('+scriptContext.newRecord.id+')'
                            });*/
                            var estimateRecId = scriptContext.newRecord.getValue('custrecord_customer_quotation_ref');
                            var subsidiaryID = scriptContext.newRecord.getValue('custrecord_jo_subsidiary');
                            if (quotationExists) {
                                scriptContext.form.addButton({
                                    id: 'custpage_generate_quotation',
                                    label: 'Generate Quotation',
                                    functionName: 'generateQuotation("' + estimateRecId + '",' + subsidiaryID + ')'
                                });
                            }
                        }
                        var invoiceAlreadyCreated = scriptContext.newRecord.getValue('custrecord_customer_jo_invoice');
                        var soExists = scriptContext.newRecord.getValue('custrecord_da_job_card_sales_order');
                        if (jobOrderStatus == 2) { //completed
                            var customrecord_jo_particularsSearchObj = search.create({
                                type: "customrecord_jo_particulars",
                                filters: [
                                    ["custrecord_jo_particulars_job_order", "anyof", scriptContext.newRecord.id],
                                    "AND",
                                    ["custrecord_jo_particulars_type", "anyof", "1"]
                                ]
                            });
                            var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
                            log.debug("customrecord_jo_particularsSearchObj result count", searchResultCount);
                            if (searchResultCount > 0) {
                                scriptContext.form.addButton({
                                    id: 'custpage_generate_invoice',
                                    label: 'Fulfill',
                                    functionName: 'generateFulfill("'+ soExists + '",' + scriptContext.newRecord.id + ')'
                                });
                            } else {
                                scriptContext.form.addButton({
                                    id: 'custpage_generate_invoice',
                                    label: 'Generate Invoice',
                                    functionName: 'generateInvoice(' + soExists + ')'
                                });
                            }
                        }
                    }
                    if (scriptContext.type == 'create') {
                        var itemsSublist = scriptContext.form.getSublist({
                            id: 'recmachcustrecord_jo_particulars_job_order'
                        });
                        log.debug('itemsSublist', itemsSublist);
                        itemsSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
                    }
                    if (scriptContext.type == 'create' || scriptContext.type == 'edit') {
                        var taskField = scriptContext.form.getSublist({
                            id: 'recmachcustrecord_jo_particulars_job_order'
                        }).getField({
                            id: 'custrecord_jo_particulars_taskiid'
                        });
                        taskField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var statusField = scriptContext.form.getSublist({
                            id: 'recmachcustrecord_jo_particulars_job_order'
                        }).getField({
                            id: 'custrecord_jo_particulars_status'
                        });
                        statusField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var porefField = scriptContext.form.getSublist({
                            id: 'recmachcustrecord_jo_particulars_job_order'
                        }).getField({
                            id: 'custrecord_po_ref_no'
                        });
                        porefField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var assigned_field = scriptContext.form.getField({
                            id: 'custrecord_jo_assigned_to'
                        });
                    }
                }
            } catch (ex) {
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
            log.debug('beforeSubmit', 'beforeSubmit');
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
                var parentId = scriptContext.newRecord.id;
                var scriptObj = runtime.getCurrentScript();
                var deploymentId = scriptObj.deploymentId;
                log.debug('deploymentId', deploymentId);
                if (deploymentId == "customdeploy_al_amr_ue_create_wo") {
                    var type = scriptContext.newRecord.getValue('custrecord_job_order_service_type');
                    var jobOrderName = scriptContext.newRecord.getValue('name');
                    //var assaignee = scriptContext.newRecord.getValue('custrecord_jo_assigned_to');
                    var taskID = scriptContext.newRecord.getValue('custrecord_job_order_assignee_task');
                    var priority = scriptContext.newRecord.getValue('custrecord_jo_priority');
                    var compliantMessage = scriptContext.newRecord.getValue('custrecord_jo_customer_complaint');
                    var customerComments = scriptContext.newRecord.getValue('custrecord_customer_comments_if_any');
                    var customerLocation = scriptContext.newRecord.getValue('custrecord_customer_address');
                    log.debug('priority', priority);
                    if (type != 2) { // Not Replace
                        // Creating tasks for the assignees
                        var customrecord_jo_particularsSearchObj = search.create({
                            type: "customrecord_jo_particulars",
                            filters: [
                                ["custrecord_jo_particulars_job_order", "anyof", parentId],
                                "AND",
                                ["custrecord_jo_particulars_taskiid", "anyof", "@NONE@"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_jo_particulars_assigned_to",
                                    label: "Assigned To"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_product",
                                    label: "Product"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_qty",
                                    label: "Quantity"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_taskiid",
                                    label: "Task Id"
                                }),
                                search.createColumn({
                                    name: "custrecord_additional_comments",
                                    label: "Comments"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
                        log.debug("customrecord_jo_particularsSearchObj result count", searchResultCount);
                        customrecord_jo_particularsSearchObj.run().each(function(result) {
                            var recId = result.id;
                            var assignee = result.getValue('custrecord_jo_particulars_assigned_to');
                            var itemName = result.getText('custrecord_jo_particulars_product');
                            var taskID = result.getValue('custrecord_jo_particulars_taskiid');
                            var comments = result.getValue('custrecord_additional_comments');
                            var productName = result.getText('custrecord_jo_particulars_product');
                            var qty = result.getValue('custrecord_jo_particulars_qty');
                            if (!taskID && assignee) {
                                var taskRec = record.create({
                                    type: 'task'
                                });
                                taskRec.setValue('title', 'Job Order #' + parentId + ' - ' + itemName);
                                taskRec.setValue('assigned', assignee);
                                taskRec.setValue('custevent_job_order_ref', parentId);
                                taskRec.setValue('custevent_job_order_task_id', result.id);
                                taskRec.setValue('sendemail', true);
                                taskRec.setValue('custevent_spare_part_item', productName);
                                taskRec.setValue('custevent_spare_part_quantity', qty);
                                taskRec.setValue('message', comments + "\n Customer Details : " + customerLocation);
                                var createdTaskID = taskRec.save();
                                log.debug('createdTaskID', createdTaskID);
                                record.submitFields({
                                    type: 'customrecord_jo_particulars',
                                    id: recId,
                                    values: {
                                        'custrecord_jo_particulars_taskiid': createdTaskID
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                            return true;
                        });
                        //creating Appliances Invoice
                        //
                        try{
                      
                   
                        var customrecord_jo_particularsSearchObj = search.create({
                            type: "customrecord_jo_particulars",
                            filters: [
                                ["custrecord_jo_particulars_job_order", "anyof", scriptContext.newRecord.id],
                                "AND",
                                ["custrecord_is_vendor_approved", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_jo_particulars_description",
                                    sort: search.Sort.ASC,
                                    label: "description"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_product",
                                    label: "Service/Item"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_unit_price",
                                    label: "Unit Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_qty",
                                    label: "quantity"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_total",
                                    label: "Total"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
                        log.debug("customrecord_jo_particularsSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            var lookup = search.lookupFields({
                                type: 'customrecord_da_workshop_settings',
                                id: 1,
                                columns: ['custrecord_da_appliances_customer']
                            });
                            var applianceCustomer = lookup.custrecord_da_appliances_customer[0].value;
                            log.debug('applianceCustomer', applianceCustomer);
                            var applianceInvoiceExisted = scriptContext.newRecord.getValue('custrecord_da_appliances_invoice');
                            if (applianceInvoiceExisted) {
                                var invRec = record.load({
                                    type: "invoice",
                                    id: applianceInvoiceExisted,
                                    isDynamic: true
                                });
                                //log.debug('estimateCreated',estimateCreated);
                                var numLines = invRec.getLineCount({
                                    sublistId: 'item'
                                });
                                for (var i = numLines - 1; i >= 0; i--) {
                                    invRec.removeLine({
                                        sublistId: 'item',
                                        line: i,
                                        ignoreRecalc: true
                                    });
                                }
                            } else {
                                var invRec = record.create({
                                    type: "invoice",
                                    isDynamic: true
                                });
                                invRec.setValue('entity', applianceCustomer);
                                invRec.setValue('custbody_job_order_link', parentId);
                                var customerComplaint = scriptContext.newRecord.getValue('custrecord_tech_observation_job_order');
                                if (customerComplaint) {
                                    invRec.setValue('memo', customerComplaint);
                                }
                                var location = scriptContext.newRecord.getValue('custrecord_work_shop_location');
                                if (location) {
                                    invRec.setValue('location', location);
                                }
                            }
                            customrecord_jo_particularsSearchObj.run().each(function(result) {
                                var itemId = result.getValue('custrecord_jo_particulars_product');
                                log.debug("itemId", itemId);
                                var description = result.getValue('custrecord_jo_particulars_description');
                                var quantity = result.getValue('custrecord_jo_particulars_qty');
                                var rate = result.getValue('custrecord_jo_particulars_unit_price');
                                var total = result.getValue('custrecord_jo_particulars_total');
                                invRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                invRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: itemId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                if (description) {
                                    invRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        value: description,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (quantity) {
                                    invRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity,
                                        ignoreFieldChange: true
                                    });
                                }
                                invRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    value: rate,
                                    ignoreFieldChange: true
                                });
                                invRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value: total,
                                    ignoreFieldChange: true
                                });
                                invRec.commitLine('item');
                                return true;
                            });

                            var appInvId = invRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            log.debug("appInvId", appInvId);

                            if(appInvId){
                                record.submitFields({
                                    type: 'customrecord_job_order',
                                    id: parentId,
                                    values: {
                                        'custrecord_da_appliances_invoice': appInvId
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                        }else{
                            var applianceInvoiceExisted = scriptContext.newRecord.getValue('custrecord_da_appliances_invoice');

                            if(applianceInvoiceExisted){
                                record.delete({
                                    type:'invoice',
                                    id:applianceInvoiceExisted
                                });
                            }
                        }
                          
                           }catch(ex){
                             log.error(ex.name, ex.message);
                           }
                        // Creating Estimate for Customer (If items not under warranty)
                        //Check if estimate record already created or not
                        var totalPayableAmount = 0;
                        var estimateCreated = scriptContext.newRecord.getValue('custrecord_customer_quotation_ref');
                        var EstRecID;
                        var customrecord_jo_particularsSearchObj = search.create({
                            type: "customrecord_jo_particulars",
                            filters: [
                                ["custrecord_jo_particulars_job_order", "anyof", parentId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_jo_particulars_job_order",
                                    label: "Work Order"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_product",
                                    label: "Product"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_description",
                                    label: "Description"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_qty",
                                    label: "Qty"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_unit_price",
                                    label: "Unit Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_total",
                                    label: "Total"
                                }),
                                //search.createColumn({name: "custrecord_is_vendor_approved", label: "Is Under Warranty?"}),
                                search.createColumn({
                                    name: "custrecord_is_vendor_approved",
                                    label: "Is Vendor Approved?"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_taskiid",
                                    label: "Task Id"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_status",
                                    label: "Task Status"
                                }),
                                search.createColumn({
                                    name: "custrecord_discount_level",
                                    label: "Price Level"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
                        log.debug("customrecord_jo_particularsSearchObj result count", searchResultCount);
                        if (searchResultCount > 0 && !estimateCreated) {
                            log.debug("No Estimate")
                            var estimateRec = record.create({
                                type: "estimate",
                                isDynamic: true
                            });
                            estimateRec.setValue('entity', scriptContext.newRecord.getValue('custrecord_jo_company'));
                            estimateRec.setValue('custbody_job_order_link', parentId);
                            var customerComplaint = scriptContext.newRecord.getValue('custrecord_tech_observation_job_order');
                            if (customerComplaint) {
                                estimateRec.setValue('memo', customerComplaint);
                            }
                            var customerName = scriptContext.newRecord.getValue('custrecord_job_order_cust_name');
                            if (customerName) {
                                estimateRec.setValue('custbody_cust_name', customerName);
                            }
                            var mobileNo = scriptContext.newRecord.getValue('custrecord_cust_phone_no');
                            if (mobileNo) {
                                estimateRec.setValue('custbody_cust_phoneno', mobileNo);
                            }
                            var location = scriptContext.newRecord.getValue('custrecord_work_shop_location');
                            if (location) {
                                //estimateRec.setValue('location', location);
                            }
                            estimateRec.setValue('includeinforecast', false);
                            customrecord_jo_particularsSearchObj.run().each(function(result) {
                                var itemId = result.getValue('custrecord_jo_particulars_product');
                                log.debug("itemId", itemId);
                                var description = result.getValue('custrecord_jo_particulars_description');
                                var quantity = result.getValue('custrecord_jo_particulars_qty');
                                var rate = result.getValue('custrecord_jo_particulars_unit_price');
                                var total = result.getValue('custrecord_jo_particulars_total');
                                var isUnderwarranty = result.getValue('custrecord_is_vendor_approved');
                                var taskID = result.getValue('custrecord_jo_particulars_taskiid');
                                var pricelevelId = result.getValue('custrecord_discount_level');
                                estimateRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: itemId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                if (description) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        value: description,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (quantity) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity,
                                        ignoreFieldChange: true
                                    });
                                }
                                /*if(pricelevelId){
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'price',
                                        value: pricelevelId,
                                        ignoreFieldChange: true
                                    });
                                }*/
                                if (taskID) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_job_order_task',
                                        value: taskID,
                                        ignoreFieldChange: true
                                    });
                                }
                                var taskStatus = result.getValue('custrecord_jo_particulars_status');
                                if (taskStatus > 0) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_job_orders_task_status',
                                        value: taskStatus,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (total == "" || total == undefined || total == " ") {
                                    total = 0;
                                }
                                if (!isUnderwarranty) {
                                    totalPayableAmount = parseFloat(totalPayableAmount) + parseFloat(total);
                                }
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    value: (isUnderwarranty) ? 0 : rate,
                                    ignoreFieldChange: true
                                });
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value: (isUnderwarranty) ? 0 : total,
                                    ignoreFieldChange: true
                                });
                                estimateRec.commitLine('item');
                                return true;
                            });
                            EstRecID = estimateRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            log.debug("EstRecID", EstRecID);
                            if (EstRecID) {
                                record.submitFields({
                                    type: 'customrecord_job_order',
                                    id: parentId,
                                    values: {
                                        'custrecord_customer_quotation_ref': EstRecID
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                        }
                        if (estimateCreated) {
                            var estimateRec = record.load({
                                type: "estimate",
                                id: estimateCreated,
                                isDynamic: true
                            });
                            log.debug('estimateCreated', estimateCreated);
                            var numLines = estimateRec.getLineCount({
                                sublistId: 'item'
                            });
                            for (var i = numLines - 1; i >= 0; i--) {
                                estimateRec.removeLine({
                                    sublistId: 'item',
                                    line: i,
                                    ignoreRecalc: true
                                });
                            }
                            //Creating New lines on Estimate
                            customrecord_jo_particularsSearchObj.run().each(function(result) {
                                var itemId = result.getValue('custrecord_jo_particulars_product');
                                var quantity = result.getValue('custrecord_jo_particulars_qty');
                                var total = result.getValue('custrecord_jo_particulars_total');
                                var rate = result.getValue('custrecord_jo_particulars_unit_price');
                                var taskID = result.getValue('custrecord_jo_particulars_taskiid');
                                var description = result.getValue('custrecord_jo_particulars_description');
                                var pricelevelId = result.getValue('custrecord_discount_level');
                                log.error('rate', rate);
                                var isUnderwarranty = result.getValue('custrecord_is_vendor_approved');
                                estimateRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: itemId,
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                if (quantity) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (pricelevelId) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'price',
                                        value: pricelevelId,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (description) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        value: description,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (taskID) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_job_order_task',
                                        value: taskID,
                                        ignoreFieldChange: true
                                    });
                                }
                                var taskStatus = result.getValue('custrecord_jo_particulars_status');
                                if (taskStatus > 0) {
                                    estimateRec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_job_orders_task_status',
                                        value: taskStatus,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (total == "" || total == undefined || total == " ") {
                                    total = 0;
                                }
                                if (!isUnderwarranty) {
                                    totalPayableAmount = parseFloat(totalPayableAmount) + parseFloat(total);
                                }
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    value: (isUnderwarranty) ? 0 : rate,
                                    ignoreFieldChange: true
                                });
                                estimateRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value: (isUnderwarranty) ? 0 : total,
                                    ignoreFieldChange: true
                                });
                                estimateRec.commitLine('item');
                                return true;
                            });
                            var EstRecID = estimateRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            log.debug("Edit mode EstRecID", EstRecID);
                        }
                        var customrecord_jo_particularsSearchObj = search.create({
                            type: "customrecord_jo_particulars",
                            filters: [
                                ["custrecord_jo_particulars_job_order", "anyof", parentId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_prchase_price_of_vendor",
                                    label: "Purchase Price"
                                }),
                                search.createColumn({
                                    name: "custrecord_jo_particulars_qty",
                                    label: "Qty"
                                })
                            ]
                        });
                        var totalPurchasePrice = 0;
                        customrecord_jo_particularsSearchObj.run().each(function(result) {
                            var amount = result.getValue('custrecord_prchase_price_of_vendor');
                            var qty = result.getValue('custrecord_jo_particulars_qty');
                            if (amount > 0) {
                                amount = amount * qty;
                                totalPurchasePrice = parseFloat(totalPurchasePrice) + parseFloat(amount);
                            }
                            return true;
                        });
                        //setting customer deposit
                        var advancePayment = scriptContext.newRecord.getValue('custrecord_jo_advance_payment');
                        var alreadyEsxistedCustomeDeposit;
                        if (advancePayment > 0) {
                            alreadyEsxistedCustomeDeposit = scriptContext.newRecord.getValue('custrecord_da_jc_customer_deposit_ref');
                            if (alreadyEsxistedCustomeDeposit) {
                                var custDepositRec = record.load({
                                    type: 'customerdeposit',
                                    id: alreadyEsxistedCustomeDeposit
                                })
                                custDepositRec.setValue('payment', advancePayment);
                                custDepositRec.setValue('custbody_job_order_link', scriptContext.newRecord.id);
                                custDepositRec.save();
                            } else {
                                var custDepostRec = record.create({
                                    type: 'customerdeposit'
                                });
                                custDepostRec.setValue('customer', scriptContext.newRecord.getValue('custrecord_jo_company'));
                                custDepostRec.setValue('payment', advancePayment);
                                custDepostRec.setValue('memo', "Paid for the Job Order " + scriptContext.newRecord.getValue('name'));
                                custDepostRec.setValue('custbody_job_order_link', scriptContext.newRecord.id);
                                alreadyEsxistedCustomeDeposit = custDepostRec.save();
                            }
                        }
                        record.submitFields({
                            type: 'customrecord_job_order',
                            id: parentId,
                            values: {
                                'custrecord_total_cost_job_order': addZeroes(totalPurchasePrice.toString()),
                                'custrecord_total_cust_payable_amount': totalPayableAmount,
                                'custrecord_da_jc_customer_deposit_ref': alreadyEsxistedCustomeDeposit
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
                if (deploymentId == "customdeploy_job_transfer_order") {
                    var jobOrderID = scriptContext.newRecord.getValue('custbody_job_order_link');
                    if (jobOrderID) {
                        record.submitFields({
                            type: 'customrecord_job_order',
                            id: jobOrderID,
                            values: {
                                'custrecord_transfer_order_ref': parentId
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
                if (deploymentId == "customdeploy_job_item_receipt") {
                    var jobOrderID = scriptContext.newRecord.getValue('custbody_job_order_link');
                    if (jobOrderID) {
                        record.submitFields({
                            type: 'customrecord_job_order',
                            id: jobOrderID,
                            values: {
                                'custrecord_item_receipt_ref': parentId
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
                if (deploymentId == "customdeploy_job_inv_deploy") {
                    var jobOrderID = scriptContext.newRecord.getValue('custbody_job_order_link');
                    log.debug('Current Invoice Amount', scriptContext.newRecord.getValue('total'));
                    if (jobOrderID) {
                        log.debug('jobOrderID', jobOrderID);
                        //set falg invoice created on estimate
                        var numLines = scriptContext.newRecord.getLineCount({
                            sublistId: 'item'
                        });
                        var jobOrderRec = record.load({
                            type: 'customrecord_job_order',
                            id: jobOrderID
                        })
                        var estimateRec = record.load({
                            type: 'estimate',
                            id: jobOrderRec.getValue('custrecord_customer_quotation_ref')
                        });
                        var customerDepositId = jobOrderRec.getValue('custrecord_da_job_ord_customer_deposit');
                        for (var i = 0; i < numLines; i++) {
                            var invItemID = scriptContext.newRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                            var linecount = estimateRec.getLineCount({
                                sublistId: 'item'
                            });
                            for (var k = 0; k < linecount; k++) {
                                var estimateitemID = estimateRec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: k
                                });
                                if (invItemID == estimateitemID) {
                                    estimateRec.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_job_invoice_created',
                                        value: true,
                                        line: k,
                                        ignoreFieldChange: true
                                    });
                                }
                            }
                        }
                        estimateRec.save();
                        var invoiceSearchObj = search.create({
                            type: "invoice",
                            filters: [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["custbody_job_order_link", "anyof", jobOrderID],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: ['amount']
                        });
                        var searchResultCount = invoiceSearchObj.runPaged().count;
                        log.debug("invoiceSearchObj result count", searchResultCount);
                        var totalInvoiceAmount = 0,
                            invIds = [];
                        invoiceSearchObj.run().each(function(result) {
                            invIds.push(result.id);
                            var amount = result.getValue('amount');
                            totalInvoiceAmount = parseFloat(totalInvoiceAmount) + parseFloat(amount);
                            return true;
                        });
                        var totalCustomerPayableAmount = jobOrderRec.getValue('custrecord_total_cust_payable_amount');
                        var advancePayment = jobOrderRec.getValue('custrecord_jo_advance_payment');
                        var customerPaidAmount = jobOrderRec.getValue('custrecord_job_order_paid_amount');
                        if (customerPaidAmount == "" || customerPaidAmount == undefined) {
                            customerPaidAmount = 0;
                        }
                        log.error('customerPaidAmount', customerPaidAmount);
                        log.error("totalCustomerPayableAmount", totalCustomerPayableAmount + "%%% " + totalInvoiceAmount + "%%% " + "bjfds" + totalCustomerPayableAmount);
                        if (totalInvoiceAmount < totalCustomerPayableAmount) {
                            record.submitFields({
                                type: 'customrecord_job_order',
                                id: jobOrderID,
                                values: {
                                    'custrecord_customer_jo_invoice': parentId,
                                    'custrecord_jo_invoiced_amount': totalInvoiceAmount,
                                    'custrecord_customer_jo_invoice': invIds,
                                    'custrecord_job_order_status': 6 //partially Invoiced
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            record.submitFields({
                                type: 'customrecord_job_order',
                                id: jobOrderID,
                                values: {
                                    'custrecord_customer_jo_invoice': parentId,
                                    'custrecord_jo_invoiced_amount': totalInvoiceAmount,
                                    'custrecord_customer_jo_invoice': invIds,
                                    'custrecord_job_order_status': 10 // fully Invoiced
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        }
                        log.debug("details", advancePayment + " " + customerPaidAmount);
                        if (advancePayment > 0 && (customerPaidAmount < advancePayment)) {
                            log.debug('advancePayment', advancePayment);
                            var applicableAmount = parseFloat(advancePayment) - parseFloat((customerPaidAmount ? customerPaidAmount : 0));
                            log.debug("applicableAmount", applicableAmount);
                            var paymentRec = record.transform({
                                fromType: record.Type.INVOICE,
                                fromId: parentId,
                                toType: record.Type.CUSTOMER_PAYMENT,
                                isDynamic: false
                            });
                            paymentRec.setValue('custbody_job_order_link', jobOrderID);
                            log.debug('depositlinecount', paymentRec.getLineCount('deposit'));
                            for (var k = 0; k < paymentRec.getLineCount('deposit'); k++) {
                                var tranID = paymentRec.getSublistValue({
                                    sublistId: 'deposit',
                                    fieldId: 'doc',
                                    line: k
                                });
                                //log.debug('')
                                log.debug('tranID', tranID + " " + customerDepositId);
                                if (tranID == customerDepositId) {
                                    paymentRec.setSublistValue({
                                        sublistId: 'deposit',
                                        fieldId: 'apply',
                                        line: k,
                                        value: true
                                    });
                                    paymentRec.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'amount',
                                        line: k,
                                        value: applicableAmount
                                    });
                                }
                            }
                            for (var j = 0; j < paymentRec.getLineCount('apply'); j++) {
                                var tranID = paymentRec.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: j
                                });
                                //log.debug('tranID',tranID);
                                if (tranID == parentId) {
                                    paymentRec.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'apply',
                                        line: j,
                                        value: true
                                    });
                                    paymentRec.setSublistValue({
                                        sublistId: 'apply',
                                        fieldId: 'amount',
                                        line: j,
                                        value: applicableAmount
                                    });
                                }
                            }
                            //paymentRec.setValue('payment',applicableAmount);
                            var paymentId = paymentRec.save();
                            //log.debug('paymentId',paymentId)
                        }
                    }
                }
                if (deploymentId == "customdeploy_job_order_cust_payment") {
                    var jobOrderId = scriptContext.newRecord.getValue('custbody_job_order_link');
                    if (jobOrderId) {
                        var customerpaymentSearchObj = search.create({
                            type: "customerpayment",
                            filters: [
                                ["type", "anyof", "CustPymt"],
                                "AND",
                                ["custbody_job_order_link", "anyof", jobOrderId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "amount",
                                    summary: "SUM",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = customerpaymentSearchObj.runPaged().count;
                        log.debug("customerpaymentSearchObj result count", searchResultCount);
                        var totalPaymentAmount = 0;
                        customerpaymentSearchObj.run().each(function(result) {
                            var amount = result.getValue({
                                name: 'amount',
                                summary: search.Summary.SUM
                            });
                            totalPaymentAmount = parseFloat(totalPaymentAmount) + parseFloat(amount);
                            return true;
                        });
                        record.submitFields({
                            type: 'customrecord_job_order',
                            id: jobOrderId,
                            values: {
                                'custrecord_job_order_paid_amount': totalPaymentAmount
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function addZeroes(num) {
            var value = Number(num);
            var res = num.split(".");
            if (res.length == 1 || (res[1].length < 3)) {
                value = value.toFixed(2);
            }
            return value
        }
        return {
            beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });