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
                var recType = scriptContext.newRecord.type;
                log.debug('recType', recType);
                var recId = scriptContext.newRecord.id;
                log.debug('recId', recId);
                var invAgingRec = record.load({
                    type: recType,
                    id: recId
                });
                var itemCategory = scriptContext.newRecord.getValue('custrecord_da_invenotry_aging_item_categ');
                log.debug('itemCategory',itemCategory);
                var itemName = scriptContext.newRecord.getValue('custrecord_da_inventory_aging_item');
                log.debug('itemName',itemName);
                var bucketQty0_12 = scriptContext.newRecord.getValue('custrecord_da_invt_less_12_buck_qty');
                log.debug('bucketQty0_12',bucketQty0_12);
                var bucketQty0_12_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_less_12_buck_amt');
                log.debug('bucketQty0_12_Amt',bucketQty0_12_Amt);
                var bucketQty13_24 = scriptContext.newRecord.getValue('custrecord_da_invt_13_24_buck_qty');
                log.debug('bucketQty13_24',bucketQty13_24);
                var bucketQty13_24_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_13_24_buck_amt');
                log.debug('bucketQty13_24_Amt',bucketQty13_24_Amt);
                var bucketQty25_36 = scriptContext.newRecord.getValue('custrecord_da_invt_25_36_buck_qty');
                log.debug('bucketQty25_36',bucketQty25_36);
                var bucketQty25_36_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_25_36_buck_amt');
                log.debug('bucketQty25_36_Amt',bucketQty25_36_Amt);
                var bucketQty37_48 = scriptContext.newRecord.getValue('custrecord_da_invt_37_48_buck_qty');
                log.debug('bucketQty37_48',bucketQty37_48);
                var bucketQty37_48_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_37_48_buck_amt');
                log.debug('bucketQty37_48_Amt',bucketQty37_48_Amt);
                var bucketQty48_60 = scriptContext.newRecord.getValue('custrecord_da_invt_48_60_buck_qty');
                log.debug('bucketQty48_60',bucketQty48_60);
                var bucketQty48_60_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_48_60_buck_amt');
                log.debug('bucketQty48_60_Amt',bucketQty48_60_Amt);
                var bucketQty61_72 = scriptContext.newRecord.getValue('custrecord_da_invt_61_72_buck_qty');
                log.debug('bucketQty61_72',bucketQty61_72);
                var bucketQty61_72_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_61_72_buck_amt');
                log.debug('bucketQty61_72_Amt',bucketQty61_72_Amt);
                var bucketQty73_84 = scriptContext.newRecord.getValue('custrecord_da_invt_73_84_buck_qty');
                log.debug('bucketQty73_84',bucketQty73_84);
                var bucketQty73_84_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_73_84_buck_amt');
                log.debug('bucketQty73_84_Amt',bucketQty73_84_Amt);
                var bucketQty85_96 = scriptContext.newRecord.getValue('custrecord_da_invt_85_96_buck_qty');
                log.debug('bucketQty85_96',bucketQty85_96);
                var bucketQty85_96_Amt = scriptContext.newRecord.getValue('custrecord_da_invt_85_96_buck_amt');
                log.debug('bucketQty85_96_Amt',bucketQty85_96_Amt);
                var inventorySettingsRec = search.create({
                    type: "customrecord_da_invent_aging_provision",
                    filters:
                            [
                                ["custrecord_da_aging_category",'anyof',itemCategory]
                                ],
                    columns: [
                             'custrecord_da_invent_aging_subsidiary', 'custrecord_da_invent_provision_acco', 'custrecord_da_invent_provision_expense', 'custrecord_da_bucket_0_12','custrecord_da_bucket_13_24', 'custrecord_da_bucket_25_36', 'custrecord_da_bucket_37_48','custrecord_da_bucket_49_60', 'custrecord_da_bucket_61_72', 'custrecord_da_bucket_73_84', 'custrecord_da_bucket_85_96'
                    ]
                });
                var count = inventorySettingsRec.runPaged().count;
                log.debug('count',count);
                var amount = 0;
                inventorySettingsRec.run().each(function(result){
                    var subsidiaryId = result.getValue('custrecord_da_invent_aging_subsidiary');
                    log.debug('subsidiaryId',subsidiaryId);
                    var creditAccount = result.getValue('custrecord_da_invent_provision_acco');
                    log.debug('creditAccount',creditAccount);
                    var debitAccount = result.getValue('custrecord_da_invent_provision_expense');
                    log.debug('debitAccount',debitAccount);
                    var bucket0_12 = result.getValue('custrecord_da_bucket_0_12');
                    log.debug('bucket0_12',bucket0_12);
                    var bucket13_24 = result.getValue('custrecord_da_bucket_13_24');
                    log.debug('bucket13_24',bucket13_24);
                    var bucket25_36 = result.getValue('custrecord_da_bucket_25_36');
                    log.debug('bucket25_36',bucket25_36);
                    var bucket37_48 = result.getValue('custrecord_da_bucket_37_48');
                    log.debug('bucket37_48',bucket37_48);
                    var bucket49_60 = result.getValue('custrecord_da_bucket_49_60');
                    log.debug('bucket49_60',bucket49_60);
                    var bucket61_72 = result.getValue('custrecord_da_bucket_61_72');
                    log.debug('bucket61_72',bucket61_72);
                    var bucket73_84 = result.getValue('custrecord_da_bucket_73_84');
                    log.debug('bucket73_84',bucket73_84);
                    var bucket85_96 = result.getValue('custrecord_da_bucket_85_96');
                    log.debug('bucket85_96',bucket85_96);
                    if(bucketQty0_12){
                        amount = parseFloat(bucketQty0_12_Amt) *(bucket0_12/100);
                    }
                    if(bucketQty13_24){
                        amount = parseFloat(bucketQty13_24_Amt) *(bucket13_24/100);
                    }
                    if(bucketQty25_36){
                        amount = parseFloat(bucketQty25_36_Amt) *(bucket25_36/100);
                    }
                    if(bucketQty37_48){
                        amount = parseFloat(bucketQty37_48_Amt) *(bucket37_48/100);
                    }
                    if(bucketQty48_60){
                        amount = parseFloat(bucketQty48_60_Amt) *(bucket49_60/100);
                    }
                    if(bucketQty61_72){
                        amount = parseFloat(bucketQty61_72_Amt) *(bucket61_72/100);
                    }
                    if(bucketQty73_84){
                        amount = parseFloat(bucketQty73_84_Amt) *(bucket73_84/100);
                    }
                    if(bucketQty85_96){
                        amount = parseFloat(bucketQty85_96_Amt) *(bucket85_96/100);
                    }
                    
                    log.debug('amount',amount);
                    var invAgingProvision = record.create({
                            type: 'customtransaction_da_iventory_aging_prov',
                            isDynamic: true
                        });
                    invAgingProvision.setValue('subsidiary',subsidiaryId);
                    invAgingProvision.setValue('custbody_da_provision_item',itemName);

                    invAgingProvision.selectNewLine({
                        sublistId: 'line'
                    });
                    invAgingProvision.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: creditAccount
                    });
                    invAgingProvision.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: Number(amount).toFixed(2)
                    });
                    invAgingProvision.commitLine({
                        sublistId: 'line'
                    });

                    invAgingProvision.selectNewLine({
                        sublistId: 'line'
                    });
                    invAgingProvision.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: debitAccount
                    });
                    invAgingProvision.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: Number(amount).toFixed(2)
                    });
                    invAgingProvision.commitLine({
                        sublistId: 'line'
                    });
                    invAgingProvision.setValue('custbody_da_created_from_lclg',recId);
                    var invAgingProvisionRec = invAgingProvision.save({
                        ignoreMandatoryFields: true
                    });
                    log.debug('invAgingProvisionRec',invAgingProvisionRec);
                    invAgingRec.setValue('custrecord_da_invt_provi_gl_reference',invAgingProvisionRec);
                    var invAgingRecId = invAgingRec.save();
                    log.debug('invAgingRecId',invAgingRecId);
                    return true;
                });
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });