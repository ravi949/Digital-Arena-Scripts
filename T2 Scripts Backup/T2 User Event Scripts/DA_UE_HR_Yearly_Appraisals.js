/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget','N/search','N/runtime','N/record'],

        function(message,serverWidget,search,runtime,record) {

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
            

            var processing = scriptContext.newRecord.getValue('custrecord_da_app_yearly_calculating');
            if(processing){
                var msgText = message.create({
                    title: "Please Wait", 
                    message: "While the System is calculating the appraisals",  
                    type: message.Type.INFORMATION
                });
                scriptContext.form.addPageInitMessage({message: msgText});
            }

            

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
        
      log.debug('beforeSubmit');
      var ids = scriptContext.newRecord.getFields();
      log.debug('beforeSubmit',ids);
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
        try{

        }catch(ex){
            log.error(ex.name,ex.message);
        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});