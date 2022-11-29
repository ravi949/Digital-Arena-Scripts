/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format','N/url'],

    function(search,record,format,url) {

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
    try{
       var type=scriptContext.currentRecord.setValue({
                fieldId: 'custrecord_da_appraisal_type',
                value: 2,
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });
       console.log('type',type);
      //  var appraisalType =scriptContext.currentRecord.getValue('custrecord_da_appraisal_type');
     //  log.debug('appraisalType',appraisalType);
          var setAppraisalSearch =search.create({
            type: 'customrecord_da_set_emp_appraisal',
           
                      columns:
                           [
                           search.createColumn({name: "custrecord_da_set_obj_name"}),
                           search.createColumn({name: "custrecord_da_set_obj_name"}),
                           search.createColumn({name: "custrecord_da_obj_arabic"}),
                           search.createColumn({name: "custrecord_da_obj_weight"}),
                           search.createColumn({name: "custrecord_da_obj_target"}),
                           ]
                 });
          var count = setAppraisalSearch.runPaged().count; 
         
          setAppraisalSearch.run().each(function(result){
      var objName= result.getValue('custrecord_da_set_obj_name');
      var arabicObj= result.getValue('custrecord_da_obj_arabic');
      var weight= result.getValue('custrecord_da_obj_weight');
      var target= result.getValue('custrecord_da_obj_target');
          console.log(objName);
             scriptContext.currentRecord.selectNewLine({
               sublistId: 'recmachcustrecord_da_objective_for_apprisal'
            
               });
      var name=  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'name',
                       value:  objName,
                       forceSyncSourcing: true
                   });
     
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecord_da_app_objective_ar',
                       value:   arabicObj,
                       forceSyncSourcing: true
                   });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecord_da_wight_app',
                       value:   weight,
                       forceSyncSourcing: true
                   });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecordda_target_app',
                       value:   target,
                       forceSyncSourcing: true
                   });
        scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_objective_for_apprisal'
                      });
       log.debug('name',name);
/*else{
       var numLines = scriptContext.currentRecord.getLineCount({
              sublistId: 'recmachcustrecord_da_objective_for_apprisal'
            });
       //log.debug('numLines',numLines);
       for (var i = numLines - 1; i >= 0; i--) {
              scriptContext.currentRecord.removeLine({
                sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                line: i,
                ignoreRecalc: true
              });
            }
     }*/

       return true;
        });
      } catch(ex){
      console.log(ex.name,ex.message);
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
    try{
      if(scriptContext.fieldId == 'custrecord_da_appraisal_type' ){
        
        var appraisalType =scriptContext.currentRecord.getValue('custrecord_da_appraisal_type');
        if(appraisalType== 2){
       // log.debug('appraisalType',appraisalType);
          var setAppraisalSearch =search.create({
            type: 'customrecord_da_set_emp_appraisal',
           
                      columns:
                           [
                           search.createColumn({name: "custrecord_da_set_obj_name"}),
                           search.createColumn({name: "custrecord_da_set_obj_name"}),
                           search.createColumn({name: "custrecord_da_obj_arabic"}),
                           search.createColumn({name: "custrecord_da_obj_weight"}),
                           search.createColumn({name: "custrecord_da_obj_target"}),
                           ]
                 });
          var count = setAppraisalSearch.runPaged().count;         
          setAppraisalSearch.run().each(function(result){
      var objName= result.getValue('custrecord_da_set_obj_name');
      var arabicObj= result.getValue('custrecord_da_obj_arabic');
      var weight= result.getValue('custrecord_da_obj_weight');
      var target= result.getValue('custrecord_da_obj_target');
             scriptContext.currentRecord.selectNewLine({
               sublistId: 'recmachcustrecord_da_objective_for_apprisal'
            
               });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'name',
                       value:  objName,
                    ignoreFieldChange: true, 
                    forceSyncSourcing: true
                   });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecord_da_app_objective_ar',
                       value:   arabicObj,
                    ignoreFieldChange: true,
                     forceSyncSourcing: true
                   });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecord_da_wight_app',
                       value:   weight,
                    ignoreFieldChange: true, 
                    forceSyncSourcing: true
                   });
        scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                      fieldId: 'custrecordda_target_app',
                       value:   target,
                    ignoreFieldChange: true,
                     forceSyncSourcing: true
                   });
        scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_objective_for_apprisal'
                      });
       return true;
        });
          }
          else{
       var numLines = scriptContext.currentRecord.getLineCount({
              sublistId: 'recmachcustrecord_da_objective_for_apprisal'
            });
       //log.debug('numLines',numLines);
       for (var i = numLines - 1; i >= 0; i--) {
              scriptContext.currentRecord.removeLine({
                sublistId: 'recmachcustrecord_da_objective_for_apprisal',
                line: i,
                ignoreRecalc: true
              });
            }
     }
       // log.debug("count",count);
        //log.debug("objNameArray",objNameArray);

      
       
            
      }
      
    }catch(ex){
      console.log(ex.name,ex.message);
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
//    postSourcing: postSourcing,
//    sublistChanged: sublistChanged,
//    lineInit: lineInit,
//    validateField: validateField,
//    validateLine: validateLine,
//    validateInsert: validateInsert,
//    validateDelete: validateDelete,
//    saveRecord: saveRecord,
       
  }

});