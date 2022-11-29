/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/currentRecord', 'N/url'],

    function(record, currentRecord, url) {


        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            try {
                var buySpecificItem = scriptContext.currentRecord.getValue('custrecord_da_buy_specific_item');
                console.log('buySpecificItem',buySpecificItem);
                
                    var objField = scriptContext.currentRecord.getField({
                        fieldId: 'custrecord_da_enforce_item_list'
                    });
                    var objSublist = scriptContext.currentRecord.getSublist({
                        sublistId: 'recmachcustrecord_da_promotion_parent'
                    });
                    if(buySpecificItem == false){
                        objField.isDisplay = false;
                        objSublist.isDisplay = false;
                }
                var couponCodeType = scriptContext.currentRecord.getValue('custrecord_da_coupon_code_type');
                console.log('couponCodeType',couponCodeType);
                    var couponCodeSublist = scriptContext.currentRecord.getSublist({
                        sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                    });
                    if(couponCodeType == 3 || couponCodeType == 1){
                        couponCodeSublist.isDisplay = false;
                    }
                    else{
                        couponCodeSublist.isDisplay = true;
                }

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed when field is changed.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {
                if(scriptContext.fieldId == "custrecord_da_buy_specific_item"){
                    var buySpecificItem = scriptContext.currentRecord.getValue('custrecord_da_buy_specific_item');
                console.log('buySpecificItem1',buySpecificItem);
                    var objSublist = scriptContext.currentRecord.getSublist({
                        sublistId: 'recmachcustrecord_da_promotion_parent'
                    });
                    if(buySpecificItem == true){
                        objSublist.isDisplay = true;
                    }
                    else{
                        objSublist.isDisplay = false;
                }
                }
                if(scriptContext.fieldId == "custrecord_da_coupon_code_type"){
                    var couponCodeType = scriptContext.currentRecord.getValue('custrecord_da_coupon_code_type');
                console.log('couponCodeType',couponCodeType);
                    var couponCodeSublist = scriptContext.currentRecord.getSublist({
                        sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                    });
                    if(couponCodeType == 3 || couponCodeType == 1){
                        couponCodeSublist.isDisplay = false;
                    }
                    else{
                        couponCodeSublist.isDisplay = true;
                }
                }
                
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            try {} catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try {
                var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'recmachcustrecord_da_parent_promotion_schedule'
                        });
                console.log('numLines', numLines);
                if(numLines > 0){
                    log.debug(numLines);
                       var day = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_da_parent_promotion_schedule',
                                fieldId: 'custrecord_da_scheduling_day',
                                line: 0
                            });
                       console.log('day',day);
                       if(day){
                        return true;
                       }
                       else{
                        var timeFrom = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_da_parent_promotion_schedule',
                                fieldId: 'custrecord_da_scheduling_time_from',
                                line: 0
                            });
                       console.log('timeFrom',timeFrom);
                       if(timeFrom){
                        return true;
                       }
                       else{
                        var timeTo = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_da_parent_promotion_schedule',
                                fieldId: 'custrecord_da_scheduling_time_to',
                                line: 0
                            });
                       console.log('timeTo',timeTo);
                       if(timeTo){
                        return true;
                    }
                    else{
                        alert('Please Enter Schedular Information');
                    }
                       }
                   }
                } else {
                    return true; 
                }
                

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
             saveRecord: saveRecord
        };

    });