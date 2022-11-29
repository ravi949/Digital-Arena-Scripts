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
        function beforeLoad(scriptContext) {}
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
                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'item'
                });
                var existedJobCards = scriptContext.newRecord.getValue('custbody_da_link_job_cards');
                log.debug('existedJobCards', lineCount);
                var jobCardIDs = [];
                if (existedJobCards.length > 0) {
                    var itemFulfilRec = record.submitFields({
                        type: 'itemfulfillment',
                        id: scriptContext.newRecord.id,
                        values: {
                            'custbody_da_link_job_cards': jobCardIDs
                        }
                    });
                    for (var j = 0; j < existedJobCards.length; j++) {
                        record.delete({
                            type: 'customrecord_job_order',
                            id: existedJobCards[j]
                        })
                    }
                }
                var lookup = search.lookupFields({
                    type: 'customrecord_da_workshop_settings',
                    id: 1,
                    columns: ['custrecord_da_workshop_manager', 'custrecord_da_workshop_sett_location']
                });
                var jobManager = lookup.custrecord_da_workshop_manager[0].value;
                var workshopLocation = lookup.custrecord_da_workshop_sett_location[0].value;
                var mobileNo = scriptContext.newRecord.getValue('custbody_da_cust_mobile_no');
                var customerAddress = scriptContext.newRecord.getValue('custbody_da_ws_cust_address');
                for (var i = 0; i < lineCount; i++) {
                    log.debug('i',i);
                    var createJobCard = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_create_job_card',
                        line: i
                    });
                    if (createJobCard) {
                        var item = scriptContext.newRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });
                        var itemText = scriptContext.newRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemname',
                            line: i
                        })
                        log.debug('item', item);
                        var serialNos = scriptContext.newRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'serialnumbers',
                            line: i
                        });
                        log.debug(serialNos.length);
                        var index = 0; 
                        if (serialNos.length >= 1) {

                            while (index < serialNos.length) { 
    
                                var jobCardRec = record.create({
                                    type: 'customrecord_job_order'
                                });
                                jobCardRec.setValue('custrecord_job_card_in_out_type', 2);
                                jobCardRec.setValue('custrecord_item_purchase_from', 1);
                                jobCardRec.setValue('custrecord_jo_company', scriptContext.newRecord.getValue('entity'));
                                jobCardRec.setValue('custrecord_work_shop_location', workshopLocation);
                                if (mobileNo) {
                                    jobCardRec.setValue('custrecord_cust_phone_no', mobileNo);
                                }
                                jobCardRec.setValue('custrecord_item_part_no', itemText);
                                jobCardRec.setValue('custrecord_jo_warranty_item', item);
                                jobCardRec.setValue('custrecord_job_manager', jobManager);
                                jobCardRec.setValue('custrecord_jo_priority', 2);
                                jobCardRec.setValue('custrecord_da_job_card_created_from', scriptContext.newRecord.id);
                                jobCardRec.setValue('custrecord_jo_item_sno', serialNos[index]);
                                jobCardRec.setValue('custrecord_jo_customer_complaint', "New purchase - Installation should be done");
                                if (customerAddress) {
                                    jobCardRec.setValue('custrecord_customer_address', customerAddress);
                                }
                                var jobCardId = jobCardRec.save();
                                jobCardIDs.push(jobCardId);
                                index++;
                            }
                        } else {
                            var jobCardRec = record.create({
                                type: 'customrecord_job_order'
                            });
                            jobCardRec.setValue('custrecord_job_card_in_out_type', 2);
                            jobCardRec.setValue('custrecord_item_purchase_from', 1);
                            jobCardRec.setValue('custrecord_jo_company', scriptContext.newRecord.getValue('entity'));
                            jobCardRec.setValue('custrecord_work_shop_location', workshopLocation);
                            if (mobileNo) {
                                jobCardRec.setValue('custrecord_cust_phone_no', mobileNo);
                            }
                            jobCardRec.setValue('custrecord_item_part_no', itemText);
                            jobCardRec.setValue('custrecord_jo_warranty_item', item);
                            jobCardRec.setValue('custrecord_da_job_card_created_from', scriptContext.newRecord.id);
                            jobCardRec.setValue('custrecord_job_manager', jobManager);
                            jobCardRec.setValue('custrecord_jo_priority', 2);
                            jobCardRec.setValue('custrecord_jo_customer_complaint', "New purchase - Installation should be done");
                            if (customerAddress) {
                                jobCardRec.setValue('custrecord_customer_address', customerAddress);
                            }
                            var jobCardId = jobCardRec.save();
                            jobCardIDs.push(jobCardId);
                        }
                    }
                }
                var itemFulfilRec = record.submitFields({
                    type: 'itemfulfillment',
                    id: scriptContext.newRecord.id,
                    values: {
                        'custbody_da_link_job_cards': jobCardIDs
                    }
                });
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