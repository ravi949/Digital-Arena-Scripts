/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/url'],

    function(record, search, url) {

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
  
  function openSuitelet(recID){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_da_su_hr_hold_loans',
			deploymentId: 'customdeploy_da_su_hr_hold_loans',
			params:{				
				'recid':recID
			}
		});
		console.log(suiteletUrl);
		window.open(window.location.origin+""+suiteletUrl, "_self");
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

                var employeeId = scriptContext.currentRecord.getValue('custrecord_da_employee_loan');
              
              var type = scriptContext.currentRecord.getValue('custrecord_da_payroll_item_loan');

               var customrecord_da_hr_loan_installmentSearchObj = search.create({
                   type: "customrecord_da_hr_loan_installment",
                   filters:
                   [
                      ["custrecord_da_installment_date","onorafter","nextoneyear"], 
                      "AND", 
                      ["custrecord_da_hr_loan_id.custrecord_da_employee_loan","anyof",employeeId],"AND",
                     ["custrecord_da_hr_loan_id.custrecord_da_payroll_item_loan","anyof", type]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "id",
                         sort: search.Sort.ASC,
                         label: "ID"
                      }),
                      search.createColumn({name: "scriptid", label: "Script ID"}),
                      search.createColumn({name: "custrecord_da_loan_sequence", label: "Sequence"}),
                      search.createColumn({name: "custrecord_da_installment_date", label: "Installment Date "}),
                      search.createColumn({name: "custrecord_da_installment_amount_hr", label: "Installment Amount"}),
                      search.createColumn({name: "custrecord_da_hr_hold_loan", label: "Hold Loan"}),
                      search.createColumn({name: "custrecord_da_hr_loan_paid", label: "Paid"}),
                   ]
                });
                var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                log.debug("customrecord_da_hr_loan_installmentSearchObj result count",searchResultCount);
                if(searchResultCount > 0){
                    alert('Sorry , you cant apply loan');
                    return false;
                }else{
                    return true;
                }

                

            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        return {
            pageInit: pageInit,
         //   fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            //        validateField: validateField,
            //   validateLine: validateLine,
            //        validateInsert: validateInsert,
            //        validateDelete: validateDelete,
            saveRecord: saveRecord,
            openSuitelet: openSuitelet
        };

    });