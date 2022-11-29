/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget'],

        function(message,serverWidget) {

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
            
            if(scriptContext.type == 'create' || scriptContext.type == 'edit'){
              
              var subjectField = scriptContext.form.getField({id: 'custrecord_da_revise_batch_subject_names'});

				subjectField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
                scriptContext.form.addField({
                    id : 'custpage_subjects',
                    type : serverWidget.FieldType.MULTISELECT,
                    label : 'Subjects'
                });
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
        log.debug('beforeSubmit','beforeSubmit');
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
    
    function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});