/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime'],

function(runtime) {
   
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
        try{
          
          var userObj = runtime.getCurrentUser();
log.debug('Internal ID of current user role: ' + userObj.role);
            if(scriptContext.type == 'view' && (userObj.role == 1066 || userObj.role == 1070 ||  userObj.role == 1075)){              
                scriptContext.form.addButton({
                     id : 'custpage_print',
                     label : 'Hold Loan',
                     functionName:'openSuitelet("'+scriptContext.newRecord.id+'")'
                });
            }
            scriptContext.form.clientScriptModulePath = './DA_CS_HR_Loan_Validations.js';
            
        }catch(ex){
            log.error(ex.name,ex.message);
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

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});