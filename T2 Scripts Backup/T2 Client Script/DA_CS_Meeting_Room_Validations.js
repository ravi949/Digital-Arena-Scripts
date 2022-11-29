/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],

    function(record, search, runtime) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */

        var mode;

        function pageInit(scriptContext) {
            mode = scriptContext.mode;
        }

        function redirectToBack() {

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
            console.log('validateLine');
            return true;

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

                var date = scriptContext.currentRecord.getText('custrecord_da_reservation_date');

                var fromTime = scriptContext.currentRecord.getText('custrecord_da_from_date_meet_room');
                var amorpm = fromTime.split(" ")[1];
                var totaltimehrs = parseFloat(fromTime.split(':')[0]);
                var totaltimemns = parseFloat(fromTime.split(':')[1]);

                if (amorpm == 'pm') {
                    totaltimehrs = parseFloat(totaltimehrs) + parseFloat(12);
                }

                if (totaltimemns < 10) {
                    totaltimemns = "0" + totaltimemns;
                }

                var fromTimeValue = Number(totaltimehrs + "" + totaltimemns);

                var toTime = scriptContext.currentRecord.getText('custrecord_da_to_date_meet_reserv');
                var amorpm = toTime.split(" ")[1];
                console.log(amorpm);
                var totaltimehrs = parseFloat(toTime.split(':')[0]);
                var totaltimemns = parseFloat(toTime.split(':')[1]);

                if (amorpm == 'pm') {
                    totaltimehrs = parseFloat(totaltimehrs) + parseFloat(12);
                }

                if (totaltimemns < 10) {
                    totaltimemns = "0" + totaltimemns;
                }

                //console.log(Number(totaltimehrs + "" + totaltimemns));

                var toTimeValue = Number(totaltimehrs + "" + totaltimemns);

                var customrecordda_meeting_room_reservSearchObj = search.create({
                    type: "customrecordda_meeting_room_reserv",
                    filters: [
                        ["custrecord_da_reservation_date", "on", date],"AND",["custrecord_da_rooms_meet_reserv", "anyof", scriptContext.currentRecord.getValue('custrecord_da_rooms_meet_reserv')],"AND",["custrecord_da_status_meet_reserv","anyof", 2]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_from_date_meet_room",
                            label: "from"
                        }),
                        search.createColumn({
                            name: "custrecord_da_to_date_meet_reserv",
                            label: "To Time"
                        })
                    ]
                });
                

                if(mode == 'edit'){
                    customrecordda_meeting_room_reservSearchObj.filters.push(search.createFilter({
                        "name"    : "internalid",
                        "operator": "noneof",
                        "values"  : scriptContext.currentRecord.id
                    }));
                }

                var searchResultCount = customrecordda_meeting_room_reservSearchObj.runPaged().count;
                log.debug("customrecordda_meeting_room_reservSearchObj result count", searchResultCount);
                var allow = true;
                customrecordda_meeting_room_reservSearchObj.run().each(function(result) {
                    var fromTime = result.getValue('custrecord_da_from_date_meet_room');
                    console.log(fromTime);

                    var amorpm = fromTime.split(" ")[1];
                    console.log(amorpm);
                    var totaltimehrs = parseFloat(fromTime.split(':')[0]);
                    var totaltimemns = parseFloat(fromTime.split(':')[1]);

                    if (amorpm == 'pm') {
                        totaltimehrs = parseFloat(totaltimehrs) + parseFloat(12);
                    }

                    if (totaltimemns < 10) {
                        totaltimemns = "0" + totaltimemns;
                    }

                    var fromTimeSearchValue = Number(totaltimehrs + "" + totaltimemns);

                    var toTime = result.getValue('custrecord_da_to_date_meet_reserv');
                    var amorpm = toTime.split(" ")[1];
                    var totaltimehrs = parseFloat(toTime.split(':')[0]);
                    var totaltimemns = parseFloat(toTime.split(':')[1]);

                    if (amorpm == 'pm') {
                        totaltimehrs = parseFloat(totaltimehrs) + parseFloat(12);
                    }

                    if (totaltimemns < 10) {
                        totaltimemns = "0" + totaltimemns;
                    }

                    var toTimeSearchValue = Number(totaltimehrs + "" + totaltimemns);

                    console.log('fromTimeValue'+ fromTimeValue);
                    console.log('fromTimeSearchValue'+ fromTimeSearchValue);
                    console.log('toTimeValue'+ toTimeValue);
                    console.log('toTimeSearchValue'+ toTimeSearchValue);

                    if ((fromTimeValue < fromTimeSearchValue) && (fromTimeSearchValue < toTimeValue)) {
                        console.log('sf');
                        allow = false;
                        alert("Sorry, Meeting room already resereved");
                        return false;
                    }

                    if ((fromTimeValue < toTimeSearchValue) && (toTimeSearchValue < toTimeValue)) {
                        console.log('dadawr');
                        allow= false;
                        alert("Sorry, Meeting room already resereved");
                        return false;
                    }



                    return true;

                });

                if(allow){
                    return true;
                }else{
                    return false;
                }

                

            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            //        validateField: validateField,
            //   validateLine: validateLine,
            //        validateInsert: validateInsert,
            //        validateDelete: validateDelete,
            saveRecord: saveRecord,
            redirectToBack: redirectToBack
        };

    });