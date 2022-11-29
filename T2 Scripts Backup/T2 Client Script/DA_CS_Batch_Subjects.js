/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
	function(search, record) {
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
              
              var batchId = scriptContext.currentRecord.getValue('custrecord_da_amm_batch_parent');
					var subjectId = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_name');
					var beauticianId = scriptContext.currentRecord.getValue('custrecord_da_amm_beauitician_name');
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_batch',
						value: batchId
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_sub_name',
						value: subjectId
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_beauitician_name',
						value: beauticianId
					});
            } catch (ex) {
				console.log(ex.error, ex.message);
			}
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
                if (scriptContext.fieldId == 'custrecord_da_amm_tt_batch_time_from') {
                          var timeFrom = scriptContext.currentRecord.getCurrentSublistText({
                              sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
                              fieldId: 'custrecord_da_amm_tt_batch_time_from'
                          });
                  
                  console.log(timeFrom);
                  var suffix = timeFrom.split(" ")[1];
                  
                   var timeFromHrs = timeFrom.split(" ")[0].split(":")[0];
                  var timeFromMins = timeFrom.split(" ")[0].split(":")[1];
                  if(suffix == "PM"){
                    var timeFromHrs = timeFrom.split(" ")[0].split(":")[0];
                    timeFromHrs = parseFloat(timeFromHrs)+ parseFloat(12);
                  }
                  
                  var d = new Date();
				  d.setHours(timeFromHrs,timeFromMins,0,0);
                  console.log(d);
                  var timetoMins = addMinutes(d, 90).getMinutes();
                  var timeToHrs = addMinutes(d, 90).getHours();
                  
                  console.log(timetoMins+"timeToHrs"+timeToHrs);
                   scriptContext.currentRecord.setCurrentSublistText({
                              sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
                              fieldId: 'custrecord_da_amm_tt_time_to',
                     		  text: (timeToHrs+":"+timetoMins),
                              ignoreFieldChange: true,
                              forceSyncSourcing: true
                          });
                  //scriptContext.currentRecord.setText('', timeToHrs+":"+timetoMins);

                }
				if (scriptContext.fieldId == 'custrecord_da_select_dates') {
					var selectedDate = scriptContext.currentRecord.getText('custrecord_da_select_dates');
					var alreadySelectedDates = scriptContext.currentRecord.getValue('custrecord_da_batch_selected_dates');
					console.log(alreadySelectedDates);
					if (alreadySelectedDates) {
						scriptContext.currentRecord.setValue('custrecord_da_batch_selected_dates', alreadySelectedDates + "," + selectedDate);
					} else {
						scriptContext.currentRecord.setValue('custrecord_da_batch_selected_dates', selectedDate);
					}
				}
				if (scriptContext.fieldId == 'custrecord_da_amm_subject_frequency') {
					var option = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_frequency');
					if (option == 4) {
						var batchId = scriptContext.currentRecord.getValue('custrecord_da_amm_batch_parent');
						var subjectId = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_name');
						var beauticianId = scriptContext.currentRecord.getValue('custrecord_da_amm_beauitician_name');
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
							fieldId: 'custrecord_da_amm_tt_batch',
							value: batchId
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
							fieldId: 'custrecord_da_amm_tt_sub_name',
							value: subjectId
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
							fieldId: 'custrecord_da_amm_tt_beauitician_name',
							value: beauticianId
						});
					}
				}
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
  
  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}
		/**
		 * Function to be executed when field is slaved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord -. Current form record
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
				if (scriptContext.sublistId == 'recmachcustrecord_da_amm_tt_batch_subject') {
					var batchId = scriptContext.currentRecord.getValue('custrecord_da_amm_batch_parent');
					var subjectId = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_name');
					var beauticianId = scriptContext.currentRecord.getValue('custrecord_da_amm_beauitician_name');
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_batch',
						value: batchId
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_sub_name',
						value: subjectId
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_da_amm_tt_batch_subject',
						fieldId: 'custrecord_da_amm_tt_beauitician_name',
						value: beauticianId
					});
				}
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
		function validateLine(scriptContext) {
			try {
              var lineCount =  scriptContext.currentRecord.getLineCount({
                 sublistId:'recmachcustrecord_da_amm_tt_batch_subject'
              });
              console.log(lineCount);
              //lineCount = parseFloat(lineCount) + parseFloat(1);
              var qty = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_qauntity');
              if(lineCount > qty){
                alert("Sorry, You are exceeding the sessions");
                return false;
              }else{
                return true;
              }
               
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
              var lineCount =  scriptContext.currentRecord.getLineCount({
                 sublistId:'recmachcustrecord_da_amm_tt_batch_subject'
              });
              console.log(lineCount);
             // lineCount = parseFloat(lineCount) + parseFloat(1);
              
              var qty = scriptContext.currentRecord.getValue('custrecord_da_amm_subject_qauntity');
              if(lineCount < qty){
                alert("Sorry, You are entered less sessions");
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
			fieldChanged: fieldChanged,
			//      postSourcing: postSourcing,
			//      sublistChanged: sublistChanged,
			lineInit: lineInit,
			//      validateField: validateField,
			validateLine: validateLine,
			//      validateInsert: validateInsert,
			//      validateDelete: validateDelete,
			saveRecord: saveRecord,
			//   openSubjectRecords:openSubjectRecords,
		};
	});