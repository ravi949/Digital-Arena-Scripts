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
                
                var fromLocation = scriptContext.newRecord.getValue('location');
                log.debug('fromLocation',fromLocation);
                var subsidiaryId = scriptContext.newRecord.getValue('subsidiary');
                log.debug('subsidiaryId',subsidiaryId);
                var lineCount = scriptContext.newRecord.getLineCount('item');
                log.debug('lineCount',lineCount);
                var prodSettingsRec = record.load({
                    type: 'customrecord_da_production_settings',
                    id: 1 
                });
                var prodSetLocation = prodSettingsRec.getValue('custrecord_da_prod_plan_location');
                log.debug('prodSetLocation',prodSetLocation);
                var overRideTOCheckbox = prodSettingsRec.getValue('custrecord_da_prod_plan_avail_to');
                log.debug('overRideTOCheckbox',overRideTOCheckbox);
                
                if(prodSetLocation == fromLocation){
                    var prodPlanOrderRec = record.create({
                    type: 'customsale_da_production_order',
                    isDynamic: true
                });
                    log.debug('prodPlanOrderRec',prodPlanOrderRec);
                prodPlanOrderRec.setValue('entity',"842");
                prodPlanOrderRec.setValue('subsidiary',subsidiaryId);
                prodPlanOrderRec.setValue('location',fromLocation);
                prodPlanOrderRec.setValue('custbody_da_transfer_order_reference',recId);
                for(var i = 0; i < lineCount; i++){
                    var item = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    log.debug('item',item);
                    var quantity = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    log.debug('quantity',quantity);
                    var availQty = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityavailable',
                        line: i
                    });
                    log.debug('availQty',availQty);
                    var backOrderQty = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'backordered',
                        line: i
                    });
                    log.debug('backOrderQty',backOrderQty);
                    var units = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: i
                    });
                    log.debug('units',units);

                    if(overRideTOCheckbox == false && quantity > availQty){
                        quantity = (parseFloat(quantity) - parseFloat(availQty));
                        backOrderQty = quantity;

                    prodPlanOrderRec.selectNewLine({
                        sublistId: 'item'
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: item
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: quantity
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'backordered',
                        value: backOrderQty
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        value: units
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: "0.00"
                    });
                    prodPlanOrderRec.commitLine({
                        sublistId: 'item'
                    });
                    } else if(overRideTOCheckbox == true){
                        prodPlanOrderRec.selectNewLine({
                        sublistId: 'item'
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: item
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: quantity
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'backordered',
                        value: backOrderQty
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        value: units
                    });
                    prodPlanOrderRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: "0.00"
                    });
                    prodPlanOrderRec.commitLine({
                        sublistId: 'item'
                    });
                    } else {
                        log.debug('else');
                    }
                    
               }
                    
                    var prodPlanOrderRecId = prodPlanOrderRec.save();
                    log.debug('prodPlanOrderRecId',prodPlanOrderRecId);
                    scriptContext.newRecord.setValue('custbody_da_prod_plan_order_ref',prodPlanOrderRecId);
                }
                if(prodPlanOrderRecId){
                    scriptContext.newRecord.setValue('custbody_da_to_meant_for_pp',true);
                }
                    
                    
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });