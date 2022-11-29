/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],

    function(task, search, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var recId = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                var jobCardRec = scriptContext.newRecord;
                log.debug('jobCardRec', type, recId, jobCardRec)
                var invoiceRef = jobCardRec.getValue('custrecord_da_job_cards_invoice_ref');
                log.debug('invoiceRef', invoiceRef);
                if (!invoiceRef) {
                    log.debug('create invoice')
                    var customer = jobCardRec.getValue('custrecord_da_customer');
                    var department = jobCardRec.getValue('custrecord_da_job_card_department');
                    var classId = jobCardRec.getValue('custrecord_da_job_card_class');
                    var location = jobCardRec.getValue('custrecord_da_workshop_location_2');
                    var discountRate = jobCardRec.getValue('custrecord_da_discount_rate');
                    log.debug('discountRate', discountRate);

                    var invoiceRec = record.create({
                        type: 'invoice',
                        isDynamic: true
                    });
                    invoiceRec.setValue('entity', customer);
                    invoiceRec.setValue('department', department);
                    invoiceRec.setValue('class', classId);
                    invoiceRec.setValue('location', location);
                    invoiceRec.setValue('terms', ' ');
                    invoiceRec.setValue('custbody_da_job_card_ref', recId);
                    if (discountRate != 0) {
                        var maintenanceSettingsRec = record.load({
                            type: 'customrecord_da_maintenance_settings',
                            id: '1'
                        });
                        var discountItem = maintenanceSettingsRec.getValue('custrecord_da_discount_item');
                        log.debug('discountItem', discountItem);
                        invoiceRec.setValue('discountitem', discountItem);
                       if(discountRate > 0){
                            discountRate = -(discountRate);
                         log.debug('discountRate', discountRate);
                            log.debug('discountRate',typeof discountRate);
                            invoiceRec.setValue('discountrate', Number(discountRate));
                        } else {
                            invoiceRec.setValue('discountrate', Number(discountRate));
                        }
                    }
                    var sparePartsSearch = search.create({
                        type: 'customrecord_da_job_card_spare_parts',
                        filters: [
                            ['custrecord_da_spare_part_job_card', 'anyof', recId]
                        ],
                        columns: [
                            search.createColumn({
                                name: 'internalid'
                            }),
                            search.createColumn({
                                name: 'custrecord_da_spare_part_item'
                            }),
                            search.createColumn({
                                name: 'custrecord_da_spare_part_price'
                            }),
                            search.createColumn({
                                name: 'custrecord_da_spare_part_kgb_text'
                            }),
                            search.createColumn({
                                name: 'custrecord_da_spare_part_item_type'
                            }),
                            search.createColumn({
                                name: 'custrecord_da_spare_part_new_serial'
                            })

                        ]
                    });
                    sparePartsSearch.run().each(function(result) {
                        var serialNo = result.getValue('custrecord_da_spare_part_new_serial');
                        var type = result.getValue('custrecord_da_spare_part_item_type');
                        var item = result.getValue('custrecord_da_spare_part_item');
                        log.debug('item', item);
                        var amount = result.getValue('custrecord_da_spare_part_price');
                        var kgbText = result.getValue('custrecord_da_spare_part_kgb_text');
                        if (type == 1) {
                            var itemSearch = search.create({
                                type: 'item',
                                filters: [
                                    ['internalid', 'anyOf', item], 'AND',
                                    ['inventorylocation', 'anyOf', location]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: 'locationquantityonhand'
                                    }),
                                    search.createColumn({
                                        name: 'internalid'
                                    })
                                ]
                            });
                            itemSearch.run().each(function(result) {
                                var quantity_on_hand = result.getValue('locationquantityonhand');
                                log.debug('quantity_on_hand',quantity_on_hand);
                                var qty = 1;
                                var internalId = result.getValue('internalid');
                                if (qty > quantity_on_hand || !quantity_on_hand) {
                                    throw new Error('Sorry you cannot create invoice , Some of items do not have quantity available' + ' ' + ':' + internalId + '.');
                                }
                                return true;
                            });
                        }
                        invoiceRec.selectNewLine({
                            sublistId: 'item'
                        });
                        var invItem = invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: item,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        });
                        log.debug('invItem', invItem);
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: 1,
                            ignoreFieldChange: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: location,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: amount,
                            ignoreFieldChange: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            value: amount,
                            ignoreFieldChange: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_trans_job_card_ref',
                            value: recId,
                            ignoreFieldChange: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_kgb_serial_no',
                            value: kgbText,
                            ignoreFieldChange: true
                        });
                        invoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: location,
                            ignoreFieldChange: true
                        });
                        if (serialNo) {
                            log.debug(serialNo);
                            var inventorydetailRec = invoiceRec.getCurrentSublistSubrecord({
                                sublistId: 'item',
                                fieldId: 'inventorydetail'
                            });
                            log.debug('inventorydetailRec', inventorydetailRec);
                            inventorydetailRec.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });
                            inventorydetailRec.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                value: serialNo,
                                ignoreFieldChange: true
                            });
                            inventorydetailRec.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: 1,
                                ignoreFieldChange: true
                            });

                            inventorydetailRec.commitLine({
                                sublistId: 'inventoryassignment'
                            });
                        }
                        invoiceRec.commitLine({
                            sublistId: 'item'
                        });
                        return true;
                    });
                    var inv_id = invoiceRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    record.submitFields({
                        type: 'customrecord_da_job_cards',
                        id: recId,
                        values: {
                            'custrecord_da_job_cards_invoice_ref': inv_id
                        }

                    });
                } else {
                    throw new Error('You must enter at least one line item for this transaction.');
                }

            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };

    });