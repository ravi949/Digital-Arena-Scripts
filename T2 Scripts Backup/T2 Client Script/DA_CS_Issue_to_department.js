/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search, url, currentRecord) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is
         *            being accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */
        var context;

        function pageInit(context) {
            try {
                var subsidiaryId = context.currentRecord.getValue('custrecord_da_issue_mat_dep_subsidiary');
               // console.log('sub', sub);
                var costCenterSearch = search.create({
                    type: 'department',

                    filters: [
                        ['subsidiary', 'anyof', subsidiaryId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "name"
                        })                       
                    ]

                });

                var dept = context.currentRecord.getField({
                    fieldId: 'custpage_select_departmet'
                });

                costCenterSearch.run().each(function(result) {
                    dept.insertSelectOption({
                        value: result.id,
                        text: result.getValue('name')
                    });
                    return true;
                });

                var department = context.currentRecord.getValue('custrecord_da_issue_mat_dep_department');
                console.log('department', department);

                context.currentRecord.setValue('custpage_select_departmet', department);


            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(context) {


            try {

                //set Avarage value in the sublist based on location in the item record
                if (context.fieldId == 'custrecord_da_issue_mat_item' || context.fieldId == 'custrecord_da_issue_mat_dep_location') {
                  console.log('dasf');

                    var sublist = context.currentRecord.getSublist({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id'
                    });
                    var itemname = context.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                        fieldId: 'custrecord_da_issue_mat_item',
                        line: 0

                    });
                    var location = context.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                        fieldId: 'custrecord_da_issue_mat_dep_location',
                        line: 0

                    });
                    var locationSearch = search.create({
                        type: 'item',

                        filters: [
                            ['inventorylocation', 'ANYOF', location],
                            "AND",
                            ['internalid', 'ANYOF', itemname]
                        ],
                        columns: [search.createColumn({
                            name: "locationaveragecost"
                        })]
                    });
                    var avgValue;
                    locationSearch.run().each(function(result) {
                        avgValue = result.getValue({
                            name: 'locationaveragecost'
                        });
                        console.log('avgValue', avgValue);
                        return true;
                    });
                    if (avgValue) {
                        var avgAmt = context.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                            fieldId: 'custrecord_da_issue_mat_dep_unit_price',
                            value: avgValue,
                            ignoreFieldChange: true
                        });
                    } else {
                        var avgAmt = context.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                            fieldId: 'custrecord_da_issue_mat_dep_unit_price',
                            value: 0.00,
                            ignoreFieldChange: true
                        });
                    }

                }



                console.log(qty);
                if (context.fieldId == 'custrecord_da_issue_mat_dep_qty') {
                    var total = 0;
                    var qty = context.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                        fieldId: 'custrecord_da_issue_mat_dep_qty'
                    });
                    var unitPrice = context.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                        fieldId: 'custrecord_da_issue_mat_dep_unit_price'
                    });
                    console.log('qty', qty);
                    total = parseFloat(qty) * parseFloat(unitPrice);
                    console.log('total', total);
                    var totalAmt = context.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_issue_mat_dep_id',
                        fieldId: 'custrecord_da_issue_mat_dep_total',
                        value: total,
                        ignoreFieldChange: true
                    });
                }


                //Department setting through scripted feild
               /* if (context.fieldId == 'custrecord_da_issue_mat_dep_subsidiary') {
                    var subsidiaryId = context.currentRecord.getValue('custrecord_da_issue_mat_dep_subsidiary');
                    console.log('sub', subsidiaryId);
                    var costCenterSearch = search.create({
                        type: 'department',

                        filters: [
                            ['subsidiary', 'anyof', subsidiaryId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "name"
                            })                       
                        ]

                    });

                    var dept = context.currentRecord.getField({
                        fieldId: 'custpage_select_departmet'
                    });
                 dept.removeSelectOption({
    value: null,
});

                    costCenterSearch.run().each(function(result) {
                        dept.insertSelectOption({
                            value: result.id,
                            text: result.getValue('name')
                        });
                        return true;
                    });
                }
                if (context.fieldId == 'custpage_select_departmet') {

                    var department = context.currentRecord.getValue('custpage_select_departmet');
                    console.log('department', department);

                    context.currentRecord.setValue('custrecord_da_issue_mat_dep_department', department);
                }*/
            } catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        /**
         * Function to be executed when field is slaved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * 
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or
         * edited.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {



        }

        /**
         * Function to be executed after line is selected.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @returns {boolean} Return true if field is valid
         * 
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is
         * committed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         * 
         * @since 2015.2
         */
        function saveRecord(context) {
           
            return true;
        }




        return {
          //  pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
        };

    });