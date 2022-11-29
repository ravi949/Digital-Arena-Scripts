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
                /*var userObj = runtime.getCurrentUser();
                var role = userObj.role;
                log.debug("Internal ID of current user role: " + userObj.role);
                if (scriptContext.type == scriptContext.UserEventType.EDIT && role == 1029){
                   log.debug(userObj.id);
                    scriptContext.newRecord.setValue('custrecord_da_technician',userObj.id);
                }*/
                var form = scriptContext.form;
              var id = scriptContext.newRecord.id;
                if (scriptContext.type == scriptContext.UserEventType.VIEW || scriptContext.type == scriptContext.UserEventType.EDIT) {
                    var status = scriptContext.newRecord.getText('custrecord_da_job_work_status');
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
                    //field.defaultValue = "<script>function myFunction() {  document.getElementsByClassName('listtext uir-list-row-cell').disabled = true;}</script>"; //This is where you would type your script
                }
                //create an inline html field
                var hideFld = scriptContext.form.addField({
                    id: 'custpage_hide_buttons',
                    label: 'not shown - hidden',
                    type: serverWidget.FieldType.INLINEHTML
                });
                //          for every button you want to hide, modify the scr += line
                var scr = "";
                scr += 'jQuery("recmachcustrecord_da_spare_part_job_card__tab.listheadertdleft listheadertextb uir-list-header-td").hide();';
                //          scr += 'jQuery("#addmessage").hide();';
                //          scr += 'jQuery("#addcontact").hide();';
                //          push the script into the field so that it fires and does its handy work
                hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
           ////create buttons///
            if (scriptContext.type == 'view') {
              log.debug('scriptContext.newRecord.id ',scriptContext.newRecord.id);
                       /* scriptContext.form.addButton({
                            id: 'custpage_job_print',
                            label: ' Print TSR',
                            functionName: 'jobprint(' +id+ ')'
                        });
                        scriptContext.form.addButton({
                            id: 'custpage_print_quote',
                            label: ' Print Quote',
                            functionName: 'generateQuotation(' +id+ ')'
                        });*/
                        var button = form.addButton({
                            id: 'custpage_buttonid',
                            label: 'Print Delivery Appointment',
                            functionName: 'printdeliveryAppointment(' +id+ ')'
                        });
                
                        var button = form.addButton({
                            id: 'custpage_buttonid1',
                            label: 'Print Service Appointment',
                            functionName: 'printServiceAppointment(' +id+ ')'
                        });
                        var button = form.addButton({
                            id: 'custpage_buttonid2',
                            label: 'Print Receipt Voucher',
                            functionName: 'receiptVoucher(' +id+ ')'
                        });
              form.clientScriptModulePath = './DA_CS_Job_Card_Validations.js';
                    }
                  
            } 
            catch (ex) {
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
            // log.debug('beforeSubmit', 'beforeSubmit');

            var lc = scriptContext.newRecord.getLineCount('recmachcustrecord_da_spare_part_job_card');

            for (var i = 0; i < lc; i++) {


                var itemId = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                    fieldId: 'custrecord_da_spare_part_item',
                    line: i
                });
                var warrantyStatus = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_spare_part_job_card',
                    fieldId: 'custrecord_da_item_warranty_status',
                    line: i
                });
                var workShopLocation = scriptContext.newRecord.getValue('custrecord_da_job_card_parts_location');
                // console.log(workShopLocation);
                if (itemId) {
                    var settingsRec = record.load({
                        type: 'customrecord_da_maintenance_settings',
                        id: 1
                    });
                    var settingsCurrency = settingsRec.getValue('custrecord_da_salesorder_currency');

                    if (warrantyStatus == 1) {
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
                                    name: "isserialitem",
                                    label: "Is Serialized Item"
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
                               scriptContext.newRecord.setSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_is_serialized',
                                        value: result.getValue({
                                            name: 'isserialitem'
                                        }),
                                        line: i,
                                        ignoreFieldChange: true
                                    });
                                if (pricelevel == 6 && warrantyStatus == 1) {
                                    scriptContext.newRecord.setSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_in_warranty_price',
                                        value: result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        }),
                                        line: i,
                                        ignoreFieldChange: true
                                    });
                                }
                                if (pricelevel == 7 && warrantyStatus == 2) {
                                    scriptContext.newRecord.setSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_da_part_out_of_warranty_price',
                                        value: result.getValue({
                                            name: 'unitprice',
                                            join: "pricing"
                                        }),
                                        line: i,
                                        ignoreFieldChange: true
                                    });
                                }
                                return true;
                            });
                        } else {
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_out_of_warranty_price',
                                value: 0,
                                ignoreFieldChange: true,
                                line: i
                            });
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_in_warranty_price',
                                value: 0,
                                line: i,
                                ignoreFieldChange: true
                            });
                        }

                    }

                    if (warrantyStatus == 2) {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["pricing.pricelevel", "anyof", "6", "7"],
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
                                    name: "isserialitem",
                                    label: "Is Serialized Item"
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
                              scriptContext.newRecord.setSublistValue({
                                        sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                        fieldId: 'custrecord_is_serialized',
                                        value: result.getValue({
                                            name: 'isserialitem'
                                        }),
                                        line: i,
                                        ignoreFieldChange: true
                                    });
                                if (pricelevel == 6) {
                                    inWarrantyPrice = result.getValue({
                                        name: 'unitprice',
                                        join: "pricing"
                                    });

                                }
                                if (pricelevel == 7) {
                                    outWarrantyPrice = result.getValue({
                                        name: 'unitprice',
                                        join: "pricing"
                                    });

                                }

                                return true;
                            });
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_out_of_warranty_price',
                                value: (parseFloat(inWarrantyPrice) - parseFloat(outWarrantyPrice)).toFixed(2),
                                ignoreFieldChange: true,
                                line: i
                            });
                        } else {
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_out_of_warranty_price',
                                value: 0,
                                ignoreFieldChange: true,
                                line: i
                            });
                            scriptContext.newRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_da_spare_part_job_card',
                                fieldId: 'custrecord_da_part_in_warranty_price',
                                value: 0,
                                ignoreFieldChange: true,
                                line: i
                            });
                        }

                    }
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
                //var poCreated = scriptContext.newRecord.getValue('custrecord_job_card_po_ref');
                var toCreated = scriptContext.newRecord.getValue('custrecord_jo_transfer_order_ref');
                var soCreated = scriptContext.newRecord.getValue('custrecord_da_job_sales_order_ref');
                var workDoneStatus = scriptContext.newRecord.getValue('custrecord_da_job_work_status');
                //setting labor cost based on warranty status //in warranty
                var customrecord_da_job_card_spare_partsSearchObj = search.create({
                    type: "customrecord_da_job_card_spare_parts",
                    filters: [
                        ["custrecord_da_spare_part_job_card", "anyof", scriptContext.newRecord.id],
                        "AND",
                        ["custrecord_da_item_warranty_status", "anyof", "1"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                // log.debug("customrecord_da_job_card_spare_partsSearchObj result count",searchResultCount);
                if (searchResultCount == 0) {
                    /* record.submitFields({
                         type: 'customrecord_da_job_cards',
                         id: scriptContext.newRecord.id,
                         values: {
                             'custrecord_da_job_card_labor_cost': 0
                         },
                         options: {
                             enableSourcing: false,
                             ignoreMandatoryFields: true
                         }
                     });*/
                }
              try{
                 var b = search.lookupFields({
                    type: 'customrecord_da_job_card_work_status',
                    id: workDoneStatus,
                    columns: ['parent', 'custrecord_da_send_sms_text']
                });
              }catch(ex){
                log.error(ex.name,ex.message);
              }
               
                // log.debug('b', b.parent.length);
                if (b.parent.length > 0) {
                    if (b.parent[0].value == 1) {
                        var smsEnabaled = record.load({
                            type: 'customrecord_da_maintenance_settings',
                            id: 1
                        }).getValue('custrecord_da_send_sms_to_customers');
                        if (smsEnabaled) {
                            // log.debug('sms Text',b.custrecord_da_send_sms_text);
                            var custName = scriptContext.newRecord.getText('custrecord_da_customer_name');
                            var itemDesc = scriptContext.newRecord.getText('custrecord_da_item_description');
                            var CustomerMobile = scriptContext.newRecord.getText('custrecord_da_customer_mobile');
                            var smsText = "Hi " + custName + ", Your Item : " + itemDesc + " Job Card Status at Service center :" + b.custrecord_da_send_sms_text;
                            // log.debug('smsText',smsText);
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
                    var customrecord_da_job_cardsSearchObj = search.create({
                        type: "customrecord_da_job_cards",
                        filters: [
                            ["custrecord_da_serial_number", "is", scriptContext.newRecord.getValue('custrecord_da_serial_number')]
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
                            ["custrecord_da_spare_part_item_type", "anyof", "1"], "AND", ["custrecord_da_jc_item_brand", "anyof", "360"] //ABM Care
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
                                name: "custrecord_da_is_return",
                                label: "return to apple"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                    // log.debug("customrecord_da_job_card_spare_partsSearchObj result count", searchResultCount);
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
                            //   log.debug('poCreated', poCreated);
                            //  poRec.setValue('custbody_vendor_gsx_no', scriptContext.newRecord.getValue('custrecord_da_gsx_number'));
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
                                /* poRec.setCurrentSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'rate',
                                     value: result.getValue('custrecord_da_spare_part_price'),
                                     ignoreFieldChange: true
                                 });
                                 poRec.setCurrentSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'amount',
                                     value: result.getValue('custrecord_da_spare_part_price'),
                                     ignoreFieldChange: true
                                 });*/
                                poRec.commitLine('item');
                                return true;
                            });
                          try{
                             var poId = poRec.save();
                          }catch(ex){
                            log.error(ex.name,ex.message);
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
                                name: "custrecord_da_is_return",
                                label: "return to apple"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_job_card_spare_partsSearchObj.runPaged().count;
                    log.debug("rrr customrecord_da_job_card_spare_partsSearchObj result count", searchResultCount);
                    /*customrecord_da_job_card_spare_partsSearchObj.filters.pop({"name":"custrecord_spare_part_item_family"});
                    customrecord_da_job_card_spare_partsSearchObj.filters.push(search.createFilter({
                        "name":"custrecord_da_spare_part_item_type",
                        "operator":"noneof",
                        "values":3 //service items
                    }));*/
                    var techinician = scriptContext.newRecord.getValue('custrecord_da_technician');
                    //log.debug('techinician', techinician + " " + searchResultCount + "customrecord_da_job_card_spare_partsSearchObj" + JSON.stringify(customrecord_da_job_card_spare_partsSearchObj));
                    var workStatus = scriptContext.newRecord.getValue('custrecord_da_job_work_status');
                    //if (workStatus == 5) {
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
                                    previousSparePartIds.push(result.getValue('custrecord_da_spare_part_ref_2'));
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
                             /*   var jobtransferRec = record.load({
                                    type: "customrecord_da_job_card_transfer_order",
                                    id: jobCardTransferId,
                                    isDynamic: true
                                });*/
                                customrecord_da_job_card_spare_partsSearchObj.run().each(function(result) {
                                  log.debug('adding');
                                  var rec = record.create({
                                    type :'customrecord_da_spare_part_request_items'
                                  });
                                  rec.setValue('custrecord_da_new_part_job_card', scriptContext.newRecord.id);
                                           rec.setValue('custrecord_techinican_id',techinician);
                                     rec.setValue('custrecord_da_spare_part_ref_2',result.id);
                                     rec.setValue('custrecord_da_transfer_return_to_apple',result.getValue('custrecord_da_is_return'));
                                    rec.setValue('custrecord_item_serialzed',result.getValue('custrecord_is_serialized'));
                                    rec.setValue('custrecord_da_spare_part_requested_item',result.getValue('custrecord_da_spare_part_item'));
                                    rec.setValue('custrecord_da_job_card_transfer_order',jobCardTransferId);
                                  rec.save();
                                    /*jobtransferRec.selectNewLine({
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
                                        fieldId: 'custrecord_techinican_id',
                                        value: techinician,
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
                                        fieldId: 'custrecord_da_transfer_return_to_apple',
                                        value: result.getValue('custrecord_da_is_return')
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_item_serialzed',
                                        value: result.getValue('custrecord_is_serialized')
                                    });
                                    jobtransferRec.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_job_card_transfer_order',
                                        fieldId: 'custrecord_da_spare_part_requested_item',
                                        value: result.getValue('custrecord_da_spare_part_item'),
                                        ignoreFieldChange: false,
                                        forceSyncSourcing: true
                                    });
                                    jobtransferRec.commitLine('recmachcustrecord_da_job_card_transfer_order');*/
                                    return true;
                                });
                              try{
                                // var jobtransferRecId = jobtransferRec.save();
                              }catch(ex){
                                log.error(ex.name,ex.message+" id :"+scriptContext.newRecord.id);
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
                                ["custrecord_da_jc_item_brand", "anyof", "360"], //abm care
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
                       /* var pendingKBBRecieveRec = record.load({
                            type: 'customrecord_da_recieve_kbb',
                            id: pendingKBBRecieveRecId,
                            isDynamic: true
                        });*/
                       
                      try{
                        
                      
                       // var jobtransferRecId = pendingKBBRecieveRec.save();
                        log.debug("jobtransferRecId", jobtransferRecId);
                        }catch(ex){
                        }
                    }
                }
                //Schedular Information Script....
                var taskID = scriptContext.newRecord.getValue('custrecord_da_btob_task_id');
                var parentId = scriptContext.newRecord.id;
                var assignee = scriptContext.newRecord.getValue('custrecord_da_btob_assign_to');
                var comments = scriptContext.newRecord.getValue('custrecord_da_fault_description');
               // var customerLocation = scriptContext.newRecord.getValue('custrecord_da_btob_customer_address');

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

                //var location = scriptContext.newRecord.getValue('custrecord_da_btob_customer_address');

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
                   // eventRec.setValue('location', location);
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
                        type: 'customrecord_da_b2b_job_card',
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
                    //eventRec.setValue('location', location);
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
                        type: 'customrecord_da_b2b_job_card',
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