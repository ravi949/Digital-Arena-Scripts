/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/format', 'N/currentRecord'],

    function(search, record, format, currentRecord) {


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
                //alert('triggered');
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
                var totalAmt = 0;
                var amountAfterPercent = 0;
                if (scriptContext.fieldId == 'custrecord_da_landed_cost_lcm') {
                    var lcmAllocLandedCost = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_landed_cost_lcm'
                    });
                    console.log('lcmAllocLandedCost', lcmAllocLandedCost);
                    var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'item'
                        });
                console.log('numLines', numLines);

                for(var j = 0; j < numLines; j++){
                    var itemLandedCost = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'landedcostcategory',
                                line: j
                            });
                    console.log('itemLandedCost',itemLandedCost);
                    if(itemLandedCost == lcmAllocLandedCost){
                        var itemAmt = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: j
                            });
                    console.log('itemAmt',itemAmt);
                    totalAmt = parseFloat(totalAmt) + parseFloat(itemAmt);
                    console.log('totalAmt1',totalAmt);
                    }
                    console.log('totalAmt2',totalAmt);
                }
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_lc_amount',
                        value: totalAmt,
                        ignoreFieldChange: true
                    });

                }
                if (scriptContext.fieldId == 'custrecord_da_percentage_lcm') {
                    var lcmAllocPercentage = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_percentage_lcm'
                    });
                    console.log('lcmAllocPercentage', lcmAllocPercentage);
                    var lcmAllocAmount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_lc_amount'
                    });
                    console.log('lcmAllocAmount', lcmAllocAmount);
                    amountAfterPercent = parseFloat(lcmAllocAmount) * ((lcmAllocPercentage)/100);
                        log.debug('amountAfterPercent',amountAfterPercent);
                        scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_amount_percent',
                        value: amountAfterPercent,
                        ignoreFieldChange: true
                    });
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
            try {
                

            } catch (ex) {
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
                if (scriptContext.sublistId == 'recmachcustrecord_da_allocated_lcm_onbill') {
                    var lcmAllocLandCost = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_landed_cost_lcm'
                    });
                    console.log('lcmAllocLandCost', lcmAllocLandCost);
                    var lcmAllocAmount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_amount_percent'
                    });
                    console.log('lcmAllocAmount', lcmAllocAmount);
                    var lcmAllocIR = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_lcm_allocate_ir'
                    });
                    console.log('lcmAllocIR', lcmAllocIR);
                    var lcmAllocated = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                        fieldId: 'custrecord_da_lcm_allocate'
                    });
                    console.log('lcmAllocated', lcmAllocated);
                    if(lcmAllocated == true){
                        if(lcmAllocLandCost.length > 0){
                            if(lcmAllocAmount.length > 0){
                                if(lcmAllocIR.length > 0){
                                    return true;
                                } else{
                                alert('Please enter value for Item Receipt');
                                return false;
                                }
                            } else {
                                alert('Please enter value for Amount');
                                return false;
                            }
                        } else {
                            alert('Please enter value for Landed Cost Category');
                                return false;
                        }
                        
                    } else{
                        return true;
                    }
                } return true;
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
        function saveRec(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            //postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
             validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            //saveRecord: saveRecord

        };

    });