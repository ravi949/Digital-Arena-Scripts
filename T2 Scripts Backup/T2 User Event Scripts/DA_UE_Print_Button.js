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
			log.debug('id',id);
			var type = scriptContext.newRecord.type;
			log.debug('type',type);
			if(type == 'inventoryadjustment'){
				var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:'OpenPrint('+id+')'
				});
			}
				if(type == 'workorder'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:'PrintButton('+id+')'
				});
				var PickListButton = scriptContext.form.addButton({
					id: 'custpage_picklist_print',
					label: 'Pick List Print',
                    functionName:'PickListPrint('+id+')'
				});
				}
				if(type == 'assemblybuild'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:'AssemblyBuildPrint('+id+')'
				});
				}
				if(type == 'vendorreturnauthorization'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:'VendorReturnPrint('+id+')'
				});
				}
				if(type == 'transferorder'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Transfer Order Print',
                    functionName:'TransferOrderPrint('+id+')'
				});
				}
				if(type == 'itemfulfillment'){
                  var shipStatus = scriptContext.newRecord.getValue('shipstatus');
                  log.debug('shipStatus',shipStatus);
                  if(shipStatus == "C"){
                    var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'IF Print',
                    functionName:'IFfromTransOrderPrint('+id+')'
				});
                  }
				}
				if(type == 'itemreceipt'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'IR Print',
                    functionName:'IRfromTransOrderPrint('+id+')'
				});
				}
				if(type == 'vendorpayment'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print Bill Payment',
                    functionName:"BillPaymentPrint('" + id + "','" + type + "')"
				});
				}
				if(type == 'vendorprepayment'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:"VendorPrePaymentPrint('" + id + "','" + type + "')"
				});
				}
				if(type == 'vendorbill'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:"VendorBillPrint('" + id + "','" + type + "')"
				});
				}
				if(type == 'vendorcredit'){
					var printButton = scriptContext.form.addButton({
					id: 'custpage_print',
					label: 'Print',
                    functionName:"BillCreditPrint('" + id + "','" + type + "')"
				});
				}
				
                 scriptContext.form.clientScriptModulePath = './DA_CS_Print_Button_2.js';
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