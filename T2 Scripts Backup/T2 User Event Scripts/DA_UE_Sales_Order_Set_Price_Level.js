/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record', 'N/error'],

    function(message, serverWidget, search, runtime, record) {

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
              
              if(scriptContext.type == "view"){
                var processing = scriptContext.newRecord.getValue('custbody_da_inventory_detail_set');
                if (processing) {
                  log.debug(true);
                    var msgText = message.create({
                        title: "Please Wait",
                        message : "While the system setting up inventory details",
                        type :  message.Type.INFORMATION
                    });
                  
                  msgText
                 // msgText.show();
                    scriptContext.form.addPageInitMessage({
                        message: msgText
                    });
                }
            }
              if(scriptContext.type == "create" || scriptContext.type == "edit"){
                var sublist = scriptContext.form.getSublist({
                    id : 'item'
                });
                log.debug('sublist',sublist);
                var sublistField = sublist.addField({
                    id: 'custpage_pricelevel',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Price Level'
                });
                log.debug('sublistField',sublistField);
                sublistField.addSelectOption({
                        value: " ",
                        text: " "
                    });
                var userObj = runtime.getCurrentUser();
                log.debug('userObj',userObj);
                var internalId = userObj.id;
                log.debug("Internal ID of current user Business Unit: " + userObj.id);
                log.debug('internalId',internalId);
                var objRecord = record.load({
                    type: 'employee',
                    id: internalId
                });
                log.debug('objRecord', objRecord);
                var businessUnit = objRecord.getValue('class');
                log.debug('businessUnit',businessUnit);
                var priceLevelSettingsSearch = search.create({
                        type: "customrecord_da_price_level_settings",
                        filters:
                         [
                            ["custrecord_da_price_level_business","anyof",businessUnit]
                         ],
                         columns: [
                            'custrecord_da_price_level'
                        ]
                    });
                    var searchResultCount = priceLevelSettingsSearch.runPaged().count;
                    log.debug("priceLevelSettingsSearch result count", searchResultCount);
                    var priceLevel, priceValue;
                    priceLevelSettingsSearch.run().each(function(result) {
                        priceLevel = result.getText('custrecord_da_price_level');
                        log.debug('priceLevel',priceLevel);
                        priceValue = result.getValue('custrecord_da_price_level');
                        log.debug('priceValue',priceValue);
                    sublistField.addSelectOption({
                        value: priceValue,
                        text: priceLevel
                    });
                    
                    return true;
                    });
              }
                    

            } catch (ex) {
                log.error(ex.name, ex.message)
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