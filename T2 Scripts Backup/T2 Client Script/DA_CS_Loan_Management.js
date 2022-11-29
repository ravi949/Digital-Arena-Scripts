/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format'],

        function(search,record,format) {

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
        try{

            if(scriptContext.fieldId == 'custrecord_da_loan_origination_date'){

                var paymentFrequency =  scriptContext.currentRecord.getValue('custrecord_da_loan_pay_back');
               
                var noOfPeriods = scriptContext.currentRecord.getValue('custrecord_da_loan_no_of_periods');

                if(paymentFrequency == 1){
                    var originationDate = scriptContext.currentRecord.getValue('custrecord_da_loan_origination_date');

                    var date = new Date(originationDate).getDate();
                    var month = new Date(originationDate).getMonth()+ 1;
                   // console.log(date+" month "+ month);
                   // console.log(isLastDay(originationDate));
                  
                    if(isLastDay(originationDate)){
                          var tomorrow = originationDate;
                          tomorrow.setDate(originationDate.getDate()+1);
                      	  //console.log(tomorrow);
                      	  var lastDayOftheMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth() + 1, 0, 23, 59, 59);
                          console.log(lastDayOftheMonth);
                          scriptContext.currentRecord.setValue('custrecord_da_loan_initial_payment_date', lastDayOftheMonth);
                      
                      	 //second date setting
                      	 var dateforNextMonths = new Date(lastDayOftheMonth.setMonth(lastDayOftheMonth.getMonth()+(noOfPeriods-1)));
                         console.log(dateforNextMonths);
                          var month = dateforNextMonths.getMonth() + 1;
                          var year = dateforNextMonths.getFullYear();
                          console.log(month+"year"+year);
                          console.log(daysInMonth(month, year));
                      var noOfDaysInMonth = daysInMonth(month, year);
                      dateforNextMonths = dateforNextMonths.setDate(noOfDaysInMonth);
                      console.log(dateforNextMonths);
                       scriptContext.currentRecord.setValue('custrecord_da_loan_maturity_date', new Date(dateforNextMonths));
                      }else{
                        var date = originationDate.getDate();
                        var d = originationDate;
						d.setMonth(d.getMonth() + 1, 1);
                        console.log(d);
                        console.log(new Date(originationDate).getDate());
 					    d.setDate(date);
                        console.log(d);
                        scriptContext.currentRecord.setValue('custrecord_da_loan_initial_payment_date', d);
                        console.log('d'+d);
                        d = new Date(d.setMonth(originationDate.getMonth()+(noOfPeriods-1)));
                        //d.setMonth(d.getMonth() + 1, 5);
                         console.log('d'+d);
                         scriptContext.currentRecord.setValue('custrecord_da_loan_maturity_date', d);
                      }

                }
              
              if(paymentFrequency == 2){
                var originationDate = scriptContext.currentRecord.getValue('custrecord_da_loan_origination_date');
                var oneYearFromNow = originationDate;
				oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                scriptContext.currentRecord.setValue('custrecord_da_loan_initial_payment_date', oneYearFromNow);                
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + (noOfPeriods-1));
                scriptContext.currentRecord.setValue('custrecord_da_loan_maturity_date', oneYearFromNow);
              }
            }
        }catch(ex){
            console.log(ex.name,ex.message);
        }

    }
  
    function isLastDay(dt) {
      var test = new Date(dt.getTime()),
          month = test.getMonth();

      test.setDate(test.getDate() + 1);
      return test.getMonth() !== month;
 	 }
  
  function daysInMonth (month, year) { 
                return new Date(year, month, 0).getDate(); 
            } 

    function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
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

    }

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
//      saveRecord: saveRecord,
	
    };

});