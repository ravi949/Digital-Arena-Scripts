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
            var id = scriptContext.newRecord.id;
                var form = scriptContext.form;
                var scriptObj = runtime.getCurrentScript();
            log.debug("Deployment Id: " + scriptObj.deploymentId);
               if(scriptObj.deploymentId == "customdeploy_da_ue_print_button"){
                if(scriptContext.type == 'view'){
                    scriptContext.form.addButton({
                        id : 'custpage_print',
                        label : 'Print',
                        functionName:'openSuiteletForBill("'+scriptContext.newRecord.id+'")'
                    });
                }
             scriptContext.form.clientScriptModulePath = './DA_CS_Print_button.js';                
            }
            
         if(scriptObj.deploymentId == "customdeploy5"){
                if(scriptContext.type == 'view'){
                    scriptContext.form.addButton({
                        id : 'custpage_print',
                        label : 'Print',
                        functionName:'openSuiteletForDeposit("'+scriptContext.newRecord.id+'")'
                    });
                }
            scriptContext.form.clientScriptModulePath = './DA_CS_Print_button.js ';             
            }
          
          if(scriptObj.deploymentId == "customdeploy4"){
                if(scriptContext.type == 'view'){
                    scriptContext.form.addButton({
                        id : 'custpage_print',
                        label : 'Print',
                        functionName:'openSuiteletForCustomerDeposit("'+scriptContext.newRecord.id+'")'
                    });
                  scriptContext.form.clientScriptModulePath = './DA_CS_Print_button.js';
                }
            
                    
            }
             if(scriptObj.deploymentId == "customdeploy7"){
                if(scriptContext.type == 'view'){
                    scriptContext.form.addButton({
                        id : 'custpage_print',
                        label : 'Print',
                        functionName:'openSuiteletForinventory("'+scriptContext.newRecord.id+'")'
                    });
                 scriptContext.form.clientScriptModulePath = './DA_CS_Print_button.js';
                }
            
                    
            }
            if(scriptObj.deploymentId == "customdeploy6"){
                if(scriptContext.type == 'view'){
                    scriptContext.form.addButton({
                        id : 'custpage_print',
                        label : 'Print',
                        functionName:'openSuiteletForVendorCredit("'+scriptContext.newRecord.id+'")'
                    });
                  scriptContext.form.clientScriptModulePath = './DA_CS_Print_button.js';
                }
            
                    
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