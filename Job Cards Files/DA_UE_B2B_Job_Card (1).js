/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/format'],
    function(search, serverWidget, record, format) {
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
                var id = scriptContext.newRecord.id;
                var form = scriptContext.form;

                var jobType = scriptContext.newRecord.getValue('custrecord_da_aj_job_type');

                if (scriptContext.type == 'view') {
                    if (jobType == 2) {
                        scriptContext.form.addButton({
                            id: 'custpage_job_print',
                            label: ' Print TSR',
                            functionName: 'jobprint(' + scriptContext.newRecord.id + ')'
                        });
                    }

                    var quoteExists = scriptContext.newRecord.getValue('custrecord_da_b2b_jc_quote_ref');
                    if (quoteExists) {
                        scriptContext.form.addButton({
                            id: 'custpage_print_quote',
                            label: ' Print Quote',
                            functionName: 'generateQuotation(' + scriptContext.newRecord.getValue('custrecord_da_b2b_jc_quote_ref') + ')'
                        });
                    }

                    var assignTo = scriptContext.newRecord.getValue('custrecord_da_btob_assign_to');

                    var deliveryAssign = scriptContext.newRecord.getValue('custrecord_da_job_card_assign_to');
                    if (deliveryAssign.length > 0) {
                        var button = form.addButton({
                            id: 'custpage_buttonid',
                            label: 'Print Delivery Appointment',
                            functionName: 'jobprint1(' + scriptContext.newRecord.id + ')'
                        });
                    }

                    if (assignTo.length > 0) {
                        var button = form.addButton({
                            id: 'custpage_buttonid1',
                            label: 'Print Service Appointment',
                            functionName: 'jobprint2(' + scriptContext.newRecord.id + ')'
                        });
                    }

                    if (jobType == 1) {
                        var button = form.addButton({
                            id: 'custpage_buttonid2',
                            label: 'Print Receipt Voucher',
                            functionName: 'jobprint3(' + scriptContext.newRecord.id + ')'
                        });
                    }




                    scriptContext.form.clientScriptModulePath = './DA_CS_B2B_Job_Card.js';


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
            try {

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
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
                var taskID = scriptContext.newRecord.getValue('custrecord_da_btob_task_id');
                var parentId = scriptContext.newRecord.id;
                var assignee = scriptContext.newRecord.getValue('custrecord_da_btob_assign_to');
                var comments = scriptContext.newRecord.getValue('custrecord_da_btob_customer_complaint');
                var customerLocation = scriptContext.newRecord.getValue('custrecord_da_btob_customer_address');

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

                var location = scriptContext.newRecord.getValue('custrecord_da_btob_customer_address');

                var appoinmentDate = scriptContext.newRecord.getValue('custrecord_da_incident_date');

                var organizer = scriptContext.newRecord.getValue('custrecord_da_b_to_b_receptionist');

                var taskIds = [];
                var jobId = scriptContext.newRecord.getValue('name');

                var title ="Service Appoinment -"+ parentId +" ("+assigneeText +" )";
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
                    eventRec.setValue('location', location);
                    eventRec.setValue('startdate', date);
                    eventRec.setValue('starttime', timeFrom);
                    eventRec.setValue('endtime', timeTo);
                    eventRec.setValue('message', scriptContext.newRecord.getValue('custrecord_da_btob_customer_complaint'));

                    for(var i = 0 ; i < assignee.length ; i++){
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

                var deliverEventId = scriptContext.newRecord.getValue('custrecord_da_jc_delivery_event_id');
                var deliveryDate = scriptContext.newRecord.getValue('custrecord_da_job_appointment_date');
                var deliveryFromTime = scriptContext.newRecord.getValue('custrecord_da_job_appointment_time');
                var deliveryToTime = scriptContext.newRecord.getValue('custrecord_da_job_appointment_time_to');
                var deliveryAssignTo = scriptContext.newRecord.getValue('custrecord_da_job_card_assign_to');

                if(!deliverEventId && deliveryAssignTo.length > 0){

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

                    var title = "Delivery Appointment -" + parentId +" ("+assigneeText +" )";

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
                    eventRec.setValue('location', location);
                   eventRec.setValue('custevent_da_event_job_card_ref', parentId);
                    eventRec.setValue('startdate', deliveryDate);
                    eventRec.setValue('starttime', deliveryFromTime);
                    eventRec.setValue('endtime', deliveryToTime);
                    eventRec.setValue('message', scriptContext.newRecord.getValue('custrecord_da_btob_customer_complaint'));

                    for(var i = 0 ; i < deliveryAssignTo.length ; i++){
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
                
                var advancePayment = scriptContext.newRecord.getValue('custrecord_da_b2b_job_advance_payment');
                var alreadyEsxistedCustomeDeposit;
                if (advancePayment > 0) {
                    alreadyEsxistedCustomeDeposit = scriptContext.newRecord.getValue('custrecord_da_b2b_jc_cd_ref');
                    if (alreadyEsxistedCustomeDeposit) {
                        var custDepositRec = record.load({
                            type: 'customerdeposit',
                            id: alreadyEsxistedCustomeDeposit
                        })
                        custDepositRec.setValue('payment', advancePayment);
                        //custDepositRec.setValue('custbody_job_order_link', scriptContext.newRecord.id);
                        custDepositRec.save();
                    } else {
                        var custDepostRec = record.create({
                            type: 'customerdeposit'
                        });
                        custDepostRec.setValue('customer', scriptContext.newRecord.getValue('custrecord_da_b_to_b_customer'));
                        custDepostRec.setValue('payment', advancePayment);
                        custDepostRec.setValue('undepfunds', "T");
                        custDepostRec.setValue('memo', "Paid for the Job Card " + scriptContext.newRecord.getValue('name'));
                        custDepostRec.setValue('custbody_da_b2b_job_order_ref', scriptContext.newRecord.id);
                        alreadyEsxistedCustomeDeposit = custDepostRec.save();
                    }
                    record.submitFields({
                        type: 'customrecord_da_b2b_job_card',
                        id: parentId,
                        values: {
                            'custrecord_da_b2b_jc_cd_ref': alreadyEsxistedCustomeDeposit
                        }
                    })
                }
                //Check if estimate record already created or not
                var totalPayableAmount = 0;
                var estimateCreated = scriptContext.newRecord.getValue('custrecord_da_b2b_jc_quote_ref');
                var EstRecID;
                var customrecord_da_btob_required_servicsSearchObj = search.create({
                    type: "customrecord_da_btob_required_servics",
                    filters: [
                        ["custrecord_da_btob_parent2", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_btob_parent2",
                            label: "Parent"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_service",
                            label: "Service/Item"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_decription",
                            label: "Description"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_quantity",
                            label: "Quantity"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_unit_price",
                            label: "Unit Price"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_total",
                            label: "Total"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_item_type",
                            label: "Item Type"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_warranty2",
                            label: "Is It Warranty?"
                        }),
                        search.createColumn({
                            name: "custrecord_da_btob_parts_issued",
                            label: "Parts Issued?"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_btob_required_servicsSearchObj.runPaged().count;
                log.debug("customrecord_da_btob_required_servicsSearchObj result count", searchResultCount);
                if (searchResultCount > 0) {
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
                    } else {
                        var estimateRec = record.create({
                            type: "estimate",
                            isDynamic: true
                        });
                        // estimateRec.setValue('class', scriptContext.newRecord.getValue('custrecord_da_btob_business_unit'));
                        estimateRec.setValue('customform', 232);
                        estimateRec.setValue('entity', scriptContext.newRecord.getValue('custrecord_da_b_to_b_customer'));
                        estimateRec.setValue('tobeemailed', false);
                        estimateRec.setValue('email', '');
                        estimateRec.setValue('custbody_da_b2b_job_order_ref', scriptContext.newRecord.id);
                        var customerComplaint = scriptContext.newRecord.getValue('custrecord_da_job_service_details');
                        if (customerComplaint) {
                            estimateRec.setValue('memo', customerComplaint);
                        }
                        var location = scriptContext.newRecord.getValue('custrecord_da_btob_workshop_loc');
                        estimateRec.setValue('location', location);
                    }
                    customrecord_da_btob_required_servicsSearchObj.run().each(function(result) {
                        var itemId = result.getValue('custrecord_da_btob_service');
                        var description = result.getValue('custrecord_da_btob_decription');
                        var quantity = result.getValue('custrecord_da_btob_quantity');
                        var isUnderwarranty = result.getValue('custrecord_da_btob_warranty2');
                        var rate = result.getValue('custrecord_da_btob_unit_price');
                        var total = result.getValue('custrecord_da_btob_total');
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
                    try {
                        var estimateRecId = estimateRec.save();
                    } catch (ex) {
                        log.error(ex.name, ex.message);
                    }
                    log.debug('estimateRecId', estimateRecId);
                    record.submitFields({
                        type: 'customrecord_da_b2b_job_card',
                        id: parentId,
                        values: {
                            'custrecord_da_b2b_jc_quote_ref': estimateRecId,
                            'custrecord_da_total_customer_payable_amo': totalPayableAmount
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