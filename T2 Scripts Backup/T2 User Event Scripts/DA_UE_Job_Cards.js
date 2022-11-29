/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/ui/message', 'N/runtime', 'N/task', 'N/https', 'N/format'],
    function(search, serverWidget, record, message, runtime, task, https, format) {
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
                var workDoneStatus = scriptContext.newRecord.getValue('custrecord_da_work_done');

                var form = scriptContext.form;
                var id = scriptContext.newRecord.id;
                if (scriptContext.type == scriptContext.UserEventType.VIEW || scriptContext.type == scriptContext.UserEventType.EDIT) {
                    var status = scriptContext.newRecord.getText('custrecord_da_btob_status');
                    var field = scriptContext.form.addField({
                        id: 'custpage_status_field',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Status Field'
                    }).updateLayoutType({
                        layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
                    });
                    var htmlCode = '<head>   </head> <body><div class="uir-record-status">' + status + '</div></body>';
                    var css = '.uir-record-status {display: inline-block;    font-size: 14px;    font-weight: bold;    text-transform: uppercase;    padding: 3px;    background-color: #d5e0ec;    margin-left: 520px;    position: relative;    top: -4px;}';
                    field.defaultValue = "<html>" + htmlCode + "<style>" + css + "</style></html><script type='text/javascript'></script>";
                }
                if (scriptContext.type == scriptContext.UserEventType.VIEW && workDoneStatus == 3) {
                    var field = scriptContext.form.addField({
                        id: 'custpageinjectcode',
                        type: 'INLINEHTML',
                        label: 'Inject Code'
                    });
                    var src = "jQuery('#recmachcustrecord_da_spare_part_job_card__tab').find('tr').find('td:first,td:last').remove()";
                    field.defaultValue = "<script>jQuery(function($){require([], function(){" + src + ";})})</script>"

                }
                //create an inline html field
                var hideFld = scriptContext.form.addField({
                    id: 'custpage_hide_buttons',
                    label: 'not shown - hidden',
                    type: serverWidget.FieldType.INLINEHTML
                });

                var scr = "";
                scr += 'jQuery("recmachcustrecord_da_spare_part_job_card__tab.listheadertdleft listheadertextb uir-list-header-td").hide();';

                hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
                ////create buttons///
                if (scriptContext.type == 'view') {
                    log.debug('scriptContext.newRecord.id ', scriptContext.newRecord.id);

                    var eventId = scriptContext.newRecord.getValue('custrecord_da_jc_delivery_event_id');
                    var taskId = scriptContext.newRecord.getValue('custrecord_da_btob_task_id');
                    if (eventId.length > 0) {
                        var button = form.addButton({
                            id: 'custpage_buttonid',
                            label: 'Print Delivery Appointment',
                            functionName: 'printdeliveryAppointment(' + id + ')'
                        });
                    }
                    if (taskId.length > 0) {
                        var button = form.addButton({
                            id: 'custpage_buttonid1',
                            label: 'Print Service Appointment',
                            functionName: 'printServiceAppointment(' + id + ')'
                        });
                    }
                    var button = form.addButton({
                        id: 'custpage_buttonid2',
                        label: 'Print Receipt Voucher',
                        functionName: 'receiptVoucher(' + id + ')'
                    });
                    /*var button = form.addButton({
                                  id: 'custpage_buttonid3',
                                  label: 'Send Cliam',
                                  functionName: 'SendCliam(' +id+ ')'
                              });*/
                    form.clientScriptModulePath = './DA_CS_Job_Card_Validations.js';
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


            var lc = scriptContext.newRecord.getLineCount('recmachcustrecord_da_spare_part_job_card');
            for (var i = 0; i < lc; i++) {


                var itemId = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                    fieldId: 'custrecord_da_spare_part_item',
                    line: i
                });
                /* var warrantyStatus = scriptContext.newRecord.getSublistValue({
                     sublistId: 'recmachcustrecord_da_spare_part_job_card',
                     fieldId: 'custrecord_da_item_warranty_status',
                     line: i
                 });*/
                var workShopLocation = scriptContext.newRecord.getValue('custrecord_da_job_card_parts_location');

                if (itemId) {

                    var itemSearchObj = search.create({
                        type: "item",
                        filters: [
                            ["internalid", "anyof", itemId],

                        ],
                        columns: [
                            search.createColumn({
                                name: "isserialitem",
                                label: "Is Serialized Item"
                            })
                        ]
                    });
                    var searchResultCount = itemSearchObj.runPaged().count;
                    log.debug("itemSearchObj result count", searchResultCount);

                    itemSearchObj.run().each(function(result) {

                        scriptContext.newRecord.setSublistValue({
                            sublistId: 'recmachcustrecord_da_spare_part_job_card',
                            fieldId: 'custrecord_is_serialized',
                            value: result.getValue({
                                name: 'isserialitem'
                            }),
                            line: i,
                            ignoreFieldChange: true
                        });
                    });
                }
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
                var type = scriptContext.newRecord.type;
                var recId = scriptContext.newRecord.id;
                var toCreated = scriptContext.newRecord.getValue('custrecord_jo_transfer_order_ref');
                var soCreated = scriptContext.newRecord.getValue('custrecord_da_job_sales_order_ref');
                var workDoneStatus = scriptContext.newRecord.getValue('custrecord_da_job_work_status');

                var lc = scriptContext.newRecord.getLineCount('recmachcustrecord_da_spare_part_job_card');
                var setLineCount = record.submitFields({
                    type: type,
                    id: recId,
                    values: {
                        'custrecord_da_spare_part_count': lc
                    }
                });
                var assigneesLength = scriptContext.newRecord.getValue('custrecord_da_btob_assign_to').length;
                log.debug('assigneesLength', assigneesLength);
                var setLineCount = record.submitFields({
                    type: type,
                    id: recId,
                    values: {
                        'custrecord_da_assignees_length': assigneesLength
                    }
                });
                var customrecord_da_job_card_spare_partsSearchObj = search.create({
                    type: "customrecord_da_job_card_spare_parts",
                    filters: [
                        ["custrecord_da_spare_part_job_card", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;

                if (searchResultCount == 0) {

                }
                try {
                    var b = search.lookupFields({
                        type: 'customrecord_da_job_card_work_status',
                        id: workDoneStatus,
                        columns: ['parent', 'custrecord_da_send_sms_text']
                    });
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }


                if (b.parent.length > 0) {
                    if (b.parent[0].value == 1) {
                        var smsEnabaled = record.load({
                            type: 'customrecord_da_maintenance_settings',
                            id: 1
                        }).getValue('custrecord_da_send_sms_to_customers');
                        if (smsEnabaled) {

                            var custName = scriptContext.newRecord.getText('custrecord_da_customer_name');
                            var itemDesc = scriptContext.newRecord.getText('custrecord_da_item_description');
                            var CustomerMobile = scriptContext.newRecord.getText('custrecord_da_customer_mobile');
                            var smsText = "Hi " + custName + ", Your Item : " + itemDesc + " Job Card Status at Service center :" + b.custrecord_da_send_sms_text;

                            if (b.custrecord_da_send_sms_text.length > 0) {
                                //  log.debug('sms sending');
                                var username = "alphastore";
                                var pwd = "Alpha2018";
                                var custId = "1509";
                                var response = https.request({
                                    method: https.Method.GET,
                                    url: 'https://www.smsbox.com/SMSGateway/Services/Messaging.asmx/Http_SendSMS?username=' + username + '&password=' + pwd + '&customerId=' + custId + '&senderText=alpha store&messageBody=' + smsText + '&recipientNumbers=965' + CustomerMobile + '&defdate=&isBlink=false&isFlash=false'
                                });
                                //log.debug('response', response);
                            }
                        }

                    }
                }
                if (true) {
                    //setting previous job cards
                    var item = scriptContext.newRecord.getValue('custrecord_da_item');
                    var customer = scriptContext.newRecord.getValue('custrecord_da_customer');
                    var customrecord_da_job_cardsSearchObj = search.create({
                        type: "customrecord_da_job_cards",
                        filters: [
                            ["custrecord_da_item", "anyof", item], "AND", ["custrecord_da_customer", "anyof", customer]
                        ],
                        columns: []
                    });
                    var searchResultCount = customrecord_da_job_cardsSearchObj.runPaged().count;
                    //  log.debug("customrecord_da_job_cardsSearchObj result count", searchResultCount);
                    var previousJobsArr = [];
                    customrecord_da_job_cardsSearchObj.run().each(function(result) {
                        previousJobsArr.push(result.id);
                        return true;
                    });
                    record.submitFields({
                        type: 'customrecord_da_job_cards',
                        id: scriptContext.newRecord.id,
                        values: {
                            'custrecord_da_previous_job_card_ref': previousJobsArr
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    var customrecord_da_job_card_spare_partsSearchObj = search.create({
                        type: "customrecord_da_job_card_spare_parts",
                        filters: [
                            ["custrecord_da_spare_part_job_card", "anyof", scriptContext.newRecord.id], "AND",
                            ["custrecord_da_spare_part_item_type", "anyof", "1"] //ABM Care
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_spare_part_item",
                                label: "Spare Part"
                            }),
                            search.createColumn({
                                name: "custrecord_da_spare_part_price",
                                label: "Price"
                            }),
                            search.createColumn({
                                name: "custrecord_is_serialized",
                                label: "serailzed"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                    log.debug("customrecord_da_job_card_spare_partsSearchObj result count", searchResultCount);
                    var sparePartRefArr = [];
                    var settingsRec = record.load({
                        type: 'customrecord_da_maintenance_settings',
                        id: 1
                    })
                    var vendorId = settingsRec.getValue('custrecord_da_apple_vendor');
                    var poDays = settingsRec.getValue('custrecord_da_jc_po_days');
                    //Creating po and updating po
                    var countToCreatePO = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                    if (countToCreatePO > 0 && poDays > 0) {

                        var jobCardDate = new Date();
                        var endDate = new Date();
                        endDate.setDate(endDate.getDate() + poDays);
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
                        var purchaseorderSearchObj = search.create({
                            type: "purchaseorder",
                            filters: [
                                ["type", "anyof", "PurchOrd"],
                                "AND",
                                ["trandate", "onorbefore", formattedDateString],
                                "AND",
                                ["custbody_jc_end_date", "onorafter", formattedDateString],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["name", "anyof", vendorId]
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
                        var searchResultCount = purchaseorderSearchObj.runPaged().count;
                        log.debug("purchaseorderSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            var poID;
                            purchaseorderSearchObj.run().each(function(result) {
                                poID = result.id;
                                return true;
                            });
                            log.debug('poID', poID);
                            var poRec = record.load({
                                type: "purchaseorder",
                                id: poID,
                                isDynamic: true
                            });

                            var numLines = poRec.getLineCount({
                                sublistId: 'item'
                            });
                            for (var i = numLines - 1; i >= 0; i--) {
                                var jobcardID = poRec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_da_trans_job_card_ref',
                                    line: i,
                                    ignoreFieldChange: true
                                });
                                //   log.debug('recid', jobcardID);
                                if (jobcardID == scriptContext.newRecord.id) {
                                    poRec.removeLine({
                                        sublistId: 'item',
                                        line: i,
                                        ignoreRecalc: true
                                    });
                                }
                            }
                            customrecord_da_job_card_spare_partsSearchObj.run().each(function(result) {
                                sparePartRefArr.push(result.id);
                                poRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: result.getValue('custrecord_da_spare_part_item'),
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: 1,
                                    ignoreFieldChange: true
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_da_trans_job_card_ref',
                                    value: scriptContext.newRecord.id,
                                    ignoreFieldChange: true
                                });

                                poRec.commitLine('item');
                                return true;
                            });
                            try {
                                var poId = poRec.save();
                            } catch (ex) {
                                log.error(ex.name, ex.message);
                            }

                        } else {
                            var poRec = record.create({
                                type: "purchaseorder",
                                isDynamic: true
                            });
                            poRec.setValue('department', scriptContext.newRecord.getValue('custrecord_da_job_card_department'));
                            poRec.setValue('class', scriptContext.newRecord.getValue('custrecord_da_job_card_class'));
                            poRec.setValue('location', scriptContext.newRecord.getValue('custrecord_da_workshop_location_2'));
                            poRec.setValue('entity', vendorId);
                            poRec.setValue('approvalstatus', "2");
                            poRec.setValue('custbody_jc_end_date', endDate);
                            customrecord_da_job_card_spare_partsSearchObj.run().each(function(result) {
                                sparePartRefArr.push(result.id);
                                poRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: result.getValue('custrecord_da_spare_part_item'),
                                    ignoreFieldChange: false,
                                    forceSyncSourcing: true
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: 1,
                                    ignoreFieldChange: true
                                });
                                poRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_da_trans_job_card_ref',
                                    value: scriptContext.newRecord.id,
                                    ignoreFieldChange: true
                                });
                                /*  poRec.setCurrentSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'amount',
                                     value: result.getValue('custrecord_da_spare_part_price'),
                                     ignoreFieldChange: true
                                 });*/
                                poRec.commitLine('item');
                                return true;
                            });
                            poRec.save();
                        }
                    }
                    var customrecord_da_job_card_spare_partsSearchObj = search.create({
                        type: "customrecord_da_job_card_spare_parts",
                        filters: [
                            ["custrecord_da_spare_part_job_card", "anyof", scriptContext.newRecord.id], "AND",
                            ["custrecord_da_spare_part_item_type", "anyof", "1"], "AND", ["custrecord_da_spare_part_item_type", "noneof", "3"] //invntory items only
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_spare_part_item",
                                label: "Spare Part"
                            }),
                            search.createColumn({
                                name: "custrecord_da_spare_part_price",
                                label: "Price"
                            }),
                            search.createColumn({
                                name: "custrecord_is_serialized",
                                label: "serailzed"
                            }),
                            search.createColumn({
                                name: "custrecord_da_spare_part_new_serial",
                                label: "New Serial"
                            }),

                        ]
                    });
                    var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                    log.debug("rrr customrecord_da_job_card_spare_partsSearchObj result count", searchResultCount);

                    var techinician = scriptContext.newRecord.getValue('custrecord_da_technician');
                    //log.debug('techinician', techinician + " " + searchResultCount + "customrecord_da_job_card_spare_partsSearchObj" + JSON.stringify(customrecord_da_job_card_spare_partsSearchObj));
                    var workStatus = scriptContext.newRecord.getValue('custrecord_da_job_work_status');

                    if (true) {
                        if (techinician && searchResultCount > 0) {
                            var customrecord_da_job_cardsSearchObj = search.create({
                                type: "customrecord_da_job_card_transfer_order",
                                filters: []
                            });
                            var searchResultCount = customrecord_da_job_cardsSearchObj.runPaged().count;
                            //   log.debug("customrecord_da_job_cardsSearchObj result count", searchResultCount);
                            var jobCardTransferId;
                            if (searchResultCount > 0) {
                                customrecord_da_job_cardsSearchObj.run().each(function(result) {
                                    jobCardTransferId = result.id;
                                    //return true;
                                });
                                var customrecord_da_spare_part_request_itemsSearchObj = search.create({
                                    type: "customrecord_da_spare_part_request_items",
                                    filters: [
                                        ["custrecord_da_new_part_job_card", "anyof", scriptContext.newRecord.id]
                                    ],
                                    columns: [search.createColumn({
                                        name: "custrecord_da_spare_part_ref_2",
                                        label: "Spare part #"
                                    })]
                                });
                                var previousSparePartIds = [];
                                customrecord_da_spare_part_request_itemsSearchObj.run().each(function(result) {
                                    record.delete({
                                        type: 'customrecord_da_spare_part_request_items',
                                        id: result.id
                                    })
                                    //----  previousSparePartIds.push(result.getValue('custrecord_da_spare_part_ref_2'));
                                    return true;
                                });
                                customrecord_da_job_card_spare_partsSearchObj.filters.push(search.createFilter({
                                    "name": "custrecord_da_item_received",
                                    "operator": "is",
                                    "values": false
                                }));
                                //     log.debug('previousSparePartIds', previousSparePartIds);
                                if (previousSparePartIds.length > 0) {
                                    customrecord_da_job_card_spare_partsSearchObj.filters.push(search.createFilter({
                                        "name": "internalid",
                                        "operator": "noneof",
                                        "values": previousSparePartIds
                                    }));
                                }

                                customrecord_da_job_card_spare_partsSearchObj.run().each(function(result) {
                                    log.debug('adding');
                                    var rec = record.create({
                                        type: 'customrecord_da_spare_part_request_items'
                                    });
                                    rec.setValue('custrecord_da_new_part_job_card', scriptContext.newRecord.id);
                                    rec.setValue('custrecord_techinican_id', techinician);
                                    rec.setValue('custrecord_da_spare_part_ref_2', result.id);
                                    //rec.setValue('custrecord_da_transfer_return_to_apple',result.getValue('custrecord_da_is_return'));
                                    rec.setValue('custrecord_item_serialzed', result.getValue('custrecord_is_serialized'));
                                    rec.setValue('custrecord_da_spare_part_requested_item', result.getValue('custrecord_da_spare_part_item'));
                                    rec.setValue('custrecord_da_job_card_transfer_order', jobCardTransferId);
                                    var SerialNo = result.getValue('custrecord_da_spare_part_new_serial');
                                    if (SerialNo) {
                                        rec.setValue('custrecord_da_transfer_serial_no', SerialNo);
                                    }
                                    rec.save();

                                    return true;
                                });
                                try {
                                    // var jobtransferRecId = jobtransferRec.save();
                                } catch (ex) {
                                    log.error(ex.name, ex.message + " id :" + scriptContext.newRecord.id);
                                }

                            } else {
                                var jobtransferRec = record.create({
                                    type: 'customrecord_da_job_card_transfer_order',
                                    isDynamic: true
                                });
                                customrecord_da_job_card_spare_partsSearchObj.run().each(function(result) {
                                    jobtransferRec.selectNewLine({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order'
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_da_new_part_job_card',
                                        value: scriptContext.newRecord.id,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_da_spare_part_ref_2',
                                        value: result.id
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_techinican_id',
                                        value: techinician,
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_da_spare_part_requested_item',
                                        value: result.getValue('custrecord_da_spare_part_item'),
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_item_serialzed',
                                        value: result.getValue('custrecord_is_serialized')
                                    });
                                    jobtransferRec.commitLine('recmachcustrecord_da_job_card_transfer_order');
                                    return true;
                                });
                                var jobtransferRecId = jobtransferRec.save();
                            }
                        }
                        //code for pending recieving
                        var customrecord_da_job_card_spare_partsSearchObj = search.create({
                            type: "customrecord_da_job_card_spare_parts",
                            filters: [
                                ["custrecord_da_spare_part_job_card", "anyof", scriptContext.newRecord.id],
                                "AND",
                                [
                                    ["custrecord_is_serialized", "is", "F"], "OR", [
                                        ["custrecord_is_serialized", "is", "T"]
                                    ]
                                ]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_spare_part_item",
                                    label: "Spare Part"
                                })

                            ]
                        });
                        var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                        log.audit("result count", searchResultCount);
                        if (sparePartRefArr.length > 0) {
                            var customrecord_da_pending_receiving_kbbSearchObj = search.create({
                                type: "customrecord_da_pending_receiving_kbb",
                                filters: [
                                    ["custrecord_da_spare_part_ref_kbb", "anyof", sparePartRefArr]
                                ],
                            });
                            customrecord_da_pending_receiving_kbbSearchObj.run().each(function(result) {
                                record.delete({
                                    type: 'customrecord_da_pending_receiving_kbb',
                                    id: result.id
                                })
                                return true;
                            });
                        }
                        var pendingKBBRecieveRecId = 1;

                        try {



                            log.debug("jobtransferRecId", jobtransferRecId);
                        } catch (ex) {}
                    }
                }
                //Schedular Information Script....
                var taskID = scriptContext.newRecord.getValue('custrecord_da_btob_task_id');
                var parentId = scriptContext.newRecord.id;
                var assignee = scriptContext.newRecord.getValue('custrecord_da_btob_assign_to');
                var comments = scriptContext.newRecord.getValue('custrecord_da_fault_description');


                var timeFrom = scriptContext.newRecord.getValue('custrecord_da_btob_incident_time');

                if (timeFrom) {
                    timeFrom = format.parse({
                        value: timeFrom,
                        type: format.Type.TIMEOFDAY
                    });
                    var timeTo = scriptContext.newRecord.getValue('custrecord_da_aj_appointment_time_to');
                    timeTo = format.parse({
                        value: timeTo,
                        type: format.Type.TIMEOFDAY
                    });
                }
                var assigneeText = scriptContext.newRecord.getText('custrecord_da_btob_assign_to');
                log.debug('assigneeText', assigneeText);
                var date = scriptContext.newRecord.getValue('custrecord_da_incident_date');



                var appoinmentDate = scriptContext.newRecord.getValue('custrecord_da_incident_date');

                var organizer = scriptContext.newRecord.getValue('custrecord_da_receiptionalist');

                var taskIds = [];
                var jobId = scriptContext.newRecord.getValue('name');

                var title = "Service Appoinment -" + parentId + " (" + assigneeText + " )";
                log.debug(jobId, title);

                if (taskID.length == 0 && assignee.length > 0) {

                    log.debug('assignee', assignee[i]);

                    var eventRec = record.create({
                        type: 'calendarevent',
                        isDynamic: true
                    });

                    eventRec.setValue('title', title);
                    eventRec.removeLine({
                        sublistId: 'attendee',
                        line: 0
                    });
                    eventRec.setValue('accesslevel', "PUBLIC");
                    eventRec.setValue('organizer', organizer);
                    eventRec.setValue('custevent_da_event_job_card_ref', parentId);

                    eventRec.setValue('startdate', date);
                    eventRec.setValue('starttime', timeFrom);
                    eventRec.setValue('endtime', timeTo);
                    eventRec.setValue('message', scriptContext.newRecord.getValue('custrecord_da_fault_description'));

                    for (var i = 0; i < assignee.length; i++) {
                        log.debug('assignee', assignee[i]);
                        eventRec.selectNewLine({
                            sublistId: 'attendee'
                        });
                        eventRec.setCurrentSublistValue({
                            sublistId: 'attendee',
                            fieldId: 'attendee',
                            value: assignee[i]
                        });
                        eventRec.setCurrentSublistValue({
                            sublistId: 'attendee',
                            fieldId: 'response',
                            value: "ACCEPTED"
                        });
                        eventRec.commitLine({
                            sublistId: 'attendee'
                        });
                    }
                    eventRec.selectNewLine({
                        sublistId: 'resource'
                    });
                    eventRec.setCurrentSublistValue({
                        sublistId: 'resource',
                        fieldId: 'resource',
                        value: 1
                    });
                    eventRec.setCurrentSublistValue({
                        sublistId: 'resource',
                        fieldId: 'availability',
                        value: "RESERVED"
                    });
                    eventRec.commitLine({
                        sublistId: 'resource'
                    });
                    var eventId = eventRec.save();
                    taskIds.push(eventId);

                }
                if (taskIds.length > 0) {
                    record.submitFields({
                        type: 'customrecord_da_job_cards',
                        id: parentId,
                        values: {
                            'custrecord_da_btob_task_id': taskIds
                        }
                    });
                }

                //Delivery Appointment Script....
                var deliverEventId = scriptContext.newRecord.getValue('custrecord_da_jc_delivery_event_id');
                var deliveryDate = scriptContext.newRecord.getValue('custrecord_da_job_appointment_date');
                var deliveryFromTime = scriptContext.newRecord.getValue('custrecord_da_job_appointment_time');
                var deliveryToTime = scriptContext.newRecord.getValue('custrecord_da_job_appointment_time_to');
                var deliveryAssignTo = scriptContext.newRecord.getValue('custrecord_da_job_card_assign_to');

                if (!deliverEventId && deliveryAssignTo.length > 0) {

                    if (deliveryFromTime) {
                        deliveryFromTime = format.parse({
                            value: deliveryFromTime,
                            type: format.Type.TIMEOFDAY
                        });
                        deliveryToTime = format.parse({
                            value: deliveryToTime,
                            type: format.Type.TIMEOFDAY
                        });
                    }

                    var title = "Delivery Appointment -" + parentId + " (" + assigneeText + " )";

                    var eventRec = record.create({
                        type: 'calendarevent',
                        isDynamic: true
                    });

                    eventRec.setValue('title', title);
                    eventRec.removeLine({
                        sublistId: 'attendee',
                        line: 0
                    });
                    eventRec.setValue('accesslevel', "PUBLIC");
                    eventRec.setValue('organizer', organizer);

                    eventRec.setValue('custevent_da_event_job_card_ref', parentId);
                    eventRec.setValue('startdate', deliveryDate);
                    eventRec.setValue('starttime', deliveryFromTime);
                    eventRec.setValue('endtime', deliveryToTime);
                    eventRec.setValue('message', scriptContext.newRecord.getValue('custrecord_da_fault_description'));

                    for (var i = 0; i < deliveryAssignTo.length; i++) {
                        log.debug('assignee', deliveryAssignTo[i]);
                        eventRec.selectNewLine({
                            sublistId: 'attendee'
                        });
                        eventRec.setCurrentSublistValue({
                            sublistId: 'attendee',
                            fieldId: 'attendee',
                            value: deliveryAssignTo[i]
                        });
                        eventRec.setCurrentSublistValue({
                            sublistId: 'attendee',
                            fieldId: 'response',
                            value: "ACCEPTED"
                        });
                        eventRec.commitLine({
                            sublistId: 'attendee'
                        });
                    }
                    eventRec.selectNewLine({
                        sublistId: 'resource'
                    });
                    eventRec.setCurrentSublistValue({
                        sublistId: 'resource',
                        fieldId: 'resource',
                        value: 1
                    });
                    eventRec.setCurrentSublistValue({
                        sublistId: 'resource',
                        fieldId: 'availability',
                        value: "RESERVED"
                    });
                    eventRec.commitLine({
                        sublistId: 'resource'
                    });
                    var eventId = eventRec.save();

                    record.submitFields({
                        type: 'customrecord_da_job_cards',
                        id: parentId,
                        values: {
                            'custrecord_da_jc_delivery_event_id': eventId
                        }
                    });

                }

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });