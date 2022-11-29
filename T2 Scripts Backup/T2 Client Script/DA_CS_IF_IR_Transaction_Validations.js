/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url', 'N/https'],
    function(search, url, https) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode, subsidiaryExists = false;

        function pageInit(scriptContext) {

            mode = scriptContext.mode;
        }
        /**
         * Function to be executed when field is changed.
         *
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
              
               if(scriptContext.fieldId == 'custrecord_da__trans_inv_detail_item'){
 						var location = scriptContext.currentRecord.getValue('custbody_da_lot_custom_location');
                      
                        if(location){
                          scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId : 'recmachcustrecord_da_inventory_detail_trans',
                            fieldId :'custrecord_da_trans_inv_detail_location',
                            value : location
                          })
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
        function postSourcing(scriptContext) {}
        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {}
        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {}
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
        function validateField(scriptContext) {}
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
        function validateLine(scriptContext) {}
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
        function validateInsert(scriptContext) {}
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
        function validateDelete(scriptContext) {}
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

                var itemLc = scriptContext.currentRecord.getLineCount('item');
              
              console.log(scriptContext.currentRecord.type);
              
              var sublistId;
              
              if(scriptContext.currentRecord.type == "itemfulfillment" || scriptContext.currentRecord.type == "itemreceipt"){
                sublistId = "item";
              }

                var itemsObj = {};
                var lotInvNosArray = [];

                for (var i = 0; i < itemLc; i++) {
                    var lot = scriptContext.currentRecord.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custcol_da_tran_item_lot',
                        line: i
                    });

                    var itemReceive = scriptContext.currentRecord.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'itemreceive',
                        line: i
                    });

                    console.log(lot);

                    if (lot == true && itemReceive == true) {
                        var itemID = scriptContext.currentRecord.getSublistValue({
                            sublistId: sublistId,
                            fieldId: 'item',
                            line: i
                        });
                        console.log(itemID);
                        var qty = scriptContext.currentRecord.getSublistValue({
                            sublistId: sublistId,
                            fieldId: 'quantity',
                            line: i
                        });

                        var index = 0;
                        
                            for (var j = 0; j < lotInvNosArray.length; j++) {
                                var objInvNo = lotInvNosArray[j];

                                console.log(lotInvNosArray);

                                console.log('check', itemID == objInvNo.itemID);
                                if (itemID == objInvNo.itemID) {
                                    var availQty = objInvNo.qty;
                                    console.log('availQtyy', availQty);

                                    var finalQty = parseFloat(availQty) + parseFloat(qty);
                                    console.log(finalQty);
                                    console.log(j);
                                    lotInvNosArray[j].qty = finalQty;
                                    console.log(lotInvNosArray);
                                    index = 1;
                                }
                            }

                        if (index == 0) {
                            console.log(index);

                            var obj = {'itemID' :itemID, 'qty' : qty};
                            lotInvNosArray.push(obj);

                        }
                    }
                }

                console.log(lotInvNosArray);

                var customlotInvNosArray =[];

                var customLineCount = scriptContext.currentRecord.getLineCount('recmachcustrecord_da_inventory_detail_trans');
              
              console.log(customLineCount);
              
                if(customLineCount == 0 || customLineCount == -1){
                  //return true;
                }

                for (var i = 0; i < customLineCount; i++) {
                    var lot = scriptContext.currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_da_inventory_detail_trans',
                        fieldId: 'custrecord_da_transaction_lot_item',
                        line: i
                    });

                    console.log(lot);

                    if (lot == true) {
                        var itemID = scriptContext.currentRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_da_inventory_detail_trans',
                            fieldId: 'custrecord_da__trans_inv_detail_item',
                            line: i
                        });
                        console.log(itemID);
                        var qty = scriptContext.currentRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_da_inventory_detail_trans',
                            fieldId: 'custrecord_da_trans_inv_detail_quantity',
                            line: i
                        });

                        var index = 0;
                        
                            for (var j = 0; j < customlotInvNosArray.length; j++) {
                                var objInvNo = customlotInvNosArray[j];

                                console.log(customlotInvNosArray);

                                console.log('check', itemID == objInvNo.itemID);
                                if (itemID == objInvNo.itemID) {
                                    var availQty = objInvNo.qty;
                                    console.log('availQtyy', availQty);

                                    var finalQty = parseFloat(availQty) + parseFloat(qty);
                                    console.log(finalQty);
                                    console.log(j);
                                    customlotInvNosArray[j].qty = finalQty;
                                    console.log(customlotInvNosArray);
                                    index = 1;
                                }
                            }

                        if (index == 0) {
                            console.log(index);

                            var obj = {'itemID' :itemID, 'qty' : qty};
                            customlotInvNosArray.push(obj);

                        }
                    }
                }

                console.log(customlotInvNosArray);

                console.log(isEqual(lotInvNosArray, customlotInvNosArray));
              
              if(isEqual(lotInvNosArray, customlotInvNosArray)){
                return true;
              }else{
                alert("Please configure the lots");
                return false;
              }

                
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        function isEqual(value, other) {

                // Get the value type
                var type = Object.prototype.toString.call(value);

                // If the two objects are not the same type, return false
                if (type !== Object.prototype.toString.call(other)) return false;

                // If items are not an object or array, return false
                if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

                // Compare the length of the length of the two items
                var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
                var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
                if (valueLen !== otherLen) return false;

                // Compare two items
                var compare = function (item1, item2) {

                    // Get the object type
                    var itemType = Object.prototype.toString.call(item1);

                    // If an object or array, compare recursively
                    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                        if (!isEqual(item1, item2)) return false;
                    }

                    // Otherwise, do a simple comparison
                    else {

                        // If the two items are not the same type, return false
                        if (itemType !== Object.prototype.toString.call(item2)) return false;

                        // Else if it's a function, convert to a string and compare
                        // Otherwise, just compare
                        if (itemType === '[object Function]') {
                            if (item1.toString() !== item2.toString()) return false;
                        } else {
                            if (item1 !== item2) return false;
                        }

                    }
                };

                // Compare properties
                if (type === '[object Array]') {
                    for (var i = 0; i < valueLen; i++) {
                        if (compare(value[i], other[i]) === false) return false;
                    }
                } else {
                    for (var key in value) {
                        if (value.hasOwnProperty(key)) {
                            if (compare(value[key], other[key]) === false) return false;
                        }
                    }
                }

                // If nothing failed, return true
                return true;

            };
        return {
            pageInit: pageInit,
           fieldChanged: fieldChanged,
            //      postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            //      lineInit: lineInit,
            //      validateField: validateField,
            //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
            saveRecord: saveRecord,
        };
    });