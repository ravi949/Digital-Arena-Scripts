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
          var temp=0;
            var scriptObj = runtime.getCurrentScript();
			log.debug("Deployment Id: " + scriptObj.deploymentId);
          var userObj = runtime.getCurrentUser().role;
log.debug('Internal ID of current user: ', userObj);
          var withCostRoles = [1203,1217,1214,1213,1210,1209,1192,1191,1187,1186,1183,1182,1181,1180,1179,1178,1177,1176,1175,1174,1173,1172,1171,1170,1169,1167,1166,3];
          var withoutCostRoles =[1215,1201,1200,1199,1198,1197,1196,1190,1189,1162,1155,1131,1114,1108,1107,1105,1104,1100,1099,1087,1084,1081,1080,56,48,28,27,25,24,23,19,16,14,1217,1214,1213,1210,1209,1192,1191,1187,1186,1183,1182,1181,1180,1179,1178,1177,1176,1175,1174,1173,1172,1171,1170,1169,1167,1166,3];
         
    		if(scriptContext.type == 'view'){
               if(scriptObj.deploymentId == "customdeploy_ameeri_ue_ir_print"){
                 for(var i=0;i<withCostRoles.length;i++)
                {
                    if(withCostRoles[i]==userObj)
         {
             scriptContext.form.addButton({
    				 id : 'custpage_print',
    				 label : 'Print With Cost',
    				 functionName:'openSuitelet("'+scriptContext.newRecord.id+'")'
    			});
         }
     }
                 for(var i=0;i<withoutCostRoles.length;i++)
                {
                    if(withoutCostRoles[i]==userObj)
         {
                 scriptContext.form.addButton({
    				 id : 'custpage_print1',
    				 label : 'Print Without Cost',
    				 functionName:'openSuitelet1("'+scriptContext.newRecord.id+'")'
    			});
            }
                }
               }
              
              if(scriptObj.deploymentId == "customdeploy_ameeri_check_print"){
                 scriptContext.form.addButton({
    				 id : 'custpage_print',
    				 label : 'Print',
    				 functionName:'openCheckSuitelet("'+scriptContext.newRecord.id+'")'
    			});
               }
              if(scriptObj.deploymentId == "customdeploy_transfer_order"){
                scriptContext.form.addButton({
    				 id : 'custpage_print',
    				 label : 'Print',
    				 functionName:'openTransferSuitelet("'+scriptContext.newRecord.id+'")'
    			});
              }
    			
    		}
    		//scriptContext.form.clientScriptModulePath = './Ameer_CS_Create_WO.js';
    		scriptContext.form.clientScriptFileId = 83366;
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
